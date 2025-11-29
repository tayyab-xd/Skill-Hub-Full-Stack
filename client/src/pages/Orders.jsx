import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../context/context';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Send, FileText, CircleCheck, CircleX, Clock, BadgeDollarSign, CloudCog, ArrowLeft, MoreVertical } from 'lucide-react'; // Added ArrowLeft
import moment from 'moment';

const ModernButton = ({ children, onClick, disabled = false, variant = 'primary', className = '' }) => {
    const baseStyles = `w-full px-5 py-2.5 font-semibold rounded-xl shadow-sm transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2`;
    const variants = {
        primary: `bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800 ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`,
        success: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-600`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-600`,
    };
    return <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</button>;
};

const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        paid: 'bg-indigo-100 text-indigo-800',
        completed: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        'in progress': 'bg-purple-100 text-purple-800',
    };
    const Icon = {
        pending: Clock,
        accepted: CircleCheck,
        paid: BadgeDollarSign,
        completed: CircleCheck,
        rejected: CircleX,
        'in progress': CloudCog,
    }[status] || Clock;

    return (
        <div className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            <Icon size={16} />
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
    );
};


const Orders = () => {
    const { socket } = useContext(AppContext);
    const userId = localStorage.getItem('userId');

    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const messagesEndRef = useRef(null);
    const [mobileView, setMobileView] = useState('list');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/gig/my-orders/${userId}`);
                setOrders(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load orders.");
            }
        };
        fetchOrders();
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!activeOrder || !socket) return;

        setMessages(activeOrder.conversation);
        socket.emit('joinOrderRoom', activeOrder._id);

        const handleNewMessage = (msg) => {
            if (msg.orderId === activeOrder._id) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [activeOrder?._id, socket]);

    const handleSendMessage = () => {
        if (!text.trim() || !socket || !activeOrder) return;
        const message = { sender: userId, message: text, createdAt: new Date() };
        socket.emit('sendMessage', { orderId: activeOrder._id, message });
        setText('');
    };

    const handleUpdateOrderStatus = async (status) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/gig/order-status-update/${activeOrder._id}`, { status });
            setActiveOrder(response.data.order);
            setOrders(orders.map(o => o._id === response.data.order._id ? response.data.order : o));
            toast.success(`Order has been ${status}.`);
            // window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update order status.");
        }
    };

    const handlePayment = async () => {
        if (!activeOrder) return;
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/gig/create-payment-session/${activeOrder._id}`, {
                amount: activeOrder.gig.price
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const stripe = await loadStripe('pk_test_51RnzMRDBYLX223ATT9Ow4A5zg1yyF3xoPWLPqoIbpm9ijqxZ1BRwbiQ8UqxQKJ366fUDYBkPX64CxMISGbJM1Wfa00yXKu0OeD'); // Ensure this is your actual public key
            if (stripe) {
                await stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                throw new Error("Stripe failed to load.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Payment processing failed.");
        }
    };

    const isSeller = activeOrder?.seller._id === userId;

    const selectOrder = (order) => {
        setActiveOrder(order);
        setMobileView('chat');
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-50 font-sans antialiased overflow-hidden">
            {/* Conversations List (Left) - Visible on mobile by default, hidden when chat/details are active */}
            <div className={`w-full md:w-1/4 bg-white border-r border-gray-200 flex-col ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
                <h2 className="text-2xl font-extrabold p-4 border-b border-gray-200 text-gray-900 sticky top-0 bg-white z-10">Conversations</h2>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                            <FileText size={48} className="mb-3" />
                            <h3 className="text-lg font-semibold">No Orders Yet</h3>
                            <p className="text-sm">Start by placing or receiving an order.</p>
                        </div>
                    )}
                    {orders.map((order) => {
                        const otherParty = order.seller._id === userId ? order.buyer : order.seller;
                        const isActive = activeOrder?._id === order._id;
                        return (
                            <div key={order._id} onClick={() => selectOrder(order)}
                                className={`flex items-center gap-4 p-4 cursor-pointer border-l-4 transition-all duration-200 ${isActive ? 'bg-indigo-50 border-indigo-600' : 'border-transparent hover:bg-gray-50'}`}>
                                <img src={otherParty.profilePic || 'https://via.placeholder.com/48'} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{otherParty.name}</h4>
                                    <p className="text-sm text-gray-500 truncate">{order.gig.title}</p>
                                </div>
                                {/* <StatusBadge status={order.status} /> */}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Box (Middle) - Hidden on mobile by default, shown when mobileView is 'chat' */}
            <div className={`w-full md:w-1/2 bg-white flex-col border-r border-gray-200 ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                {activeOrder ? (
                    <>
                        <div className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                            <button onClick={() => setMobileView('list')} className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600">
                                <ArrowLeft size={24} />
                            </button>
                            <img src={isSeller ? activeOrder.buyer.profilePic : activeOrder.seller.profilePic} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-3" />
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{isSeller ? activeOrder.buyer.name : activeOrder.seller.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{activeOrder.gig.title}</p>
                            </div>
                            <button onClick={() => setMobileView('details')} className="md:hidden p-2 ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                                <MoreVertical size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col max-w-[75%] ${msg.sender === userId ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl break-words shadow-md ${msg.sender === userId ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                        <p className={`text-xs mt-1 px-1 ${msg.sender === userId ? 'text-gray-500' : 'text-gray-500'}`}>{moment(msg.createdAt).fromNow()}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-md sticky bottom-0 z-10">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 transition-colors"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={!text.trim()}
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-50 p-8">
                        <FileText size={64} className="mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold">Select a Conversation</h3>
                        <p className="text-sm">Choose an order from the left panel to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Order Details (Right) - Hidden on mobile by default, shown when mobileView is 'details' */}
            <div className={`w-full md:w-1/4 bg-gray-50 flex-col p-6 pt-0 space-y-6 overflow-y-auto custom-scrollbar ${mobileView === 'details' ? 'flex' : 'hidden md:flex'}`}>
                {activeOrder ? (
                    <>
                        <div className="flex items-center md:hidden p-4 -mx-6 -mt-6 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                            <button onClick={() => setMobileView('chat')} className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600">
                                <ArrowLeft size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-gray-900 flex-1">Order Details</h3>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Order Status</h3>
                            <div className="flex justify-center">
                                <StatusBadge status={activeOrder.status} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Gig Information</h3>
                            {activeOrder.gig.images && activeOrder.gig.images.length > 0 && (
                                <img src={activeOrder.gig.images[0]} alt="gig" className="rounded-lg aspect-video object-cover w-full h-auto border border-gray-100" />
                            )}
                            <h4 className="font-semibold text-gray-800 text-lg">{activeOrder.gig.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{activeOrder.gig.shortDescription}</p>
                            <div className="flex justify-between items-center text-lg pt-2 border-t border-gray-100">
                                <span className="text-gray-600">Price:</span>
                                <span className="font-bold text-gray-900">${activeOrder.gig.price}</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Actions</h3>
                            {isSeller ? (
                                <>
                                    {activeOrder.status === 'pending' && (
                                        <div className="flex flex-col gap-3">
                                            <ModernButton onClick={() => handleUpdateOrderStatus('accepted')} variant="success">
                                                <CircleCheck size={20} /> Accept Order
                                            </ModernButton>
                                            <ModernButton onClick={() => handleUpdateOrderStatus('rejected')} variant="danger">
                                                <CircleX size={20} /> Reject Order
                                            </ModernButton>
                                        </div>
                                    )}
                                    {activeOrder.status === 'accepted' && !activeOrder.paid && <p className="text-sm text-center text-gray-600 italic">Waiting for buyer to complete payment.</p>}
                                    {activeOrder.paid && (activeOrder.status !== 'completed' ?
                                        <ModernButton onClick={() => handleUpdateOrderStatus('in progress')} variant="primary">
                                            <CloudCog size={20} /> Mark In Progress
                                        </ModernButton> :
                                        <p className="text-sm text-center text-green-700 font-medium">Order Completed!</p>
                                    )}
                                    {activeOrder.status === 'in progress' &&
                                        <ModernButton onClick={() => handleUpdateOrderStatus('completed')} variant="success">
                                            <CircleCheck size={20} /> Mark as Completed
                                        </ModernButton>
                                    }
                                </>
                            ) : (
                                <>
                                    {activeOrder.status === 'accepted' && !activeOrder.paid && (
                                        <ModernButton onClick={handlePayment} variant="primary">
                                            <BadgeDollarSign size={20} /> Pay ${activeOrder.gig.price} Now
                                        </ModernButton>
                                    )}
                                    {activeOrder.paid && activeOrder.status !== 'completed' && <p className="text-sm text-center text-gray-600 italic">Payment sent. Waiting for seller to complete the order.</p>}
                                    {activeOrder.status === 'completed' && <p className="text-sm text-center text-green-700 font-medium">Order Completed! Thank you.</p>}
                                    {activeOrder.status === 'pending' && <p className="text-sm text-center text-gray-600 italic">Waiting for seller to accept your order.</p>}
                                    {activeOrder.status === 'rejected' && <p className="text-sm text-center text-red-600 font-medium">Your order was rejected by the seller.</p>}
                                </>
                            )}
                        </div>

                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                        <FileText size={64} className="mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold">Order Details</h3>
                        <p className="text-sm">Details about the selected order will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;