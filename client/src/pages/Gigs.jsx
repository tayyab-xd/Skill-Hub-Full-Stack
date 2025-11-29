import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/context";
import { NavLink } from "react-router-dom";

// --- Gig Card Component ---
const GigCard = ({ gig }) => {
  const { _id, title, description, category, price, deliveryTime, images } =
    gig;

  return (
    <NavLink to={`/singlegig/${_id}`} className="block group animate-fade-in-up">
      <div
        className="
          bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col
          transform hover:scale-[1.03] hover:shadow-xl 
          transition-all duration-400 ease-in-out cursor-pointer
        "
      >
        {/* Image Container */}
        <div className="w-full h-48 overflow-hidden">
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        </div>

        {/* Content Container */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex-grow">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full mb-3">
              {category}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {title}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {description.slice(0, 90)}
              {description.length > 90 && "..."}
            </p>
          </div>

          {/* Footer of Card */}
          <div className="flex items-center justify-between mt-auto">
            <p className="text-xs text-gray-400">{deliveryTime} day delivery</p>
            <span className="text-xl font-extrabold text-gray-800">
              ${price}
            </span>
          </div>

          {/* Hover Button */}
          <div
            className="
              opacity-0 group-hover:opacity-100 
              transform translate-y-4 group-hover:translate-y-0
              transition-all duration-300 ease-in-out mt-4"
          >
            <div className="bg-gray-800 text-white text-center font-semibold rounded-xl py-3 w-full">
              View Details
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

// --- Main Gigs Page Component ---
const Gigs = () => {
  const { state } = useContext(AppContext);
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (state.gigs) {
      setGigs(state.gigs);
    }
  }, [state.gigs]);

  // Extract unique categories
  const categories = ["All", ...new Set(state.gigs?.map((g) => g.category))];

  // Filter gigs based on search & category
  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(search.toLowerCase()) ||
      gig.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || gig.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Discover Our Gigs
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-500">
            Find the perfect service from our talented community of freelancers.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-10">
          <input
            type="text"
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-1/4 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Gigs Grid */}
        {filteredGigs.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGigs.map((gig, index) => (
              <div key={gig._id} style={{ animationDelay: `${index * 100}ms` }}>
                <GigCard gig={gig} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No gigs match your search. Try different keywords or categories!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
