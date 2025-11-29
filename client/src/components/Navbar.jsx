import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/context';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, User, Briefcase, BookOpen, Repeat, Shield, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const { state, setMode, dispatch } = context;
    const { loggedIn, learnMode: mode } = state;
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name') || 'User';
    const isAdmin = state.profileData?.role === 'admin';

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        dispatch({ type: 'LOGGED_IN', payload: false });
        dispatch({ type: 'PROFILE_DATA', payload: null });
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [navigate]);

    const navLinks = [
        { to: '/admin', text: 'Admin', adminOnly: true },
        { to: mode ? '/courses' : '/gigs', text: mode ? 'Courses' : 'Gigs' },
        { to: mode ? '/upload' : '/uploadgig', text: mode ? 'Upload Course' : 'Upload Gig' },
        { to: '/orders', text: 'Orders' },
    ];

    const filteredNavLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

    const activeLinkClass = "bg-gray-100 text-gray-900";
    const inactiveLinkClass = "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <NavLink to={loggedIn ? (mode ? '/courses' : '/gigs') : '/login'}>
                        <img className='h-14 w-auto' src="/Logo.png" alt="Skill Hub Logo" />
                    </NavLink>

                    {loggedIn && (
                        <div className="hidden md:flex md:items-center md:space-x-2">
                            {filteredNavLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
                                    }
                                >
                                    {link.text}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {loggedIn ? (
                            <div className="relative" ref={profileRef}>
                                {/* Profile Button */}
                                <button
                                    onClick={() => setProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 bg-white rounded-full p-1 pr-3 hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    <img
                                        src={state.profileData?.profilePic}
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                    <span className="hidden sm:inline text-sm font-semibold text-gray-800">{userName}</span>
                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: 'easeOut' }}
                                            className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 origin-top-right"
                                        >
                                            <div className="p-2">
                                                <div className="px-4 py-2 mb-1">
                                                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{state.profileData?.email}</p>
                                                </div>
                                                <div className="border-t my-1 border-gray-200"></div>
                                                <NavLink to={`/profile/${userId}`} onClick={() => setProfileOpen(false)} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                                                    <User size={16} className="mr-3" /> Profile
                                                </NavLink>
                                                <NavLink to={mode ? `/mycourses` : `/mygigs`} onClick={() => setProfileOpen(false)} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                                                    {mode ? <BookOpen size={16} className="mr-3" /> : <Briefcase size={16} className="mr-3" />} My {mode ? 'Courses' : 'Gigs'}
                                                </NavLink>
                                                <div className="border-t my-1 border-gray-200"></div>
                                                <button onClick={() => { setMode(); setProfileOpen(false); }} className="w-full text-left flex items-center px-4 py-2.5 text-sm font-semibold text-blue-600 rounded-lg hover:bg-blue-50">
                                                    <Repeat size={16} className="mr-3" /> Switch to {mode ? 'Selling' : 'Learning'}
                                                </button>
                                                <div className="border-t my-1 border-gray-200"></div>
                                                <button onClick={logout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50">
                                                    <LogOut size={16} className="mr-3" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className='flex items-center space-x-2'>
                                <NavLink to="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">Log In</NavLink>
                                <NavLink to="/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-colors duration-200">Sign Up</NavLink>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && loggedIn && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {filteredNavLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `block px-3 py-2.5 rounded-md text-base font-semibold transition-colors duration-300 ${isActive ? activeLinkClass : inactiveLinkClass}`}
                                >
                                    {link.text}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;