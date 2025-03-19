import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Base";
import { toast, ToastContainer } from "react-toastify";
import Base from "../components/Base";
import { baseURL } from "../App";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

export const JobCard = ({ job, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 shadow-md rounded-lg flex flex-col justify-between cursor-pointer hover:shadow-lg transition relative w-full h-[200px]"
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
            <span className="text-xl text-gray-00">🌐</span>
          </div>
        )}
        <h3 className="text-lg font-semibold text-black font-urbanist flex-1 line-clamp-2">{job.title}</h3>
      </div>

      {/* Description (Using budget, proposals, platform, and posted_time as content) */}
      <div className="">
        <p className="text-gray-800 text-sm font-inter leading-5 text-justify line-clamp-3 h-[90px]">
          <strong>Budget:</strong> {job.budget} <br />
          <strong>Proposals:</strong> {job.proposals} <br />
          <strong>Platform:</strong> {job.platform} <br />
          <span className="text-gray-400">Posted: {job.posted_time}</span>
        </p>
      </div>
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
      const response = await fetch(`https://aggregatorbackend-production.up.railway.app/api/get_user_noted_jobs?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setNotedJobs(data.noted_jobs);
    } catch (err) {
      toast.error(err.message || "Failed to fetch noted jobs.");
      console.error("Error fetching noted jobs:", err);
    } finally {
      setLoading(false);
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
      <div className="w-full">
        {/* Header Section */}
        <div className="relative h-32">
          <div className="mb-2 fixed h-32 pt-6 w-full bg-[#f2fffb] z-[9998] px-6">
            <h1 className="text-2xl lg:text-4xl text-black font-urbanist leading-tight">Noted Jobs</h1>
            <h1 className="text-sm lg:text-xl font-normal text-black font-urbanist mt-4">View jobs you’ve added notes for personalized tracking and insights.</h1>
          </div>
        </div>

        <div className="px-6 pb-6">
          {loading && <p className="mt-4 text-gray-600 text-base">Loading noted jobs...</p>}

          {!loading && notedJobs.length === 0 && (
            <p className="mt-4 text-gray-600 text-base">No jobs with notes found.</p>
          )}

          {!loading && notedJobs.length > 0 && (
            <div className="mt-10 mr-100">
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
                  {[...notedJobs].map((job, index) => (
                    <JobCard key={index} job={job} onClick={() => handleJobClick(job)} className="min-h-[380px]"
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

export default NotedJobsPage;