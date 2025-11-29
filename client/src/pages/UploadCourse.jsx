import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModernButton = ({ children, type = "submit", disabled = false, className = '' }) => (
  <button
    type={type}
    disabled={disabled}
    className={`
      w-full px-6 py-3 font-semibold text-white bg-gray-800 rounded-xl
      shadow-md hover:shadow-lg transform hover:-translate-y-0.5
      transition-all duration-300 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800
      ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-900'}
      ${className}
    `}
  >
    {children}
  </button>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-gray-800 h-2.5 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const FileUpload = ({ label, name, accept, onChange, fileName, icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <div className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors duration-300">
      {icon}
      <label htmlFor={name} className="relative cursor-pointer bg-white rounded-md font-medium text-gray-800 hover:text-gray-600">
        <span>Upload a file</span>
        <input id={name} name={name} type="file" className="sr-only" accept={accept} required onChange={onChange} />
      </label>
      <p className="text-xs text-gray-500">or drag and drop</p>
    </div>
    {fileName && (
      <p className="text-sm text-center text-gray-500 truncate">
        Selected: <span className="font-medium text-gray-700">{fileName}</span>
      </p>
    )}
  </div>
);

function UploadCourse() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: null,
    video: null,
  });

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "UI/UX Design",
    "DevOps",
    "Programming Languages",
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      const pollProgress = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/upload-progress`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setProgress(response.data.progress);
          setProgressMessage(response.data.message || 'Processing...');
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      };
      interval = setInterval(pollProgress, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInput = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      const formatted = value.charAt(0).toUpperCase() + value.slice(1);
      setCourseData({ ...courseData, [name]: formatted });
    } else {
      setCourseData({ ...courseData, [name]: value });
    }
  };

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData({ ...courseData, [e.target.name]: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const wordCount = courseData.description.trim().split(/\s+/).length;
    if (wordCount < 20) {
      toast.error("Description must be at least 20 words.");
      return;
    }

    if (!courseData.video || !courseData.thumbnail) {
      toast.error("Please select both a thumbnail and a video file.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setProgressMessage("Starting upload...");

    try {
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("category", courseData.category);
      formData.append("thumbnail", courseData.thumbnail);
      formData.append("video", courseData.video);

      await axios.post(`${import.meta.env.VITE_API_URL}/course/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          setProgressMessage(percentCompleted < 100 ? `Uploading file... ${percentCompleted}%` : 'File uploaded, now processing...');
        }
      });

      toast.success("Course uploaded successfully!");
      setCourseData({ title: "", description: "", category: "", thumbnail: null, video: null });
      setProgress(0);
      setProgressMessage('');

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading course.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300";

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Course</h1>
        <p className="text-gray-500 mb-8">Provide the course details and media files below.</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Left Column: Course Details */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Course Title</label>
              <input 
                id="title" 
                type="text" 
                name="title" 
                value={courseData.title} 
                onChange={handleInput} 
                required 
                placeholder="e.g., introduction to react" 
                className={inputClasses} 
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select 
                id="category" 
                name="category" 
                value={courseData.category} 
                onChange={handleInput} 
                required 
                className={inputClasses}
              >
                <option value="">Select a category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea 
                id="description" 
                name="description" 
                value={courseData.description} 
                onChange={handleInput} 
                required 
                rows="8" 
                placeholder="Describe what this course is about..." 
                className={inputClasses}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Word count: {courseData.description.trim().split(/\s+/).filter(Boolean).length} / 20 minimum
              </p>
            </div>
          </div>

          {/* Right Column: Media Uploads */}
          <div className="space-y-6">
            <FileUpload
              label="Thumbnail Image"
              name="thumbnail"
              accept="image/*"
              onChange={handleMedia}
              fileName={courseData.thumbnail?.name}
              icon={<svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
            />
            <FileUpload
              label="Course Video"
              name="video"
              accept="video/*"
              onChange={handleMedia}
              fileName={courseData.video?.name}
              icon={<svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>}
            />
            
            {/* Progress Bar and Status */}
            {loading && (
              <div className="pt-2 space-y-2">
                <ProgressBar progress={progress} />
                <p className="text-sm text-center font-medium text-gray-600">{progressMessage}</p>
              </div>
            )}
            
            <div className="pt-2">
              <ModernButton type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Course"}
              </ModernButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadCourse;
