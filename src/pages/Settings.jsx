import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaBell, FaSearch, FaClock, FaPlay, FaPause } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Base from "../components/Base";
import { baseURL } from "../App";

const Settings = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const [settings, setSettings] = useState({
    scrapingMode: "manual",
    automaticScrapeInterval: { hours: 0, minutes: 0 },
    notificationsEnabled: true,
    notificationKeywords: [],
    selectedPlatforms: { freelancer: true, upwork: true, fiverr: false },
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("jobSearchSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settingsSaved) {
      // Redirect to home page after a short delay
      setTimeout(() => navigate("/home"), 1500);
    }
  }, [settingsSaved, navigate]);

  const fetchSettings = async () => {
    try {
      if (!userData.username) return;
      const response = await fetch(`https://aggregator-backend-sveg.onrender.com/api/get_user_settings?username=${userData.username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem("jobSearchSettings", JSON.stringify(data.settings));
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (settings.scrapingMode === "automatic") {
        const totalMinutes = settings.automaticScrapeInterval.hours * 60 + settings.automaticScrapeInterval.minutes;
        if (totalMinutes <= 0) {
          toast.error("Automatic scraping interval must be greater than 0 minutes");
          return;
        }
      }

      if (!userData.username) {
        toast.error("User not logged in.");
        return;
      }

      const response = await fetch(`https://aggregator-backend-sveg.onrender.com/api/save_user_settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userData.username, settings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings to server.");
      }

      localStorage.setItem("jobSearchSettings", JSON.stringify(settings));
      toast.success("Settings saved successfully!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {
          backgroundColor: "#4CAF50",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      setSettingsSaved(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings: " + error.message);
    }
  };

  const handleAddKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !settings.notificationKeywords.includes(trimmedKeyword) && trimmedKeyword.length <= 25) {
      setSettings((prev) => ({
        ...prev,
        notificationKeywords: [...prev.notificationKeywords, trimmedKeyword],
      }));
      setNewKeyword("");
    } else if (trimmedKeyword.length > 25) {
      toast.error("Keyword must be 25 characters or less.");
    }
  };
  

  const handleRemoveKeyword = (keywordToRemove) => {
    setSettings((prev) => ({
      ...prev,
      notificationKeywords: prev.notificationKeywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  return (
    <Base>
      <div className="pt-6 flex sm:p-6 md:px-15 md:py-10 justify-center">
        <div className="bg-white shadow-xl p-4 transform transition-all hover:shadow-2xl w-full md:rounded-xl lg:w-[90%] xl:w-3/4 2xl:w-2/3">
          <div className="flex flex-col mb-6 space-y-2 md:flex-row md:space-y-0 md:space-x-3">
            <button onClick={() => navigate("/home")} className="text-gray-600 hover:text-[#27CEA7]">
              <FaArrowLeft size={16} />
            </button>
            <h1 className="text-2xl text-gray-800 flex items-center">
              <FaClock className="mr-3 text-[#27CEA7]" />
              Job Search Settings
            </h1>
          </div>

        <section className="mb-6 p-4 bg-[#f2fffb] rounded-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaSearch className="mr-3 text-[#27CEA7]" />
            Scraping Mode
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings((prev) => ({ ...prev, scrapingMode: "manual" }))}
              className={`flex items-center justify-center py-3 rounded-xl transition-all duration-300 ${settings.scrapingMode === "manual"
                  ? "bg-[#27CEA7] text-white"
                  : "bg-white border border-[#27CEA7] text-[#27CEA7] hover:bg-[#f2fffb]"
                  }`}
              >
                <FaPause className="mr-2" />
                Manual Scrape
              </button>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, scrapingMode: "automatic" }))}
                className={`flex items-center flex-1 justify-center py-3 rounded-xl transition-all duration-300 ${settings.scrapingMode === "automatic"
                  ? "bg-[#27CEA7] text-white"
                  : "bg-white border border-[#27CEA7] text-[#27CEA7] hover:bg-[#f2fffb]"
                }`}
            >
              <FaPlay className="mr-2" />
              Automatic Scrape
            </button>
          </div>
          {settings.scrapingMode === "automatic" && (
            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Scraping Interval</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hours</label>
                  <input
                    type="number"
                    value={settings.automaticScrapeInterval.hours}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setSettings((prev) => ({
                        ...prev,
                        automaticScrapeInterval: {
                          ...prev.automaticScrapeInterval,
                          hours: Math.max(0, Math.min(24, value)),
                        },
                      }));
                    }}
                    min="0"
                    max="24"
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Minutes</label>
                  <input
                    type="number"
                    value={settings.automaticScrapeInterval.minutes}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        automaticScrapeInterval: {
                          ...prev.automaticScrapeInterval,
                          minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                        },
                      }))
                    }
                    min="0"
                    max="59"
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mb-6 p-4 bg-[#f2fffb] rounded-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaBell className="mr-3 text-[#27CEA7]" />
            Notification Settings
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Enable Notifications</span>
            <div
              onClick={() => setSettings((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
              className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-300 ${settings.notificationsEnabled ? "bg-[#27CEA7]" : "bg-gray-300"}`}
              role="switch"
              aria-checked={settings.notificationsEnabled}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSettings((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
                }
              }}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${settings.notificationsEnabled ? "translate-x-full" : "translate-x-0"}`}
              />
            </div>
          </div>

          {settings.notificationsEnabled && (
            <div>
              <label className="block text-gray-700 mb-2">Job Keywords for Notifications</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword to notify"
                  className="flex-grow p-2 border rounded-l-xl"
                />
                <button
                  onClick={handleAddKeyword}
                  className="bg-[#27CEA7] text-white px-4 rounded-r-xl hover:bg-[#1DBF97]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.notificationKeywords.map((keyword) => (
                  <span key={keyword} className="bg-[#E0FFF6] text-[#27CEA7] px-3 py-1 rounded-full flex items-center">
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-[#27CEA7] text-white px-6 py-3 rounded-xl text-sm hover:bg-[#1DBF97] flex items-center"
            >
              <FaSave className="mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Base>
  );
};

export default Settings;
