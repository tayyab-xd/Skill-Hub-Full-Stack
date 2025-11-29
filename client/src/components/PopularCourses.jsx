import React, { useContext } from 'react';
import { AppContext } from '../context/context';
import { Link } from 'react-router-dom';

function PopularCourses() {
    const context = useContext(AppContext)
    const courses = context.state.populerCourses
    return (
        <section className="bg-black text-white py-12 px-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Popular Courses</h2>
                <button className="text-blue-500 hover:text-blue-700 transition-colors duration-300">
                    See All →
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {courses && courses.map((item, i) =>
                    <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                        <img src={`https://link.storjshare.io/raw/jw7j5fnc4odgbslvbkhcqqjedesa/skill-hub/${item.thumbnailId}`} alt="Course 1" className="w-full h-40 object-cover rounded-md" />
                        <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                        <p className="text-gray-400 text-sm mt-2">{item.category}</p>
                        <Link to={`/singlecourse/${item._id}`}>
                            <button className="mt-3 bg-blue-500 py-2 px-4 rounded-lg w-full hover:bg-blue-600 transition">
                                View Details
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PopularCourses;
