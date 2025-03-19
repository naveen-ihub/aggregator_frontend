// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";

// // Import the images
// import image1 from './Login/img1.jpg';
// import image2 from './Login/img2.jpg';
// import image3 from './Login/img3.jpg';
// import image4 from './Login/img4.jpg';
// import image5 from './Login/img5.jpg'; // Update the path as needed

// const Login = ({ setUser }) => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [isLocked, setIsLocked] = useState(false);
//   const [lockoutTime, setLockoutTime] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const navigate = useNavigate();

//   const images = [image1, image2, image3, image4, image5];

//   // Check for saved credentials
//   useEffect(() => {
//     const savedEmail = localStorage.getItem("rememberedEmail");
//     if (savedEmail) {
//       setFormData(prev => ({ ...prev, email: savedEmail }));
//       setRememberMe(true);
//     }
//   }, []);

//   // Timer for lockout countdown
//   useEffect(() => {
//     if (lockoutTime > 0) {
//       const interval = setInterval(() => {
//         setLockoutTime((prev) => prev - 1);
//       }, 1000);
//       return () => clearInterval(interval);
//     } else {
//       setIsLocked(false);
//     }
//   }, [lockoutTime]);

//   // Password strength check
//   useEffect(() => {
//     if (!formData.password) {
//       setPasswordStrength(0);
//       return;
//     }

//     let strength = 0;
//     if (formData.password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(formData.password)) strength += 1;
//     if (/[0-9]/.test(formData.password)) strength += 1;
//     if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

//     setPasswordStrength(strength);
//   }, [formData.password]);

//   // Auto-scroll carousel
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//     }, 3000); // Change image every 3 seconds

//     return () => clearInterval(interval);
//   }, [images.length]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (isLocked) return;

//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     setIsLoading(true);
//     setError(""); // Clear previous errors

//     try {
//       const response = await fetch("http://localhost:8000/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Handle remember me
//         if (rememberMe) {
//           localStorage.setItem("rememberedEmail", formData.email);
//         } else {
//           localStorage.removeItem("rememberedEmail");
//         }

//         // Store JWT token in cookies
//         Cookies.set("jwt", data.token.jwt, { expires: rememberMe ? 7 : 1, path: "/" });
//         Cookies.set("username", data.user.username, { expires: rememberMe ? 7 : 1, path: "/" });

//         // Store user data in localStorage
//         localStorage.setItem("user", JSON.stringify(data.user));
//         setUser(data.user);

//         toast.success("Login successful! Redirecting...");

//         // Add animation before redirect
//         setTimeout(() => navigate("/home"), 1500);

//         // Clear failed attempts from session storage
//         sessionStorage.removeItem(`failedAttempts_${formData.email}`);
//       } else {
//         let failedAttempts = parseInt(sessionStorage.getItem(`failedAttempts_${formData.email}`)) || 0;
//         failedAttempts += 1;
//         sessionStorage.setItem(`failedAttempts_${formData.email}`, failedAttempts);

//         if (failedAttempts >= 3) {
//           setIsLocked(true);
//           setLockoutTime(120);
//           toast.error("Too many failed attempts. Account locked temporarily.");
//         } else {
//           toast.error(data.error || "Invalid login credentials.");
//         }
//         setIsLoading(false);
//       }
//     } catch (error) {
//       toast.error("Network error. Please try again later.");
//       setIsLoading(false);
//     }
//   };

//   const handleSocialLogin = (provider) => {
//     toast.info(`${provider} login will be integrated soon!`);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
//       <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl">
//         {/* Left Side - Login Form */}
//         <div className="w-full md:w-2/4 p-8 flex items-center justify-center">
//           <div className="w-full max-w-md">
//             <div className="mb-8 text-center">
//               <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
//               <p className="text-gray-600 mt-2">Sign in to access your account</p>
//             </div>

//             {/* Display error message */}
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Lockout message */}
//             {isLocked && (
//               <div className="bg-orange-50 border border-orange-200 text-orange-600 px-4 py-3 rounded-lg mb-4 flex items-center text-sm">
//                 <FaLock className="mr-2" />
//                 <div>
//                   <p className="font-medium">Account temporarily locked</p>
//                   <p>Try again in {lockoutTime} seconds</p>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleLogin} className="space-y-5">
//               {/* Email */}
//               <div>
//                 <label className="block text-gray-800 font-medium mb-1 text-sm">Email Address</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
//                     <FaEnvelope />
//                   </span>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     placeholder="Enter your email"
//                     className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-gray-800 font-medium mb-1 text-sm">Password</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
//                     <FaLock />
//                   </span>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     placeholder="Enter your password"
//                     className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-sm"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center text-gray-700">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={() => setRememberMe(!rememberMe)}
//                     className="rounded text-gray-600 focus:ring-gray-500 mr-2"
//                   />
//                   Remember me
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => navigate("/forgot-password")}
//                   className="text-gray-600 hover:text-gray-800 hover:underline font-medium"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 className={`w-full p-3 rounded-lg font-bold text-sm ${
//                   isLoading
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105"
//                 } transition duration-300 shadow-md`}
//                 disabled={isLoading || isLocked}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Signing in...
//                   </div>
//                 ) : (
//                   "Sign In"
//                 )}
//               </button>
//             </form>

//             {/* Create Account Link */}

//           </div>
//         </div>

//         {/* Right Side - Image & Info */}
//         <div className="hidden md:block w-2/4 relative">
//           <div className="relative w-full h-full">
//             <div className="overflow-hidden rounded-lg shadow-lg h-full">
//               <div
//                 className="flex transition-transform ease-in-out duration-500 h-full"
//                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}
//               >
//                 {images.map((src, index) => (
//                   <img key={index} src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
//                 ))}
//               </div>
//             </div>
//             <div className="absolute bottom-8 left-8 right-8 text-white text-center">

//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default Login;
