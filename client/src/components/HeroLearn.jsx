import React from 'react';
import {NavLink} from 'react-router-dom'

function HeroLearn() {
    
    return (
        <section className="bg-black text-white text-center py-20 px-6">
            <h1 className="text-5xl font-extrabold tracking-wide animate-fadeIn">
                Learn new skills online
            </h1>
            <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto animate-fadeIn delay-200">
                Explore a variety of courses to expand your knowledge and advance your career.
            </p>
            <NavLink to={'/courses'}>
            <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md transition-transform transform hover:scale-110 hover:bg-blue-700 shadow-lg">
                Browse Courses
            </button>
            </NavLink>
        </section>
    );
}

export default HeroLearn;
