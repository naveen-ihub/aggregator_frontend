import React, { useContext, useState, useEffect } from "react";
import { FaUser, FaBell, FaList, FaUserAlt, FaGem, FaCog, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RefreshStateContext } from "../../contexts/refreshState";
import { JobCard } from "../pages/NotedJobsPage";
import { baseURL } from "../App";



const platforms = {
  "freelancer.com": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPlyZPlLukwt5NwE2kxG8ViyrVonVVb7t2ag&",
  "upwork.com": "https://www.upwork.com/favicon.ico",
  "peopleperhour.com": "https://www.peopleperhour.com/favicon.ico",
  "guru.com": "https://www.guru.com/favicon.ico",
};

const TopNavbar = ({ setShowSideBar }) => {
  const [newJobNotification, setNewJobNotification] = useState(false);
  const [keywordNotification, setKeywordNotification] = useState(false); // New state for keyword matches
  const [showNotification, setShowNotification] = useState(false);
  const [newJobs, setNewJobs] = useState([]);
  const [matchedKeywordJobs, setMatchedKeywordJobs] = useState([]); // Jobs matching keywords
  const navigate = useNavigate();
  const { refresh, setRefresh } = useContext(RefreshStateContext);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const username = JSON.parse(localStorage.getItem("user"))?.username || "Anonymous";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "super-admin") {
      setIsSuperAdmin(true);
    }
  }, []);

  const handleProfileClick = () => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    navigate("/user", { state: { user: userData } });
  };

  const fetchUserSettings = async (username) => {
    try {
      const response = await fetch(`${baseURL}/api/get_user_settings?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      return data.settings || {};
    } catch (err) {
      console.error("Error fetching user settings:", err);
      return {};
    }
  };

  const fetchExistingJobs = async (username) => {
    try {
      const response = await fetch(`${baseURL}/api/get_existing_jobs?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      setNewJobs(data.new_jobs || []);

      // Check for new jobs
      const hasNewJobs = data.new_job_found;
      setNewJobNotification(hasNewJobs);
      if (hasNewJobs) {
        toast.info("New job(s) found!", { autoClose: 3000 });
      }

      // Fetch user settings for notification keywords
      const settings = await fetchUserSettings(username);
      const notificationKeywords = settings.notificationKeywords || [];

      // Check for keyword matches in new jobs
      if (notificationKeywords.length > 0 && data.new_jobs) {
        const matchedJobs = data.new_jobs.filter((job) => {
          const jobText = `${job.title || ""} ${job.description || ""}`.toLowerCase();
          return notificationKeywords.some((keyword) =>
            jobText.includes(keyword.toLowerCase())
          );
        });

        if (matchedJobs.length > 0) {
          setKeywordNotification(true);
          setMatchedKeywordJobs(matchedJobs);
          toast.info("Jobs matching your keywords found!", { autoClose: 3000 });
        } else {
          setKeywordNotification(false);
          setMatchedKeywordJobs([]);
        }
      } else {
        setKeywordNotification(false);
        setMatchedKeywordJobs([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch existing jobs.");
      console.error("Error fetching existing jobs:", err);
    }
  };

  const fetchData = async () => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        await fetchExistingJobs(parsedUserData.username);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      if (refresh[refresh.length - 1] === "latest jobs") {
        await fetchData();
        setNewJobNotification(true); // Trigger new job notification on refresh
      }
    })();
  }, [refresh]);

  const hasNotifications = newJobNotification || keywordNotification;

  return (
    <div className="bg-[#f2fffb] z-[9997] w-full flex fixed h-20 top-0 left-0 justify-between items-center space-x-3 py-6 px-5">
      <FaList onClick={() => setShowSideBar((prevState) => !prevState)} className="lg:hidden text-gray-600" />
      <span className="summa"></span>
      <div className="flex">
        <button
          onClick={handleProfileClick}
          className="text-gray-600 flex items-center space-x-3 mr-3 hover:text-[#1e8a66] hover:bg-transparent py-2 rounded-md transition duration-300"
          title="Profile"
        >
          <FaUserAlt size={20} /> <p className="text-xl"> {username} </p>
        </button>
        {!isSuperAdmin && (
          <>
            <button
              className="text-gray-600 hover:text-[#1e8a66] hover:bg-transparent p-2 rounded-md transition duration-300 relative"
              onClick={() => hasNotifications && setShowNotification((prevState) => !prevState)}
            >
              <FaBell size={20} />
              {hasNotifications && (
                <span
                  className="absolute bg-red-500 rounded-full animate-pulse"
                  style={{
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    left: "17px",
                    top: "7px",
                  }}
                ></span>
              )}
            </button>

            <button
              className="text-gray-600 hover:text-[#1e8a66] hover:bg-transparent p-2 rounded-md transition duration-300 relative"
              onClick={() => (window.location.href = "/settings")}
            >
              <FaCog size={20} />
            </button>
          </>
        )}
      </div>

      {showNotification && (
        <div className="fixed inset-0 bg-[#000000b8] z-50 flex justify-end">
          <div className="py-4 bg-white w-[90%] sm:w-2/3 lg:w-[40%] xl:w-1/3 rounded-lg flex flex-col relative">
            <div className="flex justify-between text-2xl pb-3 border-b border-gray-400 px-4">
              <p>Notifications</p>
              <button
                onClick={() => {
                  setNewJobNotification(false);
                  setKeywordNotification(false);
                  setShowNotification(false);
                  setRefresh((prevRefresh) => [...prevRefresh, "notifications confirmed"]);
                }}
                className="text-gray-600 hover:text-[#1e8a66]"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {newJobNotification && (
              <div className="mt-6 p-3 m-4 bg-[#d4edda] text-[#155724] rounded-md">
                New job(s) found! and Jobs Founded based on your keywords..
              </div>
            )}
            {keywordNotification && (
              <div className="mt-6 p-3 m-4 bg-[#fff3cd] text-[#856404] rounded-md">
                **Jobs matching your keywords found!**
              </div>
            )}
            <div className="pt-4 px-3 flex flex-col space-y-2 overflow-y-auto custom-scrollbar">
              {newJobNotification &&
                newJobs.map((job, key) => <JobCard job={job} key={`new-${key}`} />)}
              {keywordNotification &&
                matchedKeywordJobs.map((job, key) => (
                  <JobCard job={job} key={`keyword-${key}`} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;
