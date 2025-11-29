import { useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModernButton = ({ children, type = "button", disabled = false, className = '' }) => (
  <button
    type={type}
    disabled={disabled}
    className={`
      w-full px-6 py-3 font-semibold text-white bg-gray-800 rounded-xl
      shadow-md hover:shadow-lg
      transform hover:-translate-y-0.5
      transition-all duration-300 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800
      ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-900'}
      ${className}
    `}
  >
    {children}
  </button>
);

const UploadIcon = () => (
  <svg className="w-10 h-10 mb-4 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "title" && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));

    setImages(prevImages => [...prevImages, ...selectedFiles]);
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.description.trim().split(" ").length < 20) {
      toast.error("Description must be at least 20 words long.");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image for your gig.");
      return;
    }
    if (formData.price < 1000) {
      toast.error("Price must be at least 1000.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    images.forEach(image => data.append('image', image));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/gig/creategig`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success("Gig uploaded successfully!");
      setFormData({ title: '', description: '', category: '', price: '', deliveryTime: '' });
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while uploading.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300";

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Gig</h1>
        <p className="text-gray-500 mb-8">Fill out the details below to showcase your service.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Gig Title</label>
            <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., I will design a modern minimalist logo" className={inputClasses} />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Describe your gig in detail..." className={inputClasses}></textarea>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputClasses}>
                <option value="">Select a category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
             <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">Price ($)</label>
              <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="e.g., 50" className={inputClasses} />
            </div>
          </div>
          
          <div>
            <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-600 mb-1">Delivery Time (in days)</label>
            <input id="deliveryTime" type="number" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} required placeholder="e.g., 3" className={inputClasses} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Upload Images</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors duration-300">
              <div className="space-y-1 text-center">
                <UploadIcon />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-gray-800 hover:text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} multiple accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600">Image Previews:</h3>
              <div className="flex gap-4 mt-2 flex-wrap">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative">
                    <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-700 transition-transform hover:scale-110">&times;</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <ModernButton type="submit" disabled={loading}>
              {loading ? 'Uploading Gig...' : 'Create Gig'}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadGig;
