import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AppContext } from '../context/context';
import { motion } from 'framer-motion';
import { FiLogIn } from 'react-icons/fi';

function Login() {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const dispatch = context.dispatch;

  const [user, setUser] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // ← New: for inline error

  const handleInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, user);

      // Success → Show toast + redirect
      toast.success(`Welcome back, ${response.data.name}!`);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('isAdmin', response.data.isAdmin);
      localStorage.setItem('userId', response.data.userId);

      dispatch({ type: 'LOGGED_IN', payload: true });
      navigate('/courses');
    } catch (error) {
      const msg = error.response?.data?.msg || 'Something went wrong';

      // Handle specific known errors WITHOUT toast
      if (msg.includes('not found') || msg.includes('No user') || msg.includes("doesn't exist")) {
        setError('No account found with this email.');
      }
      else if (msg.includes('Incorrect password') || msg.includes('wrong password') || msg.includes('Invalid credentials')) {
        setError('Incorrect password. Please try again.');
      }
      else {
        // For all other errors (network, server down, etc.) → use toast
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="mt-2 text-gray-500">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={user.email}
              onChange={handleInput}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              value={user.password}
              onChange={handleInput}
              className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Inline Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-600 font-medium text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200"
            >
              {error}
            </motion.p>
          )}


          <div className="text-right">
            <Link to="/reset-password" className="text-sm font-medium text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
          >
            <FiLogIn className="mr-2 text-lg" />
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;