import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const CreateAccount = () => {
  // Form state management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP verification state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const timerRef = useRef(null);

  // Password strength and validation
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState([]);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Terms and conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  // Function to check password strength with detailed feedback
  const checkPasswordStrength = (password) => {
    const feedbackItems = [];
    let strength = "";

    // Check for minimum length
    const hasMinLength = password.length >= 6;
    feedbackItems.push({
      requirement: "At least 6 characters",
      met: hasMinLength
    });

    // Check for at least 2 numbers
    const hasNumbers = (password.match(/\d/g) || []).length >= 2;
    feedbackItems.push({
      requirement: "At least 2 numbers",
      met: hasNumbers
    });

    // Check for at least 3 letters
    const hasLetters = (password.match(/[a-zA-Z]/g) || []).length >= 3;
    feedbackItems.push({
      requirement: "At least 3 letters",
      met: hasLetters
    });

    // Check for at least 1 special character
    const hasSpecial = /[!@#\$%^&*(),.?":{}|<>]/.test(password);
    feedbackItems.push({
      requirement: "At least 1 special character",
      met: hasSpecial
    });

    // Determine overall strength
    const metCount = feedbackItems.filter(item => item.met).length;

    if (metCount === 4) {
      strength = "strong";
    } else if (metCount >= 2) {
      strength = "medium";
    } else if (metCount >= 1) {
      strength = "weak";
    } else {
      strength = "";
    }

    return { strength, feedbackItems };
  };

  // Function to validate phone number
  const isValidPhoneNumber = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  // Function to validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Update password strength when password changes
  useEffect(() => {
    const { strength, feedbackItems } = checkPasswordStrength(password);
    setPasswordStrength(strength);
    setPasswordFeedback(feedbackItems);
  }, [password]);

  // Handle OTP resend timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpResendTimer(otpResendTimer - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [otpResendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await axios.post("http://127.0.0.1:8000/api/sendotp", { email });
      if (response.status === 200) {
        setOtpSent(true);
        setSuccess("OTP sent successfully! Please check your email.");
        setOtpResendTimer(60); // Set 60 second timer for resend
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error sending OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;

    try {
      setIsSendingOtp(true);
      const response = await axios.post("http://127.0.0.1:8000/api/sendotp", { email });
      if (response.status === 200) {
        setSuccess("OTP resent successfully!");
        setOtpResendTimer(60);
      }
    } catch (error) {
      setError("Error resending OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await axios.post("http://127.0.0.1:8000/api/verifyotp", { email, otp });
      if (response.status === 200) {
        setEmailVerified(true);
        setSuccess("Email verified successfully!");
      } else {
        setError("Invalid OTP.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error verifying OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation checks
    if (!username || !password || !confirmPassword || !email || !phone) {
      setError("All fields are required.");
      return;
    }

    if (username.length > 50) {
      setError("Username must be 50 characters or less.");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    if (passwordStrength !== "strong") {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!emailVerified) {
      setError("Please verify your email before creating an account.");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms and Conditions to create an account.");
      return;
    }

    try {
      setIsSubmitting(true);
      const createAccountResponse = await axios.post("http://127.0.0.1:8000/api/createaccount", {
        username,
        email,
        phone,
        password,
      });

      if (createAccountResponse.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        // Redirect after a slight delay to show success message
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || "Error creating account.");
      } else {
        setError("Error creating account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 bg-white shadow-lg rounded-full p-3 text-blue-600 hover:text-blue-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create Account</h2>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCreateAccount} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                maxLength="50"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum 50 characters</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Reset verification if email changes
                  if (emailVerified) {
                    setEmailVerified(false);
                    setOtpSent(false);
                  }
                }}
                placeholder="Enter your email"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={emailVerified}
              />
              {!otpSent && !emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !email || !isValidEmail(email)}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition
                    ${(isSendingOtp || !email || !isValidEmail(email)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isSendingOtp ? 'Sending...' : 'Verify'}
                </button>
              )}
            </div>
          </div>

          {/* OTP Verification Section */}
          {otpSent && !emailVerified && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <label className="block text-gray-700 font-medium mb-1">OTP Verification</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength="6"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className={`bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition
                    ${(isVerifyingOtp || otp.length !== 6) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Didn't receive the code?
                </span>
                {otpResendTimer > 0 ? (
                  <span className="text-blue-600">Resend in {otpResendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Email verification success message */}
          {emailVerified && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-green-800 text-sm font-medium">Email verified successfully!</span>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                placeholder="Enter your 10-digit phone number"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                maxLength="10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: 10 digits, numbers only</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ?
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg> :
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                }
              </button>
            </div>

            {/* Password strength indicator */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength</span>
                {passwordStrength && (
                  <span className={`text-xs font-medium
                    ${passwordStrength === "strong" ? "text-green-600" :
                     passwordStrength === "medium" ? "text-yellow-600" :
                     "text-red-600"}`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </span>
                )}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300
                    ${passwordStrength === "strong" ? "bg-green-500 w-full" :
                     passwordStrength === "medium" ? "bg-yellow-500 w-2/3" :
                     passwordStrength === "weak" ? "bg-red-500 w-1/3" :
                     "bg-gray-300 w-0"}`}
                ></div>
              </div>

              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                {passwordFeedback.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`text-xs ${item.met ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.met ? '✓' : '○'} {item.requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`pl-10 pr-12 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors
                  ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ?
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg> :
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                }
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Terms and conditions checkbox */}
          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-8">
            <p className="text-blue-700">
              Already have account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 font-bold hover:text-blue-800 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
      </div>
    </div>
  );
};

export default CreateAccount;
