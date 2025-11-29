import React, { useContext, useState } from "react";
import { AppContext } from "../context/context";
import { NavLink } from "react-router-dom";
import { Search, Briefcase } from "lucide-react";

const GigCard = ({ gig }) => {
  const { _id, title, images, price, userId } = gig;

  return (
    <NavLink to={`/singlegig/${_id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transform hover:scale-[1.03] hover:shadow-xl transition-all duration-400 ease-in-out">
        {/* Image */}
        <div className="w-full h-48 overflow-hidden">
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-grow">
            {title}
          </h3>
          <p className="text-gray-500 text-sm">By {userId.name}</p>

          {/* Price */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-gray-600 text-sm">Starting at</span>
            <span className="font-bold text-gray-800">${price}</span>
          </div>

          {/* Hover Button */}
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 ease-in-out mt-4">
            <div className="bg-gray-800 text-white text-center font-semibold rounded-xl py-3 w-full">
              View Gig
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

const MyGigs = () => {
  const { state } = useContext(AppContext);
  const { gigs: allGigs } = state;

  const userId = localStorage.getItem("userId"); // current logged-in user
  const myGigs = allGigs ? allGigs.filter((gig) => gig.userId._id === userId) : [];

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const uniqueCategories = myGigs
    ? [...new Set(myGigs.map((gig) => gig.category))]
    : [];

  const filteredGigs = myGigs.filter((gig) => {
    const matchesTitle = gig.title.toLowerCase().includes(title.toLowerCase());
    const matchesCategory = category ? gig.category === category : true;
    return matchesTitle && matchesCategory;
  });

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            My Gigs
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-500">
            Manage and showcase the gigs you’ve uploaded.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
          <div className="relative w-full md:w-2/5 lg:w-1/3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Search my gigs..."
              className="w-full px-5 py-3 pl-12 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all duration-300"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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

        {/* Gigs Grid */}
        {filteredGigs && filteredGigs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredGigs.map((gig, index) => (
              <div
                key={gig._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GigCard gig={gig} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700">
              No Gigs Found
            </h3>
            <p className="text-gray-500 mt-2">
              You haven’t uploaded any gigs yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
