import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify';

function Signup() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ name: '', email: '', password: '' })
  const handleInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData();
    formData.append('name', user.name)
    formData.append('email', user.email)
    formData.append('password', user.password)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const successSound = new Audio('../public/success.mp3');
      successSound.play()
      toast.success("SignUp successful! ");
      navigate('/login')
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg);
      } else {
        console.log(error);
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl font-bold text-center mb-6 animate-fadeIn">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text" name='name'
              value={user.name} onChange={handleInput}
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email" name='email'
              value={user.email} onChange={handleInput}
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password" name='password'
              value={user.password} onChange={handleInput}
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded-md font-semibold text-white hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-500 transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
