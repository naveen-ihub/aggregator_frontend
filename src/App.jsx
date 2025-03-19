import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export const baseURL = import.meta.env.VITE_BACKEND_BASEURL

const App = () => {
  const [user, setUser] = useState(null);

  console.log(baseURL);

  return (
    <RefreshContext>
      <Router>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/home" element={<Home user={user} />} />
          <Route path="/createaccount" element={<SignUp />} />
          <Route path="/job-details" element={<JobDetailedPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Lowercase route */}
          <Route path="/list-jobs" element={<ListJobs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/stats" element={<ProjectStatsDashboard />} />
          <Route path="/not-fit" element={<NotFitForUs />} />
          <Route path="/noted-jobs" element={<NotedJobsPage />} />
          <Route path="/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
        </Routes>
      </Router>
    </RefreshContext>
  );
};

export default App;
