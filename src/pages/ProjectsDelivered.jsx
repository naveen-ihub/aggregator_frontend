import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Base from "../components/Base";
import { baseURL } from "../App";

const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

const ProjectsDelivered = () => {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        const user = parsedUserData.username || "Anonymous";
        setUsername(user);
        fetchCompletedJobs(user);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setError("Failed to load user data.");
      }
    } else {
      setError("No user data found in localStorage.");
    }
  }, []);

  const fetchCompletedJobs = async (username) => {
    if (!username) {
      setError("Username is not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/get_completed_jobs?username=${username}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch completed jobs");
      }
      const data = await response.json();
      console.log("Fetched Completed Jobs Data:", data);
      setCompletedJobs(data.completed_jobs || []);
    } catch (error) {
      console.error("Error fetching completed jobs:", error);
      setError(error.message || "Failed to fetch completed jobs");
      toast.error(error.message || "Failed to fetch completed jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (job) => {
    navigate("/job-details", { state: { job } });
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

  // Format the completion date
  const formatCompletionDate = (date) => {
    if (!date || date === "N/A") return "Unknown Date";
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? "Invalid Date" : parsedDate.toLocaleDateString();
  };

  return (
    <Base>
      <div className="w-full mb-5 flex-1 flex-col flex pr-2">
        {/* Header Section */}
        <div className="relative h-32">
          <div className="mb-8 fixed h-32 pt-6 w-full bg-[#f2fffb] z-[9998] px-6">
            <div>
              <h1 className="text-2xl lg:text-4xl mb-2 text-black font-bold font-urbanist leading-tight">Projects Delivered</h1>
              <h1 className="text-sm lg:text-xl font-normal text-black font-urbanist mt-5">Review your successfully completed projects.</h1>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 bg-teal-50 bg-opacity-30 border border-teal-400 shadow-lg hover:shadow-[0_10px_30px_rgba(13,148,136,0.3)] rounded-xl flex-1 transition-shadow duration-300 backdrop-blur-sm">

        {loading &&             <div className="z-[9999] top-0 left-0 flex justify-center items-center flex flex-col h-full w-full">
              <span class="loader"></span><br></br>
              <p className="text-black"> Hang tight! Your delivered projects are on the way...</p>
            </div>}


          {error && <div className="mt-4 text-red-600 font-semibold text-base">{error}</div>}

          {!loading && completedJobs.length === 0 && (
            <p className="mt-4 text-gray-600 text-base">No completed projects found.</p>
          )}

          {!loading && completedJobs.length > 0 && (
            <div className="mt-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 justify-self-center gap-4">
                {completedJobs.map((job, index) => {
                  const { cleanedDescription, techStack } = extractTechStack(job.description || job.summary);
                  const completionDate = formatCompletionDate(job.inserted_at); // Use inserted_at or update to updated_at if available

                  return (
                    <div
                      key={index}
                      onClick={() => handleViewJob(job)}
                      className="border border-teal-100 bg-white p-6 shadow-md rounded-lg flex flex-col cursor-pointer active:cursor-grabbing hover:scale-[1.03] transition-all duration-300 hover:shadow-lg transition relative w-full min-h-[260px]"
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

                      {/* Completion Date */}
                      <div className="flex justify-between items-center">
                        <div className="bg-teal-500 text-black px-4 py-2 cursor-not-allowed rounded-lg font-semibold text-sm font-urbanist text-center">
                          Completed date : {completionDate}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </Base>
  );
};

export default ProjectsDelivered;