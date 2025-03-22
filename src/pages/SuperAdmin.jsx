import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon,
  BriefcaseIcon,
} from "lucide-react";
import Base from "../components/Base";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL } from "../App";

export default function SuperAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [editAdminId, setEditAdminId] = useState(null);
  const [stats, setStats] = useState({ total_admins: 0, total_jobs: 0 });

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [backendError, setBackendError] = useState("");

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/get-admins/`);
      if (Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/get-stats/`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchStats();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      phone: "",
      password: "",
    };
  
    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (username.length > 30) {
      newErrors.username = "Username must be 30 characters or less";
      isValid = false;
    }
  
    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }
  
    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
      isValid = false;
    } else if (isNaN(Number(phone))) {
      newErrors.phone = "Phone number must contain only numbers";
      isValid = false;
    }
  
    // Password validation
    if (editAdminId) {
      // For editing, password is optional
      if (password.trim()) {
        if (password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
          isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          newErrors.password = "Password must contain at least one special character";
          isValid = false;
        }
      }
    } else {
      // For new admin, password is required
      if (!password.trim()) {
        newErrors.password = "Password is required";
        isValid = false;
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = "Password must contain at least one special character";
        isValid = false;
      }
    }
  
    setErrors(newErrors);
    return isValid;
  };
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const url = editAdminId
          ? `${baseURL}/api/edit-admin/${editAdminId}/`
          : `${baseURL}/api/createaccount/`;

        const response = await axios({
          method: editAdminId ? "PUT" : "POST",
          url: url,
          data: {
            username,
            email,
            phone,
            ...(password.trim() ? { password } : {}),
          },
        });

        const updatedAdmin = response.data;
        setAdmins(
          admins.map((admin) =>
            admin.id === updatedAdmin.id ? updatedAdmin : admin
          )
        );

        if (!editAdminId) {
          setAdmins([...admins, updatedAdmin]);
        }

        setIsModalOpen(false);
        setUsername("");
        setEmail("");
        setPhone("");
        setPassword("");
        setErrors({
          username: "",
          email: "",
          phone: "",
          password: "",
        });
        setBackendError("");

        toast.success(
          editAdminId
            ? "Admin updated successfully!"
            : "Admin added successfully!",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );

        window.location.reload();

        

        if (editAdminId) {
          fetchAdmins();
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error || "Error updating admin");
        } else {
          toast.error("An unexpected error occurred");
        }
        console.error("Error adding/updating admin:", error);
      }
    }

  };

  const handleEditAdmin = (admin) => {
    setEditAdminId(admin.id);
    setUsername(admin.username);
    setEmail(admin.email);
    setPhone(admin.phone);
    setPassword("");
    setIsModalOpen(true);
  };


  const handleDeleteAdmin = async (adminId) => {
    try {
      await axios.delete(`${baseURL}/api/delete-admin/${adminId}/`);
      setAdmins(admins.filter((admin) => admin.id !== adminId));

      toast.success("Admin deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        
      }
    );

    window.location.reload();

    } catch (error) {
      console.error("Error deleting admin:", error);
      setBackendError("Error deleting admin");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAdminId(null);
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setErrors({
      username: "",
      email: "",
      phone: "",
      password: "",
    });
    setBackendError("");
  };

  return (
    <Base>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hi, Super Admin!</h1>
          <button
            onClick={() => {
              setEditAdminId(null);
              setIsModalOpen(true);
            }}
            className="bg-[#27cfa8] hover:bg-[#27cfa8]/90 text-white px-4 py-2 rounded flex items-center"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Admin
          </button>
        </div>

        {/* Styled Metrics as Separate Boxes */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#d2f7e5]/30 rounded-lg shadow-sm border border-[#d2f7e5] p-6 flex items-center space-x-4">
            <div className="bg-[#27cfa8]/10 p-3 rounded-full">
              <UsersIcon className="h-6 w-6 text-[#27cfa8]" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Admins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_admins}</p>
            </div>
          </div>
          <div className="bg-[#d2f7e5]/30 rounded-lg shadow-sm border border-[#d2f7e5] p-6 flex items-center space-x-4">
            <div className="bg-[#27cfa8]/10 p-3 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-[#27cfa8]" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Jobs Scraped</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_jobs}</p>
            </div>
          </div>
        </div>

        {/* Display backend error message */}
        {backendError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{backendError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin List Table with Spacing */}
        <div className="bg-[#d2f7e5]/30 rounded-lg shadow-sm border border-[#d2f7e5]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#d2f7e5]/50">
                <tr>
                  <th className="font-semibold py-4 px-6 text-start">Username</th>
                  <th className="font-semibold py-4 px-6 text-start">Email</th>
                  <th className="font-semibold py-4 px-6 text-start">Phone</th>
                  <th className="font-semibold py-4 px-6 text-start">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No administrators found. Add your first admin.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-[#a2fad0]">
                      <td className="font-medium py-4 px-6">{admin.username}</td>
                      <td className="py-4 px-6">{admin.email}</td>
                      <td className="py-4 px-6">{admin.phone}</td>
                      <td className="py-4 px-6 flex space-x-4">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg sm:max-w-[600px] w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editAdminId ? "Edit Administrator" : "Add New Administrator"}
              </h2>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className={`w-full px-4 py-2 border rounded ${
                      errors.username ? "border-red-500" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-2 border rounded ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className={`w-full px-4 py-2 border rounded ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {!editAdminId && (
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className={`w-full px-4 py-2 border rounded pr-10 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#27cfa8] hover:bg-[#27cfa8]/90 text-white px-4 py-2 rounded"
                  >
                    {editAdminId ? "Update Administrator" : "Add Administrator"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Base>
  );
}