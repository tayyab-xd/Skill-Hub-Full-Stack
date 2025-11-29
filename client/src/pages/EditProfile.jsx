import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/context";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

const ModernButton = ({ children, onClick, type = "button", disabled = false, variant = 'primary', className = '' }) => {
  const baseStyles = `
    px-6 py-3 font-semibold rounded-xl shadow-md
    transform hover:-translate-y-0.5
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variants = {
    primary: `bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800 ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`,
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400 shadow-none'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

function EditProfile() {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const oldUser = context.state.profileData;

  const [user, setUser] = useState(oldUser || {});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileDelLoading, setProfileDelLoading] = useState(false);

  useEffect(() => {
    if (oldUser) {
      setUser({
        ...oldUser,
        password: "", 
        skills: oldUser.skills || [],
      });
    }
  }, [oldUser]);

  const handleInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1.5,
      initialQuality: 0.8,
      useWebWorker: true,
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, { type: file.type });
      setUser({ ...user, profilePic: compressedFile });
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Failed to compress image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (user.name) formData.append("name", user.name);
    if (user.email) formData.append("email", user.email);
    if (user.bio) formData.append("bio", user.bio);
    if (user.designation) formData.append("designation", user.designation);
    if (user.password) formData.append("password", user.password);
    if (user.profilePic && user.profilePic instanceof File) {
      formData.append("image", user.profilePic);
    }

    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/user/updateUser/${oldUser._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Profile updated successfully!");
      navigate(`/profile/${oldUser._id}`);
    } catch (error) {
      toast.error("An error occurred while updating the profile.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfilePic = async () => {
    setProfileDelLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/user/${oldUser._id}/deleteprofilepic`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser((prev) => ({ ...prev, profilePic: "", profilePicId: "" }));
      setImagePreview(null);
      toast.success("Profile picture removed successfully.");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.msg || "Failed to delete profile picture.");
    } finally {
      setProfileDelLoading(false);
    }
  };

  const profileImageSrc = imagePreview || user.profilePic;

  return (
    <>
      <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-500 mb-8">Update your profile information and picture here.</p>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side: Profile Picture */}
            <div className="flex flex-col items-center md:items-start col-span-1 space-y-4">
              <label className="relative cursor-pointer group w-40 h-40">
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  className="hidden"
                  onChange={handleImage}
                />
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-gray-100 group-hover:border-gray-300 transition-all duration-300 transform group-hover:scale-105"
                  onError={(e) => { e.target.src = "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-300">
                  <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100">
                    Change
                  </span>
                </div>
              </label>
               <ModernButton onClick={deleteProfilePic} disabled={profileDelLoading || !user.profilePicId} variant="danger">
                  {profileDelLoading ? "Deleting..." : "Delete Picture"}
                </ModernButton>
            </div>

            {/* Right Side: Form Fields */}
            <div className="col-span-1 md:col-span-2 space-y-5">
              {/* Form Row for Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                    <input required type="text" value={user.name || ""} name="name" onChange={handleInput} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input required type="email" value={user.email || ""} name="email" onChange={handleInput} className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                <input type="text" value={user.designation || ""} name="designation" onChange={handleInput} placeholder="e.g., Senior Software Engineer" className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input type="password" name="password" onChange={handleInput} placeholder="Leave blank to keep current password" className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
                <textarea value={user.bio || ""} name="bio" onChange={handleInput} placeholder="Tell us a little about yourself" rows="4" className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300"></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <ModernButton onClick={() => navigate(-1)} variant="ghost">
                  Back
                </ModernButton>
                <ModernButton type="submit" disabled={loading} variant="primary">
                  {loading ? "Saving..." : "Save Changes"}
                </ModernButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;