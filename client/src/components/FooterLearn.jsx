import React from 'react';
import { NavLink } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-6 px-6 mt-12">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                {/* Left - Website Name */}
                <h2 className="text-white text-lg font-semibold">LEARN AND EARN</h2>

                {/* Center - Navigation Links */}
                <ul className="flex space-x-6 my-4 md:my-0">
                    <li>
                        <NavLink 
                            to="/learn" 
                            className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/learn/courses" 
                            className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                        >
                            Courses
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/learn/upload" 
                            className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                        >
                            Upload Course
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/earn" 
                            className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                        >
                            Earn Mode
                        </NavLink>
                    </li>
                </ul>

\                <p className="text-sm">
                    Created by <span className="text-blue-500 font-semibold">Muhammad Tayyab</span> © 2025
                </p>
            </div>
        </footer>
    );
}

export default Footer;
