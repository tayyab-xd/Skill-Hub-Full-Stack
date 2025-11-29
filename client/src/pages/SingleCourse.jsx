import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil, Lock } from 'lucide-react';

const ModernButton = ({ children, onClick, disabled = false, variant = 'primary', className = '' }) => {
    const baseStyles = `w-full px-6 py-3 font-semibold rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2`;
    const variants = {
        primary: `bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800 ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 ${disabled ? 'bg-red-400 cursor-not-allowed' : ''}`,
        ghost: `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400`,
    };
    return <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</button>;
};

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
    </div>
);

function SingleCourse() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useContext(AppContext);
    
    const [course, setCourse] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [enrolled, setEnrolled] = useState(false);
    const [isCourseOwner, setIsCourseOwner] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const foundCourse = state.courses.find((item) => item._id === id);
        if (foundCourse) {
            setCourse(foundCourse);
            const isOwner = state.profileData?._id === foundCourse.userId._id;
            setIsCourseOwner(isOwner);
            if (isOwner) {
                setEnrolled(true);
            } else {
                const isEnrolled = foundCourse.students.some(student => student.userId === state.profileData?._id);
                setEnrolled(isEnrolled);
            }
        }
    }, [state.courses, state.profileData, id]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/${id}/reviews`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setComments(response.data.reviews || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    useEffect(() => {
        if (id) fetchComments();
    }, [id]);

    const handleEnroll = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/course/enroll/${course._id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setEnrolled(true);
            toast.success("Successfully enrolled!");
        } catch (error) {
            toast.error("Enrollment failed. Please try again.");
        }
    };

    const handleLeaveCourse = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/course/leavecourse/${course._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setEnrolled(false);
            toast.success("You have left the course.");
        } catch (error) {
            toast.error("Failed to leave the course.");
        }
    };

    const handleUploadComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/course/${id}/reviews`, { newComment }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setNewComment('');
            fetchComments(); // Re-fetch comments to show the new one
            toast.success("Review submitted!");
        } catch (error) {
            toast.error("Error submitting review.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/course/deletecomment/${course._id}/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setComments(prev => prev.filter(c => c._id !== commentId));
            toast.success("Comment deleted.");
        } catch (error) {
            toast.error("Failed to delete comment.");
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm("Are you sure you want to delete this course permanently?")) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/course/deletecourse/${course._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success("Course deleted successfully.");
            navigate('/courses');
        } catch (error) {
            toast.error("Failed to delete the course.");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!course) return <LoadingSpinner />;
    return (
        <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
                    
                    {/* --- Left Column: Video & Reviews --- */}
                    <main className="lg:col-span-2 space-y-8">
                        {/* Video Player */}
                        <div className="bg-black rounded-2xl shadow-lg overflow-hidden relative animate-fade-in-up">
                            {!enrolled && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4 z-10">
                                    <Lock className="w-12 h-12 text-gray-700 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900">Enroll to Watch</h3>
                                    <p className="text-gray-600">You must enroll in this course to access the video content.</p>
                                </div>
                            )}
                            <video
                                controls={enrolled}
                                className={`w-full aspect-video ${!enrolled ? 'filter blur-sm' : ''}`}
                                src={course.video}
                                poster={course.thumbnail}
                            />
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <h3 className="text-2xl font-bold text-gray-900">Student Reviews ({comments.length})</h3>
                            {enrolled && (
                                <form onSubmit={handleUploadComment} className="flex items-start gap-4">
                                    <input
                                        type="text"
                                        onChange={(e) => setNewComment(e.target.value)}
                                        value={newComment}
                                        placeholder="Leave a review..."
                                        className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300"
                                    />
                                    <button type="submit" className="px-6 py-3 font-semibold text-white bg-gray-800 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out">Submit</button>
                                </form>
                            )}
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {comments.length > 0 ? (
                                        [...comments].reverse().map((item) => (
                                            <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-100/70 p-5 rounded-xl">
                                                <div className="flex items-start gap-4">
                                                    <img src={item.userId.profilePic} alt="User" className="w-11 h-11 rounded-full object-cover" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">{item.userId.name}</h4>
                                                                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            {state.profileData?._id === item.userId._id && (
                                                                <button onClick={() => handleDeleteComment(item._id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700 mt-2">{item.comment}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : <p className="text-gray-500 text-center py-4">No reviews yet. Be the first!</p>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </main>

                    {/* --- Right Sidebar: Course Details --- */}
                    <aside className="lg:sticky lg:top-8 h-fit animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-5">
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">{course.category}</span>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{course.title}</h1>
                            <p className="text-gray-600">{course.description}</p>
                            
                            <div className="border-t border-gray-200 pt-5">
                                <p className="font-semibold text-gray-800 mb-3">About the Instructor</p>
                                <div className="flex items-center gap-4">
                                    <img src={course.userId.profilePic} alt="Instructor" className="w-14 h-14 rounded-full object-cover" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{course.userId.name}</h3>
                                        <p className="text-sm text-gray-500">{course.userId.designation || 'Instructor'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-5 space-y-3">
                                {isCourseOwner ? (
                                    <>
                                        <p className="text-sm text-center font-medium text-blue-600 bg-blue-100 p-2 rounded-lg">You are the owner of this course.</p>
                                        <div className="flex gap-3">
                                            <ModernButton onClick={() => navigate(`/edit-course`, { state: { id: course._id } })} variant="ghost"><Pencil size={16} className="inline mr-2"/>Edit</ModernButton>
                                            <ModernButton onClick={handleDeleteCourse} disabled={deleteLoading} variant="danger"><Trash2 size={16} className="inline mr-2"/>{deleteLoading ? 'Deleting...' : 'Delete'}</ModernButton>
                                        </div>
                                    </>
                                ) : (
                                    <ModernButton onClick={enrolled ? handleLeaveCourse : handleEnroll}>
                                        {enrolled ? 'Leave Course' : 'Enroll Now'}
                                    </ModernButton>
                                )}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

export default SingleCourse;