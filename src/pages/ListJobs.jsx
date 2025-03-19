import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import Base from "../components/Base";
import { FaSearch } from "react-icons/fa";
import { baseURL } from "../App";

const sectionBorderColors = {
  yetToConfirm: "#F59E0B",
  alreadyContacted: "#EA580C",
  completed: "#10B981",
  workingOn: "#3B82F6",
};

const status = {
  yetToConfirm: {
    status: "pending",
    message: "Are you sure you want to change this job's status to Pending?",
  },
  alreadyContacted: {
    status: "contacted",
    message: "Are you sure you want to change this job's status to Contacted?",
  },
  completed: {
    status: "completed",
    message: "Are you sure you want to change this job's status to Completed?",
  },
  workingOn: {
    status: "working",
    message: "Are you sure you want to change this job's status to Working On?",
  },
};

const crumbColors = ["#da78a7", "#8aa7fb", "#80d5db"];

const JobCard = ({ details, index }) => {
  const elementRef = useRef(null);

  function drag(ev) {
    ev.dataTransfer.setData("jobId", details._id);
    ev.dataTransfer.setData("status", details.status);
  }

  return (
    <div
      ref={elementRef}
      draggable
      id={`job-${details._id}`}
      className={`select-none bg-white rounded-md shadow-md flex flex-col p-3 h-45 justify-between text-xs space-y-5 z-10 w-full cursor-grab active:cursor-grabbing hover:scale-[1.03] transition-all duration-300`}
      onDragStart={drag}
    >
      <div className="flex flex-col space-y-1">
        <p className={`p-2 rounded-sm bg-[#009689] w-fit py-1.5 text-white`}>
          #{details.platform}
        </p>
        <div className="w-full flex justify-between">
          <p className="text-lg line-clamp-2">{details.title}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          {/* <div className="flex space-x-1 items-center text-blue-400">
            <i className="bi bi-globe2"></i>
            <p className="underline underline-offset-2">{details.platform}</p>
          </div> */}
          <p className="font-semibold">
            Proposals: <span className="font-normal">{details.proposals}</span>
          </p>
        </div>

        <p className="p-1.5 rounded-md px-5 border border-[#009689]">
          {details.status?.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
        </p>
      </div>
    </div>
  );
};

const SectionHolder = ({ borderColor, title, items, onDrop, updationStatus, fetchAll }) => {
  const scrollContainerRef = useRef(null);

  function allowDrop(ev) {
    ev.preventDefault();
  }

  async function drop(ev) {
    ev.preventDefault();
    var jobId = ev.dataTransfer.getData("jobId");
    var stat = ev.dataTransfer.getData("status");

    if (!jobId) return;
    if (stat === status[updationStatus].status) return;

    const userConfirmed = await Swal.fire({
      title: "Confirm Status Update",
      text: status[updationStatus].message,
      icon: "warning",
      iconColor: "#009689",
      showCancelButton: true,
      confirmButtonColor: "#009689",
      cancelButtonColor: "#d33",

      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!userConfirmed.isConfirmed) return;

    try {
      const response = await axios.patch(`https://aggregatorbackend-production.up.railway.app/api/update_status`, {
        job_id: jobId,
        status: status[updationStatus].status,
      });

      if (response.status === 200) {
        fetchAll();
        toast.success("Job status updated successfully!");
        onDrop(jobId);
      } else {
        toast.error("Failed to update job status.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while updating.");
    }
  }

  return (
    <div className="flex flex-col flex-1 w-1/4 relative h-[80vh] border border-[#0096893f] rounded-lg" onDragOver={allowDrop} onDrop={drop}>

      <div className="p-4 flex justify-between items-center pb-2 h-15">
        <p className="text-2xl">{title}</p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto h-[80vh] space-y-3 p-3 custom-scrollbar pb-4">
        {
          items.length === 0 && <p className="text-center p-2 rounded-md  text-[#a3cfbb] opacity-100 text-sm mt-10">
            No Jobs Under {title}
          </p>
        }
        {items.map((details, key) => (
          <JobCard details={details} index={key} key={details._id} />
        ))}
      </div>

    </div>
  );
};


export default function ListJobs() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [contactedJobs, setContactedJobs] = useState([]);
  const [workingJobs, setWorkingJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");

  // Retrieve the logged-in user's username
  const [username, setUsername] = useState("");
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUsername(parsedUserData.username || "Anonymous");
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUsername("Anonymous");
      }
    }
  }, []);

  const fetchJobsByStatus = async (status, setState) => {
    try {
      console.log(`Fetching ${status} jobs for username: ${username}`); // Log the username being used
      const response = await fetch(`https://aggregatorbackend-production.up.railway.app/api/get_${status}_jobs?username=${username}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${status} jobs`);
      }
      const data = await response.json();
      console.log(`${status} jobs response:`, data); // Log the API response
      setState(data[`${status}_jobs`] || []);
    } catch (error) {
      console.error(`Error fetching ${status} jobs:`, error);
      toast.error(error.message || `Failed to fetch ${status} jobs`);
    }
  };

  const fetchAll = () => {
    if (!username) return; // Wait until username is set
    fetchJobsByStatus("pending", setPendingJobs);
    fetchJobsByStatus("contacted", setContactedJobs);
    fetchJobsByStatus("working", setWorkingJobs);
    fetchJobsByStatus("completed", setCompletedJobs);
  };

  useEffect(() => {
    fetchAll();
  }, [username]); // Re-fetch jobs when username changes

  const handleDrop = (jobId, newSection) => {
    let allJobs = [...pendingJobs, ...contactedJobs, ...workingJobs, ...completedJobs];
    const jobToMove = allJobs.find((job) => job._id === jobId);

    if (!jobToMove) return;

    setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
    setContactedJobs((prev) => prev.filter((job) => job._id !== jobId));
    setWorkingJobs((prev) => prev.filter((job) => job._id !== jobId));
    setCompletedJobs((prev) => prev.filter((job) => job._id !== jobId));

    if (newSection === "pending") setPendingJobs((prev) => [...prev, jobToMove]);
    if (newSection === "contacted") setContactedJobs((prev) => [...prev, jobToMove]);
    if (newSection === "working") setWorkingJobs((prev) => [...prev, jobToMove]);
    if (newSection === "completed") setCompletedJobs((prev) => [...prev, jobToMove]);
  };

  const filterJobs = (jobs) => {
    if (!filterQuery) return jobs;
    const query = filterQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.toLowerCase().includes(query)
    );
  };

  const filteredPendingJobs = filterJobs(pendingJobs);
  const filteredContactedJobs = filterJobs(contactedJobs);
  const filteredWorkingJobs = filterJobs(workingJobs);
  const filteredCompletedJobs = filterJobs(completedJobs);

  return (
    <Base>
      <div className="flex-1 p-4">
        <div className="flex flex-col items-start space-y-8 mb-8 sm:flex-row sm:justify-between sm:items-center space-x-8 sm:space-y-0">
          <div className="text-3xl">
            <p className="text-xl pl-1">Job Pipeline Tracker</p>
            <p className="text-4xl">Project Status Overview</p>
          </div>
          <div className="relative w-96">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter jobs by title, description, or skills..."
              className="w-full p-2 pl-4 border border-gray-400 rounded-full text-sm text-gray-600 focus:ring-2 focus:ring-teal-500"
            />
            <span className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-teal-500 p-2 rounded-full">
              <FaSearch className="text-sm" />
            </span>
          </div>
        </div>

        <div className="xl:hidden flex justify-center mt-20">
          <p className="p-3.5 px-10 border rounded-lg bg-[#f8d7da] text-[#991c24] border-[#991c24]"> This Page is best viewed in large laptop screens </p>
        </div>

        <div className="space-x-3 flex-1 hidden xl:flex">
          <SectionHolder
            fetchAll={fetchAll}
            title="Under Review"
            updationStatus="yetToConfirm"
            borderColor={sectionBorderColors.yetToConfirm}
            items={filteredPendingJobs}
            onDrop={(jobId) => handleDrop(jobId, "pending")}
          />
          <SectionHolder
            fetchAll={fetchAll}
            title="Outreach Initiated"
            updationStatus="alreadyContacted"
            borderColor={sectionBorderColors.alreadyContacted}
            items={filteredContactedJobs}
            onDrop={(jobId) => handleDrop(jobId, "contacted")}
          />
          <SectionHolder
            fetchAll={fetchAll}
            title="In Progress"
            updationStatus="workingOn"
            borderColor={sectionBorderColors.workingOn}
            items={filteredWorkingJobs}
            onDrop={(jobId) => handleDrop(jobId, "working")}
          />
          <SectionHolder
            fetchAll={fetchAll}
            title="Project Delivered"
            updationStatus="completed"
            borderColor={sectionBorderColors.completed}
            items={filteredCompletedJobs}
            onDrop={(jobId) => handleDrop(jobId, "completed")}
          />
        </div>
      </div>
    </Base>
  );
}