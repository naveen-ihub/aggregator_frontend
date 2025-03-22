import React, { useState, useEffect } from "react";
import { FaHome, FaClipboardList, FaBan, FaChartBar, FaStickyNote, FaBookmark, FaCog, FaSignOutAlt, FaWindowClose, FaCross, FaCheckSquare } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const SidebarButton = ({ icon, label, path, isActive }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`${isActive(path) && "bg-white"} flex items-center space-x-3 text-teal-500 hover:text-[#d2e7e2] cursor-pointer p-2 py-3 rounded-2xl transition duration-300 w-full ${isActive(path) ? "bg-[#d1f7e4] text-[#009689]" : ""
        }`}
      onClick={() => navigate(path)}
    >
      <span
        className={`ml-2 p-1.5 rounded-xl ${isActive(path) ? "text-white bg-[#009689]" : "text-teal-500 bg-white"
          }`}
      >
        {icon}
      </span>

      <span
        className={`text-sm ${isActive(path) ? "" : "text-black"} hover:text-[#009689]`}
      >
        {label}
      </span>
    </button>
  );
};

const Sidebar = ({ showSideBar, setShowSideBar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const menuItems = [
    { icon: <FaClipboardList size={18} />, label: "Job Status", path: "/list-jobs" },
    { icon: <FaBan size={18} />, label: "Not Fit", path: "/not-fit" },
    { icon: <FaChartBar size={18} />, label: "Stats", path: "/stats" },
    { icon: <FaStickyNote size={18} />, label: "Noted Jobs", path: "/noted-jobs" },
    { icon: <FaBookmark size={18} />, label: "Saved Jobs", path: "/saved-jobs" },
    { icon: <FaCheckSquare size={18} />, label: "Jobs Completed", path: "/projects-delivered" },
  ];

  useEffect(() => {
    // Check if the user is a super admin
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "super-admin") {
      setIsSuperAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    // Remove cookies
    Cookies.remove("jwt");
    Cookies.remove("username");

    // Remove from localStorage if stored
    localStorage.removeItem("user");

    // Redirect to home/login page
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-0 z-[9999] left-0 w-60 h-screen bg-[#f2fffb] flex flex-col items-center justify-between p-2">
      <div className="flex flex-col space-y-4 items-stretch w-full px-4">
        <div className="flex items-end justify-between w-full pt-6 px-0 border-b border-gray-300 pb-4 tracking-wider lg:justify-center">
          <h2 className="text-xl lg:text-3xl text-gray-600">Aggregator</h2>
          <i className="bi bi-x-lg lg:hidden ml-2" onClick={() => setShowSideBar(false)}></i>
        </div>
        <SidebarButton icon={<FaHome size={18} />} label={"Home"} path={isSuperAdmin ? "/super-admin" : "/home"} isActive={isActive} />
        {!isSuperAdmin && <div className="flex flex-col space-y-1 items-start w-full">
          {menuItems.map(
            (item, index) =>
              (item.path !== "/super-admin" || isSuperAdmin) && (
                <SidebarButton key={index} {...item} isActive={isActive} />
              )
          )}
        </div>}
      </div>

      <div className="space-y-1 w-full px-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-md transition duration-300 w-full"
        >
          <span className="ml-2 text-rose-600 bg-white p-1.5 rounded-xl">
            <FaSignOutAlt size={18} />
          </span>
          <span className="text-black hover:text-red-700 text-sm">Logout</span>
        </button>

      </div>
    </div>
  );
};

export default Sidebar;