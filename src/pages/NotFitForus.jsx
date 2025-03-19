import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
// import Navbar from "../components/Base";
// import { FaBookmark, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";
import {FaTimes,FaAngleDoubleLeft } from "react-icons/fa";

import Base from "../components/Base";
import { baseURL } from "../App";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

const NotFitForUs = () => {
  const [notFitJobs, setNotFitJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUsername(parsedUserData.username);
        fetchNotFitJobs(parsedUserData.username);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const fetchNotFitJobs = async (username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/get_not_fit_jobs?username=${username}`);

      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setNotFitJobs(data.notFitJobs || []);
    } catch (err) {
      setError(err.message || "Failed to fetch not fit jobs.");
      console.error("Error fetching not fit jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (job) => {
    navigate("/job-details", { state: { job } });
  };

  const handleRestoreJob = async (job) => {
    try {
      const response = await fetch(`${baseURL}/api/restore_job/${job._id}`, {
        method: "PUT",
      });

      if (response.ok) {
        setNotFitJobs((prevJobs) => prevJobs.filter((j) => j._id !== job._id));
        toast.success("Job status updated to Open.");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update job status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the job status.");
    }
  };

  const handleRemoveJob = async (job) => {
    try {
      const response = await fetch(`${baseURL}/api/delete_job/${job._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotFitJobs((prevJobs) => prevJobs.filter((j) => j._id !== job._id));
        toast.success("Job deleted successfully.");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete job.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the job.");
    }
  };

  const extractTechStack = (description) => {
    if (!description) {
      return { cleanedDescription: "", techStack: [] };
    }
    const techStackPattern = /Tech Stack: (.+)/;
    const match = description.match(techStackPattern);
    if (match) {
      const techStack = match[1].split(", ").map((item) => item.trim());
      const cleanedDescription = description.replace(techStackPattern, "").trim();
      return { cleanedDescription, techStack };
    }
    return { cleanedDescription: description, techStack: [] };
  };

  return (
    <Base>
      <div className="w-full mb-10">
        {/* Header Section */}
        <div className="relative h-32">
          <div className="mb-8 fixed h-32 pt-6 w-full bg-[#f2fffb] z-[9998] px-6">
            <div>
              <h1 className="text-2xl lg:text-4xl mb-2 text-black font-urbanist leading-tight">Not Fit For Us Jobs</h1>
              <h1 className="text-sm lg:text-xl font-normal text-black font-urbanist mt-5">Review and handle jobs that don’t align with your needs or preferences.</h1>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {loading && <p className="mt-4 text-gray-600 text-base">Loading not fit jobs...</p>}

          {error && <div className="mt-4 text-red-600 font-semibold text-base">{error}</div>}

          {!loading && notFitJobs.length === 0 && (
            <p className="mt-4 text-gray-600 text-base">No jobs marked as 'Not Fit' found.</p>
          )}

          {!loading && notFitJobs.length > 0 && (
            <div className="mt-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
                {[...notFitJobs].map((job, index) => {
                  const { cleanedDescription, techStack } = extractTechStack(job.description || job.summary);
                  const isSaved = false; // No save functionality for Not Fit jobs, set to false

                  return (
                    <div
                      key={index}
                      onClick={() => handleViewJob(job)}
                      className="bg-white p-6 shadow-md rounded-lg flex flex-col cursor-pointer hover:shadow-lg transition relative w-full min-h-[260px]"
                    >


                      {/* Platform Logo and Title */}
                      <div className="flex items-center mb-4">
                        {platforms[job.platform] ? (
                          <img
                            src={platforms[job.platform]}
                            alt={`${job.platform} logo`}
                            className="w-12 h-12 rounded-full object-contain mr-4 bg-gray-200 p-1"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl text-gray-500">🌐</span>
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-black font-urbanist flex-1 line-clamp-3 pr-5">{job.title}</h3>
                      </div>

                      {/* Description */}
                      <div className="mb-4 flex-grow">
                        <p className="text-gray-800 text-sm font-urbanist leading-5 text-justify line-clamp-3 h-[60px]">
                          {cleanedDescription}
                        </p>
                      </div>

                      {techStack.length > 0 && (
                        <div className="bg-yellow-100 p-2 rounded-md mb-4">
                          <strong className="text-black font-urbanist text-sm">Tech Stack:</strong>{" "}
                          {techStack.join(", ")}
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex justify-between items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreJob(job);
                          }}
                          className="border border-teal-500 text-black px-2 py-2 rounded-lg hover:bg-teal-100 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
                        >

                          <FaAngleDoubleLeft className="text-black text-sm" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveJob(job);
                          }}
                          className="bg-teal-500 text-black px-4 py-2 rounded-lg hover:bg-teal-600 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
                        >
                          <span>Remove</span>
                          <FaTimes className="text-black text-sm" />                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Base>
  );
};

export default NotFitForUs;