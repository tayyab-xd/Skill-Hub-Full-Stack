import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import { Appprovider } from './context/context';
import "react-toastify/dist/ReactToastify.css";
import Learn from './pages/Learn'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UploadCourse from './pages/UploadCourse'
import Navbar from './components/Navbar'
import Courses from './pages/Courses'
import SingleCourse from './pages/SingleCourse';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import EditCourse from './pages/EditCourse';
import EarnHome from './pages/EarnHome';
import UploadGig from './pages/UploadGig';
import Gigs from './pages/Gigs';
import SingleGig from './pages/SingleGig';
import Orders from './pages/Orders';
import Check from './pages/Check';
import AdminPage from './pages/Admin';
import ResetPassword from './pages/Resetpassword';
import MyCourses from   './pages/MyCourses'
import MyGigs from   './pages/MyGigs'
import Payment from   './pages/Payment'

function App() {
  const token = localStorage.getItem("token");


  return (
    <BrowserRouter>
      <Appprovider>
        <Navbar />
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* Protected Routes */}
          <Route path='/admin' element={token ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path='/courses' element={token ? <Courses /> : <Navigate to="/login" replace />} />
          <Route path='/check' element={token ? <Check /> : <Navigate to="/login" replace />} />
          <Route path='/upload' element={token ? <UploadCourse /> : <Navigate to="/login" replace />} />
          <Route path='/singlecourse/:id' element={token ? <SingleCourse /> : <Navigate to="/login" replace />} />
          <Route path='/profile/:id' element={token ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path='/edit-profile' element={token ? <EditProfile /> : <Navigate to="/login" replace />} />
          <Route path='/edit-course' element={token ? <EditCourse /> : <Navigate to="/login" replace />} />
          <Route path='/earn' element={token ? <EarnHome /> : <Navigate to="/login" replace />} />
          <Route path='/learn' element={token ? <Learn /> : <Navigate to="/login" replace />} />
          <Route path='/uploadgig' element={token ? <UploadGig /> : <Navigate to="/login" replace />} />
          <Route path='/gigs' element={token ? <Gigs /> : <Navigate to="/login" replace />} />
          <Route path='/singlegig/:id' element={token ? <SingleGig /> : <Navigate to="/login" replace />} />
          <Route path='/orders' element={token ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/mycourses' element={<MyCourses />} />
          <Route path='/mygigs' element={<MyGigs />} />
          <Route path='/payment' element={<Payment />} />
        </Routes>
      </Appprovider>
    </BrowserRouter>
  )
}

export default App;
