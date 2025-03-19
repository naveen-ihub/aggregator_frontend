import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

// Import the images
import img1 from './Login/imglog.png';
import { baseURL } from "../App";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [resendTimer, setResendTimer] = useState(30); // Timer for resending OTP
  const [resendCount, setResendCount] = useState(0); // Count of OTP resends
  const navigate = useNavigate();

  const images = [img1];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Function to check password strength with detailed feedback
  const checkPasswordStrength = (password) => {
    let strength = "";

    // Check for minimum length
    const hasMinLength = password.length >= 6;

    // Check for at least 2 numbers
    const hasNumbers = (password.match(/\d/g) || []).length >= 2;

    // Check for at least 3 letters
    const hasLetters = (password.match(/[a-zA-Z]/g) || []).length >= 3;

    // Check for at least 1 special character
    const hasSpecial = /[!@#\$%^&*(),.?":{}|<>]/.test(password);

    // Determine overall strength
    const metCount = [hasMinLength, hasNumbers, hasLetters, hasSpecial].filter(Boolean).length;

    if (metCount === 4) {
      strength = "strong";
    } else if (metCount >= 2) {
      strength = "medium";
    } else if (metCount >= 1) {
      strength = "weak";
    } else {
      strength = "";
    }

    return { strength };
  };

  // Update password strength when password changes
  useEffect(() => {
    const { strength } = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  // Start the resend timer when OTP is sent
  useEffect(() => {
    if (otpSent) {
      const timer = setInterval(() => {
        setResendTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(timer);
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpSent]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/forgot-opt`, { email });
      if (response.status === 200) {
        setOtpSent(true);
        setResendTimer(30); // Reset the timer to 30 seconds
        setResendCount(0); // Reset the resend count
        toast.success("OTP sent successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error sending OTP.");
      }
    } catch (error) {
      toast.error("Invalid email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCount >= 3) {
      toast.error("OTP resend limit reached.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseURL}/api/forgot-opt`, { email });
      if (response.status === 200) {
        setResendTimer(30); // Reset the timer to 30 seconds
        setResendCount((prevCount) => prevCount + 1); // Increment the resend count
        toast.success("OTP resent successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error resending OTP.");
      }
    } catch (error) {
      toast.error("Invalid E-Mail");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpValue = otp.join("");
    if (!otpValue) {
      toast.error("OTP is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/verifyotp`, { email, otp: otpValue });
      if (response.status === 200) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Invalid OTP.");
      }
    } catch (error) {
      toast.error("Invalid E-Mail");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordStrength !== "strong") {
      toast.error("Password must be strong.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/resetpassword`, { email, newPassword });
      if (response.status === 200) {
        // Display toast notification
        toast.success("Password reset successfully!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
        });

        // Redirect to login page after a short delay
        setTimeout(() => navigate("/"), 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || "Error resetting password.");
      }
    } catch (error) {
      toast.error("Invalid E-Mail");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.match(/^[0-9]$/) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <ToastContainer />
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-5xl h-118">
        <div className="w-full md:w-3/6 bg-cover bg-center relative" style={{ backgroundImage: `url(${img1})` }}>
          <div className="absolute inset-0 opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white p-8">
            <div className="relative z-20 p-12 text-black">
              <h1 className="text-4xl font-bold">Sign In to Our Platform</h1>
              <p className="mt-10 text-lg">

              </p>
            </div>
          </div>
        </div>
        {/* Left Side - Forgot Password Form */}
        <div className="w-full md:w-4/6 p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
            <p className="text-gray-600 mt-2 text-sm hover:cursor-pointer bg-white rounded-[10px] mb-5 " onClick={() => navigate("/")}>&lt; Back to Login</p>
              <h2 className="text-2xl font-bold text-gray-800">Forgot your password?</h2>
              <p className="text-gray-600 mt-2 text-sm">Don’t worry, happens to all of us. Enter your email below to recover your password</p>
            </div>

            <form onSubmit={otpVerified ? handleResetPassword : otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="w-full p-3 pt-5 pb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm peer"
                  required
                  disabled={otpVerified}
                />
                <label
                  htmlFor="email"
                  className="absolute text-gray-500 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:top-3 peer-focus:-translate-y-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all left-3"
                >
                  Email Address
                </label>
              </div>

              {otpSent && !otpVerified && (
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      id={`otp-${index}`}
                      className="w-12 h-12 border border-gray-200 rounded-lg text-center font-medium text-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                      maxLength="1"
                    />
                  ))}
                </div>
              )}

              {otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-gray-500 underline hover:text-gray-700 text-sm"
                  disabled={loading || resendTimer > 0 || resendCount >= 3}
                >
                  {loading ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : resendCount >= 3 ? "OTP resend limit reached" : "Resend OTP"}
                </button>
              )}

              {otpVerified && (
                <>
                  {/* New Password */}
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder=" "
                      className="w-full p-3 pt-5 pb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm peer"
                      required
                    />
                    <label
                      htmlFor="newPassword"
                      className="absolute text-gray-500 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:top-3 peer-focus:-translate-y-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all left-3"
                    >
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength</span>
                      {passwordStrength === "strong" ? (
                        <span className="text-xs font-medium text-green-600 flex items-center">
                          <FaCheck className="mr-1" /> Strong
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600 flex items-center">
                          <FaTimes className="mr-1" /> Weak
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=" "
                      className="w-full p-3 pt-5 pb-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm peer"
                      required
                    />
                    <label
                      htmlFor="confirmPassword"
                      className="absolute text-gray-500 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:top-3 peer-focus:-translate-y-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all left-3"
                    >
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </>
              )}

              <button
                type="submit"
                className={`w-full p-4 rounded-lg font-bold text-sm ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black hover:bg-gray-700 text-white transform hover:scale-105"
                } transition duration-300 shadow-md`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : otpVerified ? "Reset Password" : otpSent ? "Verify OTP" : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
