import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Briefcase, MessageSquare, Trash2, Eye } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-5 transform hover:scale-105 transition-transform duration-300">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
            <p className="text-gray-500 font-medium">{title}</p>
        </div>
    </div>
);

const DashboardSection = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-5 border-b border-gray-200">{title}</h2>
        <div className="p-5">
            {children}
        </div>
    </div>
);

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [gigs, setGigs] = useState([]);
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));

    const fetchData = async () => {
        if(isAdmin === false){
            navigate('/courses');
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/data`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data.users || []);
            setCourses(res.data.courses || []);
            setGigs(res.data.gigs || []);
            setComments(res.data.comments || []);
        } catch (error) {
            toast.error('Failed to load admin data. You may not have access.');
            navigate('/courses'); 
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to permanently delete this ${type}?`)) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/delete/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
            fetchData(); // Refresh data after deletion
        } catch (error) {
            toast.error(`Failed to delete ${type}.`);
            console.error("Delete error:", error.response?.data || error.message);
        }
    };
    
    return (
        <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl animate-fade-in-up">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Users" value={users.length} icon={<Users className="text-blue-800" />} color="bg-blue-100" />
                    <StatCard title="Total Courses" value={courses.length} icon={<BookOpen className="text-green-800" />} color="bg-green-100" />
                    <StatCard title="Total Gigs" value={gigs.length} icon={<Briefcase className="text-indigo-800" />} color="bg-indigo-100" />
                    {/* <StatCard title="Total Reviews" value={comments.length} icon={<MessageSquare className="text-pink-800" />} color="bg-pink-100" /> */}
                </div>
                
                {/* Data Tables in a responsive grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Courses Section */}
                    <DashboardSection title="Manage Courses">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{course.title}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <button onClick={() => navigate(`/singlecourse/${course._id}`)} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"><Eye size={16}/> View</button>
                                                <button onClick={() => handleDelete('course', course._id)} className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"><Trash2 size={16}/> Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>

                    {/* Gigs Section */}
                    <DashboardSection title="Manage Gigs">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gigs.map((gig) => (
                                        <tr key={gig._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{gig.title}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <button onClick={() => navigate(`/singlegig/${gig._id}`)} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"><Eye size={16}/> View</button>
                                                <button onClick={() => handleDelete('gig', gig._id)} className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"><Trash2 size={16}/> Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>
                </div>
                
                 {/* Users Section (Full Width) */}
                <div className="mt-8">
                    <DashboardSection title="All Users">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Designation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{user.name}</td>
                                            <td className="p-3 text-gray-600">{user.email}</td>
                                            <td className="p-3 text-gray-600">{user.designation || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>
                </div>
            </div>
        </div>
    );
};

export default Admin;