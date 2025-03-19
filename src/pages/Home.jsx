import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaSearch, FaTimes, FaAngleDoubleRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import RefreshContext, { RefreshStateContext } from "../../contexts/refreshState";
import Base from "../components/Base";
import { baseURL } from "../App";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

const Home = () => {
  const [query, setQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [latestJobs, setLatestJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [platform, setPlatform] = useState("freelancer.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [newJobNotification, setNewJobNotification] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [scrapingMode, setScrapingMode] = useState("manual");
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUsername(parsedUserData.username);
        fetchExistingJobs(parsedUserData.username);
        fetchSavedJobs(parsedUserData.username);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    const storedSettings = localStorage.getItem("jobSearchSettings");
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setScrapingMode(parsedSettings.scrapingMode);
    }
  }, []);

  const fetchExistingJobs = async (username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://aggregatorbackend-production.up.railway.app/api/get_existing_jobs?username=${username}`
      );

      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const preprocessJobs = (jobs) =>
        jobs.map((job) => ({
          ...job,
          title: job.title || "Untitled",
          description: job.description || "",
          tech_stack: job.tech_stack || "",
          skills: job.skills || "",
        }));

      setLatestJobs(preprocessJobs(data.new_jobs || []));
      setAllJobs(preprocessJobs(data.all_jobs || []));
    } catch (err) {
      setError(err.message || "Failed to fetch existing jobs.");
      console.error("Error fetching existing jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async (username) => {
    try {
      const response = await axios.get(`https://aggregatorbackend-production.up.railway.app/api/get_saved_jobs?username=${username}`);
      if (response.status === 200) {
        const savedJobs = response.data.saved_jobs || [];
        const savedIds = new Set(savedJobs.map((job) => job._id));
        setSavedJobIds(savedIds);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.warn("Please provide a keyword");
      return;
    }

    setLoading(true);
    setError(null);
    setLatestJobs([]);
    setAllJobs([]);
    setNewJobNotification(false);
    setFilterQuery("");

    try {
      const response = await fetch(
        `https://aggregatorbackend-production.up.railway.app/api/scrape_jobs?search_query=${query}&platform=${platform}&username=${username}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        setError("No jobs found for this search, or invalid API response.");
        return;
      }

      await fetchExistingJobs(username);
      setNewJobNotification(data.new_job_found);
      if (data.new_job_found) {

      }
    } catch (err) {
      setError(err.message || "Failed to fetch jobs. Please try again.");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotFit = async (job) => {
    try {
      const response = await axios.patch(`https://aggregatorbackend-production.up.railway.app/api/update_status`, {
        job_id: job._id,
        status: "notFit",
      });

      if (response.status === 200) {
        toast.success("Job status updated successfully!");
        await fetchExistingJobs(username);
      } else {
        toast.error("Failed to update job status.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while updating.");
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

  const filterJobs = (jobs) => {
    if (!filterQuery.trim()) return jobs;
    const lowerQuery = filterQuery.toLowerCase();
    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const description = (job.description || "").toLowerCase();
      const techStack = (job.tech_stack || "").toLowerCase();
      const skills = (job.skills || "").toLowerCase();

      return (
        title.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        techStack.includes(lowerQuery) ||
        skills.includes(lowerQuery)
      );
    });
  };

  const { setRefresh } = useContext(RefreshStateContext);

  useEffect(() => {
    if (newJobNotification) setRefresh((refresh) => [...refresh, "latest jobs"]);
  }, [newJobNotification]);

  const displayedLatestJobs = filterJobs(latestJobs);
  const displayedAllJobs = filterJobs(allJobs);

  const handleViewJob = (job) => {
    navigate("/job-details", { state: { job } });
  };

  const handleToggleSave = async (jobId) => {
    try {
      const isSaved = savedJobIds.has(jobId);
      const endpoint = isSaved ? "remove_saved_job" : "save_job";
      const response = await axios.post(`https://aggregatorbackend-production.up.railway.app/api/${endpoint}`, {
        username,
        job_id: jobId,
      });
      if (response.status === 200 || response.status === 201) {
        setSavedJobIds((prev) => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(jobId);
          } else {
            newSet.add(jobId);
          }
          return newSet;
        });
        toast.info(isSaved ? "Job unsaved!" : "Job saved!");
      } else {
        toast.error(`Failed to ${isSaved ? "unsave" : "save"} job.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || `An error occurred while ${savedJobIds.has(jobId) ? "unsaving" : "saving"} the job.`);
      console.error("Error toggling save job:", error);
    }
  };

  return (
    <Base>
      <div className="w-full">
        {/* Header Section */}
        <div className="relative h-105 sm:h-80 md:h-60 lg:h-55 xl:h-50 z-[9995] bg-[#f2fffb] w-full flex">
          <div className="h-105 sm:h-80 md:h-60 lg:h-55 xl:h-50 fixed w-full pb-8 px-8 bg-[#f2fffb] lg:pl-64 left-0">
            <div className="flex flex-col md:flex-row justify-between items-start space-y-10 mt-5">
              <div>
                <h1 className="text-4xl font-normal text-black font-urbanist mt-4 mb-4">Let's explore something new</h1>
              </div>

              {scrapingMode === "manual" && (
                <div className="flex items-center gap-3 flex-wrap md:justify-end xl:flex-nowrap md:pl-20">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter job keyword"
                    className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    maxLength={30}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-teal-500 text-black px-6 py-2 rounded-md hover:bg-teal-600 transition duration-200 font-semibold text-sm"
                  >
                    Scrape Jobs
                  </button>
                </div>
              )}
            </div>

            {(latestJobs.length > 0 || allJobs.length > 0) && (
              <div className="flex flex-col justify-between space-y-6 md:items-center md:flex-row md:space-x-6 md:space-y-0 mt-10 md:mt-0">
                <div className="flex space-x-6">
                  <button
                    className={`text-[1.1875rem] leading-7 font-urbanist font-semibold ${activeTab === "latest" ? "text-black border-b-2 border-teal-500" : "text-gray-400"}`}
                    onClick={() => setActiveTab("latest")}
                  >
                    Latest Job
                  </button>
                  <button
                    className={`text-[1.1875rem] leading-7 font-urbanist font-semibold ${activeTab === "all" ? "text-black border-b-2 border-teal-500" : "text-gray-400"}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Job
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search Jobs"
                    className="w-full p-2 pl-4 border border-gray-400 rounded-full text-sm text-gray-600 focus:ring-2 focus:ring-teal-500 md:w-96"
                  />
                  <span className="absolute right-1.5 top-1 transform bg-teal-500 p-2 rounded-full">
                    <FaSearch className="text-sm" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8">
          {error && <div className="mt-4 text-red-600 font-semibold text-base">{error}</div>}

          {(latestJobs.length > 0 || allJobs.length > 0) && (
            <div className="w-full mt-6">
              <div className="mt-4">
                {activeTab === "latest" && displayedLatestJobs.length > 0 && (
                  <JobList
                    jobs={displayedLatestJobs}
                    extractTechStack={extractTechStack}
                    onViewJob={handleViewJob}
                    onNotFit={handleNotFit}
                    onToggleSave={handleToggleSave}
                    savedJobIds={savedJobIds}
                  />
                )}
                {activeTab === "latest" && displayedLatestJobs.length === 0 && (
                  <p className="text-gray-600 text-base">No latest open jobs match your filter.</p>
                )}
                {activeTab === "all" && displayedAllJobs.length > 0 && (
                  <JobList
                    jobs={displayedAllJobs}
                    extractTechStack={extractTechStack}
                    onViewJob={handleViewJob}
                    onNotFit={handleNotFit}
                    onToggleSave={handleToggleSave}
                    savedJobIds={savedJobIds}
                  />
                )}
                {activeTab === "all" && displayedAllJobs.length === 0 && (
                  <p className="text-gray-600 text-base">No open jobs match your filter.</p>
                )}
              </div>
            </div>
          )}

          {loading && !latestJobs.length && !allJobs.length && (
            <p className="mt-4 text-gray-600 text-base">Loading jobs from database...     This may take Some Time...</p>
          )}
          {!loading && !latestJobs.length && !allJobs.length && (
            <p className="mt-4 text-gray-600 text-base">No open jobs available. Start by Scraping for jobs!</p>
          )}
        </div>
      </div>
    </Base>
  );
};

const JobList = ({ jobs, extractTechStack, onViewJob, onNotFit, onToggleSave, savedJobIds }) => {
  const navigate = useNavigate();

  const updatePending = async (job) => {
    try {
      const response = await axios.patch(`https://aggregatorbackend-production.up.railway.app/api/update_status`, {
        job_id: job._id,
        status: "pending",
      });
      if (response.status === 200) {
        toast.success("Job status updated successfully!");
      } else {
        toast.error("Failed to update job status.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while updating.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
      {jobs.map((job, index) => {
        const { cleanedDescription, techStack } = extractTechStack(job.description || job.summary);
        const isSaved = savedJobIds.has(job._id);

        return (
          <div
            key={index}
            onClick={() => onViewJob(job)}
            className="bg-white p-6 shadow-md rounded-lg flex flex-col cursor-pointer hover:shadow-lg transition relative w-full min-h-[260px]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job._id);
              }}
              className={`absolute top-4 right-4 p-2 rounded-full ${isSaved ? "bg-teal-100 text-teal-600" : "bg-gray-300 text-gray-500"} hover:bg-teal-200 transition z-10`}
              title={isSaved ? "Unsave Job" : "Save Job"}
            >
              <FaBookmark className="text-sm" />
            </button>

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
              <h3 className="text-lg font-semibold text-black font-urbanist flex-1 pr-5 line-clamp-3">{job.title}</h3>
            </div>

            <div className="mb-4 flex-grow">
              <p className="text-gray-800 text-sm font-urbanist leading-5 text-justify line-clamp-3 h-[60px]">{cleanedDescription}</p>
            </div>

            {/* {techStack.length > 0 && (
              <div className="bg-yellow-100 p-2 rounded-md mb-4">
                <strong className="text-black font-urbanist text-sm">Tech Stack:</strong>{" "}
                {techStack.join(", ")}
              </div>
            )} */}

            <div className="flex items-center space-x-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNotFit(job);
                }}
                className="border border-teal-500 text-black px-2 py-2 rounded-lg hover:bg-teal-100 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
              >
                <FaTimes className="text-black text-sm" />
                <span>Not Fit For Us</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updatePending(job);
                }}
                className="bg-teal-500 text-black px-4 py-2 rounded-lg hover:bg-teal-600 transition font-semibold text-sm font-urbanist flex items-center space-x-1"
              >
                <span>Move Forward</span>
                <FaAngleDoubleRight className="text-black text-sm" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;