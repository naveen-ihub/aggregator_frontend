import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Base";
import { FaBookmark, FaAngleDoubleRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Base from "../components/Base";
import { baseURL } from "../App";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

const JobCard = ({ job, onClick, onToggleSave, onMoveToReview, isSaved }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 shadow-md rounded-lg flex flex-col space-y-3 justify-between cursor-pointer hover:shadow-lg transition relative w-full h-[260px]"
    >
      {/* Save Job Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(job._id);
        }}
        className={`absolute top-4 right-4 p-2 rounded-full ${isSaved ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-400"} hover:bg-teal-200 hover:cursor-pointer transition z-10`}
        title={isSaved ? "Unsave Job" : "Save Job"}
      >
        <FaBookmark className="text-sm" />
      </button>

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
        <h3 className="text-lg font-semibold text-black font-urbanist flex-1 line-clamp-2 pr-5.5">{job.title}</h3>
      </div>

      {/* Description (Using budget, proposals, platform, and posted_time as content) */}

      <p className="text-gray-800 text-sm font-urbanist leading-5 text-justify line-clamp-3 h-[60px]">
        <strong>Budget:</strong> {job.budget} <br />
        <strong>Proposals:</strong> {job.proposals} <br />
        <strong>Platform:</strong> {job.platform} <br />
        <span className="text-gray-400">Posted: {job.posted_time}</span>
      </p>


      {/* Move to Review Button */}
      <div className="flex justify-start">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToReview(job._id);
          }}
          className="bg-teal-500 text-black px-4 py-2 rounded-lg hover:bg-teal-600 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
        >
          <span>Move to Review</span>
          <FaAngleDoubleRight className="text-black text-sm" />
        </button>
      </div>
    </div>
  );
};

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Anonymous";

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/get_saved_jobs?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setSavedJobs(data.saved_jobs);
    } catch (err) {
      toast.error(err.message || "Failed to fetch saved jobs.");
      console.error("Error fetching saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      const response = await axios.post(`${baseURL}/api/remove_saved_job`, {
        username,
        job_id: jobId,
      });
      if (response.status === 200) {
        toast.success("Job removed from saved list!");
        fetchSavedJobs();
      } else {
        toast.error("Failed to remove job.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while removing the job.");
      console.error("Error removing saved job:", error);
    }
  };

  const handleMoveToReview = async (jobId) => {
    try {
      const updateResponse = await axios.put(
        `${baseURL}/api/update_Savedjob_status_to_pending/${jobId}`,
        { username }
      );
      if (updateResponse.status !== 200) {
        throw new Error(updateResponse.data.error || "Failed to update job status.");
      }
      toast.success("Job moved to review!");
      fetchSavedJobs();
    } catch (error) {
      toast.error(error.message || "An error occurred while moving the job to review.");
      console.error("Error moving job to review:", error);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleJobClick = (job) => {
    navigate("/job-details", { state: { job } });
  };

  return (
    <Base>
      <div className="w-full pt-0">
        {/* Header Section */}
        <div className="relative h-32">
          <div className="mb-8 fixed h-32 pt-6 w-full bg-[#f2fffb] z-[9998] px-6">
            <h1 className="text-2xl lg:text-4xl text-black font-urbanist leading-tight">Saved Jobs</h1>
            <h1 className="text-sm lg:text-xl font-normal text-black font-urbanist mt-4">Explore your saved job listings for quick access and future reference.</h1>
          </div>
        </div>

        <div className="px-6 pb-6">
          {loading && <p className="mt-4 text-gray-600 text-base">Loading saved jobs...</p>}

          {!loading && savedJobs.length === 0 && (
            <p className="mt-4 text-gray-600 text-base">No saved jobs found.</p>
          )}

          {!loading && savedJobs.length > 0 && (
            <div className="w-full mt-6">
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
                  {savedJobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onClick={() => handleJobClick(job)}
                      onToggleSave={handleToggleSave}
                      onMoveToReview={handleMoveToReview}
                      isSaved={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Base>
  );
};

export default SavedJobsPage;