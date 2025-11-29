import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/context'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

function EditCourse() {
    const navigate = useNavigate()
    const context = useContext(AppContext)
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [courseData, setCourseData] = useState({})
    const [mediaPreviews, setMediaPreviews] = useState({ thumbnail: null, video: null });
    useEffect(() => {
        if (context.state.courses.length) {
            const found = context.state.courses.find(item => item._id === location.state.id);
            setCourseData(found);
        }
    }, [context.state.courses, location.state.id]);


    const handleInput = (e) => {
        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value
        })
    }
    const handleMedia = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaPreviews({ ...mediaPreviews, [e.target.name]: URL.createObjectURL(file) });
        }
        setCourseData({
            ...courseData,
            [e.target.name]: file
        })
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData();
        formData.append('title', courseData.title);
        formData.append('category', courseData.category);
        formData.append('description', courseData.description);
        formData.append('thumbnail', courseData.thumbnail);
        formData.append('video', courseData.video);

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/course/editcourse/${courseData._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const successSound = new Audio('../public/success.mp3');
            successSound.play()
            toast.success('Course updated successfully!');
            navigate(`/singlecourse/${location.state.id}`)
        } catch (error) {
            console.log(error);
            toast.error('An error occurred while updating the Course.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-0">
                <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-200">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Edit Course</h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Text Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData?.title || ""}
                                    onChange={handleInput}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Enter course title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={courseData?.category || ""}
                                    onChange={handleInput}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="e.g., Web Development, Design, Marketing"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={courseData?.description || ""}
                                    onChange={handleInput}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
                                    placeholder="Write a detailed description of your course..."
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:scale-100"
                                >
                                    {loading ? "Saving Changes..." : "Update Course"}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Media Uploads */}
                        <div className="space-y-6">
                            {/* Thumbnail Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition">
                                <label className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                                    Thumbnail Image
                                </label>

                                <div className="flex items-center justify-center bg-white px-6 py-8 rounded-xl border-2 border-gray-200">
                                    {courseData?.thumbnail || mediaPreviews.thumbnail ? (
                                        <div className="text-center">
                                            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={mediaPreviews.thumbnail || courseData?.thumbnail}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">
                                                {courseData.thumbnail instanceof File ? courseData.thumbnail.name : "Current thumbnail"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm">No thumbnail selected</p>
                                        </div>
                                    )}
                                </div>

                                <label className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl cursor-pointer transition">
                                    {courseData?.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="thumbnail"
                                        onChange={handleMedia}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Video Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition">
                                <label className="block text-lg font-semibold text-gray-700 mb-4 text-center">
                                    Course Video
                                </label>

                                <div className="flex items-center justify-center bg-white px-6 py-8 rounded-xl border-2 border-gray-200">
                                    {courseData?.video || mediaPreviews.video ? (
                                        <div className="text-center">
                                            <div className="w-32 h-32 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-16 h-16 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4 4 0 008 4v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">
                                                {courseData.video instanceof File ? courseData.video.name : "Video uploaded"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm">No video selected</p>
                                        </div>
                                    )}
                                </div>

                                <label className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl cursor-pointer transition">
                                    {courseData?.video ? "Change Video" : "Upload Course Video"}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        name="video"
                                        onChange={handleMedia}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditCourse
