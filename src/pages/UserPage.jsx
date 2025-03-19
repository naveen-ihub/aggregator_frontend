import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Key, LogOut, Phone, Mail, User } from "lucide-react";
import Base from "../components/Base";

// Import the background image
import imglog from './Login/Protop.png';

const UserPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <div className="p-4 text-red-600">No user data available.</div>;
  }

  // Function to get the first letter of the first name for the avatar
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Debug: Check if the image is loaded
  const isImageLoaded = () => {
    const img = new Image();
    img.src = imglog;
    return img.complete && img.naturalHeight !== 0;
  };

  return (
    <Base>
      <div className="flex flex-col items-end justify-center w-3/4">
        <div className="w-3/4 pb-6 bg-white rounded-4xl shadow-lg">

          <div className="rounded-4xl relative overflow-hidden">
            {/* Background Image Header with Fallback */}
            <div
              className="h-40 relative"
              style={{
                backgroundImage: `url(${imglog})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >

            </div>

            {/* Profile Image Section */}
            <div className="flex justify-center -mt-16 relative z-10">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-teal-100  flex items-center justify-center shadow-lg">
                <span className="text-6xl font-semibold text-teal-600">
                  {getFirstLetter(user.firstName || user.username)}
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="text-center px-6 mt-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {user.firstName} {user.username || "Last"}
            </h1>
            <p className="text-gray-600 mt-1">{user.email || "email@example.com"}</p>
          </div>

          {/* User Information Cards */}
          <div className="px-6 mt-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-teal-100 p-2 rounded-lg mr-4">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-500">Name:</h2>
                <p className="text-gray-800 font-semibold">{user.username || "N/A"}</p>
              </div>
            </div><div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-teal-100 p-2 rounded-lg mr-4">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-500">Email:</h2>
                <p className="text-gray-800 font-semibold">{user.email || "N/A"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-teal-100 p-2 rounded-lg mr-4">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-500">Phone no:</h2>
                <p className="text-gray-800 font-semibold">{user.phone || "N/A"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="py-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate("/forgot-password")}
            className="flex items-center justify-center space-x-2 border border-teal-500 text-teal-500 px-4 py-2 rounded-lg hover:bg-teal-50 transition"
          >
            <Key className="w-4 h-4" />
            <span>Change password</span>
          </button>

        </div>
      </div>
    </Base>
  );
};

export default UserPage;