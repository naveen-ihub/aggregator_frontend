import { BrowserRouter as Router, Routes, Route , Navigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Home from "./pages/Home";
import JobDetailedPage from "./pages/JobDetailedPage";
import UserPage from "./pages/UserPage";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/Forgot Password";
import ListJobs from "./pages/ListJobs";
import './App.css'
import Settings from "./pages/Settings";
import ProjectStatsDashboard from "./pages/Stats";
import NotFitForUs from "./pages/NotFitForus";
import RefreshContext from "../contexts/refreshState";
import NotedJobsPage from "./pages/NotedJobsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import TopNavbar from "./components/TopNavbar";
import Sidebar from "./components/Sidebar";
import SuperAdmin from "./pages/SuperAdmin";
import ProjectsDelivered from "./pages/ProjectsDelivered";
import Cookies from "js-cookie";

export const baseURL = import.meta.env.VITE_BACKEND_BASEURL

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("jwt"); // Get JWT token from cookies

  console.log(token);

  if (!token) {
    return <Navigate to="/" replace />; // Redirect to login if no token
  }
  return children; // Render the protected page if token exists
};

const App = () => {
  const [user, setUser] = useState(null);

  console.log(baseURL);

  return (
    <RefreshContext>
      <Router>
        <Routes>

       

          
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/home" element={<ProtectedRoute><Home user={user} /></ProtectedRoute>} />
          <Route path="/createaccount" element={<SignUp />} />
          <Route path="/job-details" element={<ProtectedRoute><JobDetailedPage /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ProtectedRoute><ForgotPassword /></ProtectedRoute>} /> {/* Lowercase route */}
          <Route path="/list-jobs" element={<ProtectedRoute><ListJobs /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><ProjectStatsDashboard /></ProtectedRoute>} />
          <Route path="/not-fit" element={<ProtectedRoute><NotFitForUs /></ProtectedRoute>} />
          <Route path="/noted-jobs" element={<ProtectedRoute><NotedJobsPage /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
          <Route path="/projects-delivered" element={<ProtectedRoute><ProjectsDelivered /></ProtectedRoute>} />
        </Routes>
      </Router>
    </RefreshContext>
  );
};

export default App;
