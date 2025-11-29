import React, { useContext } from 'react'
import { AppContext } from '../context/context';
import { NavLink } from 'react-router-dom';

function EarnHome() {
  const context = useContext(AppContext)
  const gigs = context.state.gigs
  return (
    <div>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Find Freelancers for Your Next Project</h1>
          <p className="text-gray-400 text-lg">Browse top talent or post a job to get started</p>
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search gigs..."
              className="px-4 py-2 w-full max-w-lg rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {["Web Development", "Graphic Design", "Content Writing", "Video Editing", "Marketing"].map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-700 hover:bg-blue-600 rounded-full transition"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gig Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {gigs && gigs.map((gig,i) => (
            <div key={i} className="bg-gray-800 flex gap-10 rounded-xl p-4 shadow-md hover:shadow-lg transition">
              <img
                src={`https://link.storjshare.io/raw/ju5ctefprllz533uezztsto7qpka/skill-hub/${gig.images[0]}`}
                alt="Gig"
                className=" mb-4 h-20 rounded-md"
              />
              <div>
                <h3 className="text-lg font-semibold">{gig.title}</h3>
                <p className="text-sm text-gray-400 mt-2">by <span className="text-blue-400">{gig.userId.name}</span></p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-400 font-bold">Rs {gig.price}</span>
                </div>
              </div>
              <NavLink to={`/singlegig/${gig._id}`}>
                <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">View</button>
              </NavLink>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default EarnHome
