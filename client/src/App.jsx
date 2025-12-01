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
import MyCourses from './pages/MyCourses'
import MyGigs from './pages/MyGigs'
import Payment from './pages/Payment'

function App() {

  return (
    <BrowserRouter>
      <Appprovider>
        <Navbar />
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Simple Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/check" element={<Check />} />
          <Route path="/upload" element={<UploadCourse />} />
          <Route path="/singlecourse/:id" element={<SingleCourse />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/edit-course" element={<EditCourse />} />
          <Route path="/earn" element={<EarnHome />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/uploadgig" element={<UploadGig />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/singlegig/:id" element={<SingleGig />} />
          <Route path="/orders" element={<Orders />} />

          {/* Public */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/mycourses" element={<MyCourses />} />
          <Route path="/mygigs" element={<MyGigs />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>

      </Appprovider>
    </BrowserRouter>
  )
}

export default App;
