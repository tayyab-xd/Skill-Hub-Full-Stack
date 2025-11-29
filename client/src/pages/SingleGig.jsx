import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Star, Pencil, Trash2 } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const ModernButton = ({ children, onClick, disabled = false, variant = 'primary', className = '' }) => {
    const baseStyles = `w-full px-6 py-3 font-semibold rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2`;
    const variants = {
        primary: `bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800 ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`,
        secondary: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 ${disabled ? 'bg-blue-400 cursor-not-allowed' : ''}`,
    };
    return <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</button>;
};

const StarRating = ({ rating, totalReviews }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
                {[...Array(fullStars)].map((_, i) => <Star key={`f-${i}`} fill="currentColor" size={20} />)}
                {halfStar && <Star key="h" fill="currentColor" className="text-yellow-400" size={20} />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`e-${i}`} className="text-gray-300" fill="currentColor" size={20} />)}
            </div>
            {totalReviews > 0 && (
                <p className="text-sm text-gray-600 font-semibold">{rating} <span className="font-normal text-gray-500">({totalReviews} reviews)</span></p>
            )}
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div></div>
);


function SingleGig() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useContext(AppContext);

    const [gig, setGig] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteGig = async () => {
        if (!window.confirm("Are you sure you want to delete this gig?")) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/gig/deletegig/${gig._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            toast.success("Gig deleted successfully.");
            navigate("/"); 
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete gig.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const isOwner = gig && state.profileData?._id === gig.userId._id;
    const gigOrder = state.profileData?.gigOrders?.find(item => item.gig === id);
    const hasUserReviewed = reviews.some(review => review.userId._id === state.profileData?._id);
    const averageRating = reviews.length > 0 ? (reviews.reduce((acc, item) => acc + item.stars, 0) / reviews.length).toFixed(1) : 0;

    useEffect(() => {
        const foundGig = state.gigs.find(item => item._id === id);
        setGig(foundGig);
    }, [state.gigs, id]);

    const fetchReviews = async () => {
        if (!id) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/gig/get-reviews/${id}`);
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id]);

    const handleRequestOrder = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/gig/order/create-order`, {
                gig: gig._id,
                buyer: state.profileData._id,
                seller: gig.userId._id,
                initialMessage: `Hey ${gig.userId.name}, can I get more information?`
            });
            toast.success("Order request sent! You can now chat with the seller.");
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to send order request.");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/gig/delete-review/${reviewId}/${gig._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            toast.success("Your review has been deleted.");
            fetchReviews(); // Refresh reviews list
        } catch (error) {
            toast.error("Failed to delete review.");
        }
    };

    if (!gig) return <LoadingSpinner />;

    return (
        <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">

                    {/* Left Column: Images, Description, Reviews */}
                    <main className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
                            <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} loop={true} autoplay={{ delay: 4000 }}>
                                {gig.images.map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <img src={img} alt={`Gig image ${i + 1}`} className="w-full h-auto aspect-[16/10] object-cover" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <h2 className="text-2xl font-bold text-gray-900">About This Gig</h2>
                            <p className="text-gray-600 leading-relaxed">{gig.description}</p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                                {!isOwner && !hasUserReviewed && (
                                    <button onClick={() => setShowReviewModal(true)} className="font-semibold text-blue-600 hover:text-blue-800 transition">Add Review</button>
                                )}
                            </div>
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-gray-100/70 p-5 rounded-xl">
                                            <div className="flex items-start gap-4">
                                                <img src={review.userId.profilePic} alt="user" className="w-11 h-11 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{review.userId.name}</h4>
                                                            <div className="flex text-yellow-400 mt-1">{[...Array(review.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-gray-500">{moment(review.createdAt).fromNow()}</p>
                                                            {review.userId._id === state.profileData?._id && <button onClick={() => handleDeleteReview(review._id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"><Trash2 size={16} /></button>}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500 text-center py-4">No reviews for this gig yet.</p>}
                        </div>
                    </main>

                    {/* Right Sidebar: Order Info */}
                    <aside className="lg:sticky lg:top-8 h-fit animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-5">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{gig.title}</h1>
                            <StarRating rating={averageRating} totalReviews={reviews.length} />

                            <div className="border-t border-gray-200 pt-5">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-semibold text-gray-800">Delivery Time</p>
                                    <p className="text-gray-600">{gig.deliveryTime} Days</p>
                                </div>
                                <div className="flex justify-between items-baseline mt-2">
                                    <p className="font-semibold text-gray-800">Price</p>
                                    <p className="text-2xl font-bold text-gray-900">${gig.price}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-5 space-y-3">
                                {isOwner ? (
                                    <>
                                        <p className="text-sm text-center font-medium text-blue-600 bg-blue-100 p-3 rounded-xl">This is your gig. Manage it from your dashboard.</p>
                                        <div className="flex gap-3">
                                            {/* <ModernButton onClick={() => navigate(`/edit-course`, { state: { id: course._id } })} variant="ghost"><Pencil size={16} className="inline mr-2" />Edit</ModernButton> */}
                                            {/* <ModernButton onClick={handleDeleteGig} disabled={deleteLoading} variant="danger"><Trash2 size={16} className="inline mr-2" />{deleteLoading ? 'Deleting...' : 'Delete'}</ModernButton> */}
                                        </div>                                    </>
                                ) : (
                                    <ModernButton onClick={gigOrder ? () => navigate('/orders') : handleRequestOrder}>
                                        {gigOrder ? 'Open Chat' : 'Request Order'}
                                    </ModernButton>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-5">
                                <h3 className="font-semibold text-gray-800 mb-3">About the Seller</h3>
                                <div className="flex items-center gap-4">
                                    <img src={gig.userId.profilePic} alt="Seller" className="w-14 h-14 rounded-full object-cover" />
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{gig.userId.name}</h4>
                                        <p className="text-sm text-gray-500">{gig.userId.designation || 'Seller'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {showReviewModal && <ReviewModal gigId={gig._id} setShowModal={setShowReviewModal} onReviewSubmit={fetchReviews} />}
        </div>
    );
}

const ReviewModal = ({ gigId, setShowModal, onReviewSubmit }) => {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReviewSubmit = async () => {
        if (stars === 0 || !comment.trim()) {
            toast.warn("Please provide a star rating and a comment.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/gig/add-review/${gigId}`, { stars, comment }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            toast.success("Thank you for your review!");
            onReviewSubmit();
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in-up">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Leave a Review</h3>
                <div className="flex justify-center gap-2 text-3xl mb-5">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setStars(s)} className={`transition-transform hover:scale-110 ${s <= stars ? 'text-yellow-400' : 'text-gray-300'}`}>
                            <Star fill="currentColor" />
                        </button>
                    ))}
                </div>
                <textarea rows="4" className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <ModernButton onClick={handleReviewSubmit} disabled={loading} className="mt-4">
                    {loading ? "Submitting..." : "Submit Review"}
                </ModernButton>
            </div>
        </div>
    );
};

export default SingleGig;