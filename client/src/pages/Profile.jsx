import { Link } from 'react-router-dom';
import { AppContext } from '../context/context';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiBookOpen, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const ContentCard = ({ item, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
    className="bg-white p-5 rounded-lg border border-gray-200"
  >
    <Link to={`/${type}/${item._id}`} className="group">
      <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
      <p className="text-sm text-gray-500 mb-3">{item.category}</p>
      <div className="flex items-center text-sm font-medium text-blue-600">
        View Details
        <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  </motion.div>
);

const ProfileSection = ({ title, icon, data, type }) => (
  <div className="mt-10">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item) => (
          <ContentCard key={item._id} item={item} type={type} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8 px-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No {title.toLowerCase()} to display.</p>
      </div>
    )}
  </div>
);


function Profile() {
  const context = useContext(AppContext);
  const user = context.state.profileData;

  if (!user) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Loading profile...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Left Column: Profile Card */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
              <div className="flex flex-col items-center space-y-4 text-center">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full ring-4 ring-blue-100"
                />
                
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-blue-600 font-medium">{user.designation}</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {user.bio}
                    </p>
                </div>

                <Link
                  to="/edit-profile"
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  <FiEdit className="mr-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Content */}
          <main className="lg:col-span-3">
            <ProfileSection 
              title="Courses Enrolled"
              icon={<FiBookOpen className="mr-3 text-2xl text-blue-600"/>}
              data={user.coursesEnrolled}
              type="singlecourse"
            />
            
            <ProfileSection 
              title="Your Courses"
              icon={<FiBookOpen className="mr-3 text-2xl text-blue-600"/>}
              data={user.courses}
              type="singlecourse"
            />

            <ProfileSection 
              title="Your Gigs"
              icon={<FiBriefcase className="mr-3 text-2xl text-blue-600"/>}
              data={user.gigs}
              type="singlegig"
            />
          </main>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;