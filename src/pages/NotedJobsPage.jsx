import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Base from "../components/Base";
import { baseURL } from "../App";
import { FaEraser } from "react-icons/fa";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

// Export JobCard to resolve import issues elsewhere
export const JobCard = ({ job, onClick, onDeleteNote, noNotes }) => {
  return (
    <div
      onClick={onClick}
      className="border border-teal-100 bg-white p-6 shadow-md rounded-lg flex flex-col space-y-3 justify-between cursor-pointer active:cursor-grabbing hover:scale-[1.03] transition-all duration-300 hover:shadow-lg transition relative w-full h-[260px]"
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
        <h3 className="text-lg font-semibold text-black font-urbanist flex-1 line-clamp-2 pr-5.5">{job.title}</h3>
      </div>

      {/* Description */}
      <p className="text-gray-800 text-sm font-urbanist leading-5 text-justify line-clamp-3 h-[60px]">
        <strong>Budget:</strong> {job.budget} <br />
        <strong>Proposals:</strong> {job.proposals} <br />
        <strong>Platform:</strong> {job.platform} <br />
        <span className="text-gray-400">Posted: {job.posted_time}</span>
      </p>

      {/* Clear Notes Button */}
      {!noNotes && <div className="flex justify-start">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from triggering navigation
            onDeleteNote(job._id); // Call the delete note handler with job ID
          }}
          className="bg-teal-500 text-black px-4 py-2 rounded-lg hover:bg-teal-600 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
        >
          <FaEraser className="text-black text-sm" />
          <span>Clear Notes</span>
        </button>
      </div>}
    </div>
  );
};

const NotedJobsPage = () => {
  const [notedJobs, setNotedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Anonymous";

  const fetchNotedJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/get_user_noted_jobs?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setNotedJobs(data.noted_jobs || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch noted jobs.");
      console.error("Error fetching noted jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllNotes = async () => {
    if (notedJobs.length === 0) {
      toast.info("No notes to delete.");
      return;
    }

    try {
      const response = await axios.delete(`${baseURL}/api/delete_all_noted_jobs`, {
        data: { username },
      });
      if (response.status === 200) {
        setNotedJobs([]);
        toast.success("All noted jobs have been deleted!");
      } else {
        toast.error("Failed to delete all noted jobs.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while deleting all noted jobs.");
      console.error("Error deleting all noted jobs:", error);
    }
  };

  const handleDeleteNote = async (jobId) => {
    try {
      const response = await axios.delete(`${baseURL}/api/delete_job_notes/${jobId}`, {
        data: { username },
      });
      if (response.status === 200) {
        // Remove the job from the state since it no longer has notes
        setNotedJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        toast.success("Notes cleared successfully!");
      } else {
        toast.error("Failed to clear notes.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while clearing notes.");
      console.error("Error clearing notes:", error);
    }
  };

  useEffect(() => {
    fetchNotedJobs();
  }, []);

  const handleJobClick = (job) => {
    navigate("/job-details", { state: { job } });
  };

  return (
    <Base>
      <div className="w-full mb-5 flex-1 flex-col flex pr-2">
        {/* Header Section */}
        <div className="relative h-32">
          <div className="mb-8 fixed h-32 pt-6 w-full bg-[#f2fffb] z-[9998] px-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-black font-urbanist leading-tight">Noted Jobs</h1>
            <h1 className="text-sm lg:text-xl font-normal text-black font-urbanist mt-4">View jobs you’ve added notes for personalized tracking and insights.</h1>
          </div>
        </div>

        <div className="px-6 pb-6 bg-teal-50 bg-opacity-30 border border-teal-400 shadow-lg hover:shadow-[0_10px_30px_rgba(13,148,136,0.3)] rounded-xl flex-1 transition-shadow duration-300 backdrop-blur-sm">
          {loading && <div className="z-[9999] top-0 left-0 flex justify-center items-center flex flex-col h-full w-full">
              <span class="loader"></span><br></br>
              <p className="text-black"> Hang tight! Retrieving your noted jobs...</p>
            </div>}

          {!loading && (
            <div className="w-full mt-6">
              {notedJobs.length === 0 && (
                <p className="mt-4 text-gray-600 text-base">No jobs with notes found.</p>
              )}

              {notedJobs.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
                    {notedJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onClick={() => handleJobClick(job)}
                        onDeleteNote={handleDeleteNote}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </Base>
  );
};

export default NotedJobsPage;