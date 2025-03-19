import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

// Import the images
import image1 from './Login/imglog.png';
import { baseURL } from "../App";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  // Timer for lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsLocked(false);
    }
  }, [lockoutTime]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(""); // Clear previous errors

    // Check for super admin credentials
    if (
      formData.email === "superadmin@gmail.com" &&
      formData.password === "superAdmin"
    ) {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Store JWT token in cookies (you might want to use a different token for super admin)
      Cookies.set("jwt", "super-admin-token", {
        expires: rememberMe ? 7 : 1,
        path: "/",
      });
      Cookies.set("username", "superadmin", {
        expires: rememberMe ? 7 : 1,
        path: "/",
      });

      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ username: "superadmin", role: "super-admin" })
      );
      setUser({ username: "superadmin", role: "super-admin" });

      toast.success("Super Admin Login successful! Redirecting...");

      // Add animation before redirect
      setTimeout(() => navigate("/super-admin"), 1500);

      // Clear failed attempts from session storage
      sessionStorage.removeItem(`failedAttempts_${formData.email}`);

      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Store JWT token in cookies
        Cookies.set("jwt", data.token.jwt, {
          expires: rememberMe ? 7 : 1,
          path: "/",
        });
        Cookies.set("username", data.user.username, {
          expires: rememberMe ? 7 : 1,
          path: "/",
        });

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        toast.success("Login successful! Redirecting...");

        setTimeout(() => navigate("/home"), 1500);
      } else {
        toast.error(data.error || "Invalid login credentials.");
        let failedAttempts =
          parseInt(
            sessionStorage.getItem(`failedAttempts_${formData.email}`)
          ) || 0;
        failedAttempts += 1;
        sessionStorage.setItem(
          `failedAttempts_${formData.email}`,
          failedAttempts
        );

        if (failedAttempts >= 3) {
          setIsLocked(true);
          setLockoutTime(120);
          toast.error("Too many failed attempts. Account locked temporarily.");
        } else {
          setError("Invalid login credentials.");
        }
        setIsLoading(false);
      }
    } catch {
      toast.error("Network error. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-xl shadow-lg overflow-hidden h-118">
        {/* Left Side - Image with text overlay */}
        <div className="w-full md:w-3/6 bg-cover bg-center relative" style={{ backgroundImage: `url(${image1})` }}>
          <div className="absolute inset-0 opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white p-8">
            <div className="relative z-20 p-12 text-black">
              <h1 className="text-4xl font-bold">Login to Our Platform</h1>
              <p className="mt-10 text-lg">
                Welcome to Our Aggregator Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-4/6 p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#15caa5]">Login</h2>
              <p className="text-gray-600 mt-2">Login to access your travelwise account</p>
            </div>

            {/* Display error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Lockout message */}
            {isLocked && (
              <div className="bg-orange-50 border border-orange-200 text-orange-600 px-4 py-3 rounded-lg mb-4 flex items-center text-sm">
                <FaLock className="mr-2" />
                <div>
                  <p className="font-medium">Account temporarily locked</p>
                  <p>Try again in {lockoutTime} seconds</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=" "
                  className="w-full p-3 pt-5 pb-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm peer"
                />
                <label
                  htmlFor="email"
                  className="absolute text-gray-500 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:top-3 peer-focus:-translate-y-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all left-3"
                >
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder=" "
                  className="w-full p-3 pt-5 pb-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm peer"
                />
                <label
                  htmlFor="password"
                  className="absolute text-gray-500 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:top-3 peer-focus:-translate-y-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all left-3"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="rounded text-gray-600 focus:ring-gray-500 mr-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-blue-500 hover:text-gray-800 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className={`w-full p-4 rounded-lg font-bold text-sm ${isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#27CEA7] hover:bg-gray-700 text-white transform hover:scale-105"} transition duration-300 shadow-md`}
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
