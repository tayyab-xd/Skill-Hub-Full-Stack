import React, { useContext, useState } from "react";
import { AppContext } from "../context/context";
import { NavLink } from 'react-router-dom';
import { Search } from "lucide-react";

const CourseCard = ({ course }) => {
  const { _id, title, thumbnail, userId } = course;

  return (
    <NavLink to={`/singlecourse/${_id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transform hover:scale-[1.03] hover:shadow-xl transition-all duration-400 ease-in-out">
        {/* Image Container */}
        <div className="w-full h-48 overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        </div>
        
        {/* Content Container */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-grow">{title}</h3>
          <p className="text-gray-500 text-sm">
            By {userId.name}
          </p>
          
          {/* Hover Button */}
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 ease-in-out mt-4">
            <div className="bg-gray-800 text-white text-center font-semibold rounded-xl py-3 w-full">
              Start Learning
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

const CoursesPage = () => {
  const { state, dispatch } = useContext(AppContext);
  const { filterCourses: courses, courses: allCourses } = state;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  const uniqueCategories = allCourses ? [...new Set(allCourses.map(course => course.category))] : [];

  const handleTitleFilter = (e) => {
    const value = e.target.value;
    setTitle(value);
    dispatch({ type: 'FILTER_TITLE', payload: value });
  };

  const handleCategoryFilter = (e) => {
    const value = e.target.value;
    setCategory(value);
    dispatch({ type: 'FILTER_CATEGORY', payload: value });
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Explore Courses</h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-500">
            Find your next learning adventure. Search by title or filter by category.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
          <div className="relative w-full md:w-2/5 lg:w-1/3">
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleTitleFilter}
              placeholder="Search courses by title..."
              className="w-full px-5 py-3 pl-12 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <select
            value={category}
            onChange={handleCategoryFilter}
            className="w-full md:w-auto px-5 py-3 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course, index) => (
              <div key={course._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">No Courses Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;