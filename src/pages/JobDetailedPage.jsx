import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack, IoDocumentText, IoTimeOutline, IoPersonOutline, IoWalletOutline, IoOpenOutline, IoCopyOutline, IoSend, IoTrashOutline, IoThumbsUp, IoRefresh, IoShareSocial, IoBusinessOutline, IoCalendarOutline } from "react-icons/io5";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/Navbar";
import { PiSparkleFill } from "react-icons/pi";
import Base from "../components/Base";
import { baseURL } from "../App";

const JobDetailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job } = location.state || {};
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const username = JSON.parse(localStorage.getItem("user"))?.username || "Anonymous";

  useEffect(() => {
    if (job) {
      fetchNotes();
    }
  }, [job]);

  if (!job) {
    return <div className="p-4 text-red-600 text-center">No job data available.</div>;
  }

  const handleLike = () => {
    if (!liked) {
      setIsAnimating(true);
      setLiked(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
    } else {
      setLiked(false);
    }
  };

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/get_job_notes?job_id=${job._id}`);
      if (response.status === 200) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    setLoading(true);
    setProposal("");
    try {
      const response = await axios.post(
        `${baseURL}/api/generate_proposal/`,
        { job },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        setProposal(response.data.proposal);
        toast.success("Proposal generated successfully!");
      } else {
        toast.error("Failed to generate proposal.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while generating the proposal.");
      console.error("Error generating proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    toast.success("Copied to clipboard!");
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
  
    try {
      const response = await axios.post(
        `${baseURL}/api/add_job_note`,
        {
          job_id: job._id,
          username,
          note,
          // Remove timestamp since backend sets it
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 201) {
        toast.success("Note added successfully!");
        setNote("");
        fetchNotes();
      } else {
        toast.error("Failed to add note.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred while adding the note.");
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axios.delete(`${baseURL}/api/delete_job_note/${noteId}`);
      if (response.status === 200) {
        toast.success("Note deleted successfully!");
        fetchNotes();
      } else {
        throw new Error(response.data.error || "Failed to delete note.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting the note.");
      console.error("Error deleting note:", error);
    }
  };

  const openModal = (note) => {
    setSelectedNote(note);
  };

  const closeModal = () => {
    setSelectedNote(null);
  };

  return (
    <Base>
      <div className="flex flex-col flex-1 p-4 mt-3">
        <div className="flex justify-between items-center mb-6">
          <div>
            {/* <h1 className="text-4xl font-bold text-black font-urbanist leading-tight">Hi, {username || "User"}</h1> */}
            <h2 className="text-3xl font-bold text-black font-urbanist leading-tight">Here’s a Closer Look at the Job!</h2>
            <div className="w-32 h-1 bg-teal-500 rounded-t-lg mt-4"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between mb-6 flex-col items-start space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-5">
            <h1 className="text-xl font-semibold text-black font-urbanist">{job.title}</h1>
            <span className="bg-[#f1f9f5] border-2 border-[#1e8a66] text-[#1e8a66] px-2 py-2 rounded-full font-medium text-nowrap">
              Status: {job.status || "N/A"}
            </span>
          </div>

          <div className="mb-4 p-3 bg-[#f1f9f5] rounded-lg">
            <h2 className="text-lg font-semibold text-black font-urbanist flex items-center mb-4">
              <IoDocumentText className="mr-2 text-[#1e8a66]" /> Job Description
            </h2>
            <p className="text-sm text-gray-800 font-urbanist whitespace-pre-wrap">{job.full_description}</p>
            <div className="mt-4 flex justify-end">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center space-x-2 px-2 py-1 bg-[#2AD6A1] text-black font-semibold rounded-md hover:bg-[#27CEA7] transition-all duration-300 ease-in-out"
              >
                <span>Apply Job</span>
                <IoOpenOutline className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { icon: IoWalletOutline, label: "Budget", value: job.budget },
            { icon: IoTimeOutline, label: "Posted Time", value: job.posted_time },
            { icon: IoPersonOutline, label: "Proposals", value: job.proposals },
            { icon: IoBusinessOutline, label: "Platform", value: job.platform },
          ].map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div className="bg-teal-100 p-2 rounded-full mr-3 flex items-center justify-center">
                {item.icon && <item.icon className="text-[#1e8a66]" size={24} />}
              </div>
              <div>
                <div className="text-teal-600 text-sm font-semibold font-urbanist">{item.label}</div>
                <div className="font-bold text-lg text-gray-900 font-urbanist">{item.value || "N/A"}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex space-x-4 items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900 font-urbanist">AI Proposal Generator</h2>
            <button
              onClick={handleGenerateProposal}
              disabled={loading}
              className={`group flex items-center justify-center space-x-2 px-4 py-1 bg-[#2AD6A1] text-black font-semibold rounded-lg hover:bg-[#25c99a] transition-all duration-300 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <span>{loading ? "Generating..." : "Generate"}</span>
              <PiSparkleFill size={18} className="transition-transform duration-300 group-hover:rotate-12" />
            </button>
          </div>
          <div className="relative">
            <textarea
              className="w-full h-32 p-2 border border-[#1e8a66] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e8a66] bg-[#f1f9f5] text-gray-800 font-urbanist resize-none"
              placeholder="Click 'Generate' to create a proposal for this project..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              readOnly={loading}
            ></textarea>
            {proposal && (
              <button
                onClick={handleCopyToClipboard}
                className="absolute top-3 right-5 text-[#1e8a66] hover:text-[#179e56] p-1 transition-colors duration-300"
                title="Copy to clipboard"
              >
                <IoCopyOutline size={16} />
              </button>
            )}
          </div>
          <div className="flex justify-end mt-3 space-x-3">
            <IoThumbsUp
              className={`cursor-pointer transition-all duration-300 ${liked && isAnimating
                ? "text-blue-600 scale-125 animate-pulse"
                : liked
                  ? "text-blue-600"
                  : "text-teal-600 hover:text-[#2AD6A1] hover:scale-110"
                }`}
              size={22}
              onClick={handleLike}
              title={liked ? "Unlike" : "Like"}
            />
            <IoRefresh
              className={`cursor-pointer transition-all duration-300 ${loading
                ? "text-gray-400 opacity-50 cursor-not-allowed"
                : "text-teal-600 hover:text-[#2AD6A1] hover:scale-110 hover:animate-spin"
                }`}
              size={22}
              onClick={handleGenerateProposal}
              disabled={loading} // Disable the button when loading
              title="Regenerate"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-black font-urbanist mb-3">Notes</h2>
          <h3 className="text-sm font-semibold text-black font-urbanist mb-3">Add personal notes for this job to keep track of your thoughts or reminders.</h3>
          <form onSubmit={handleAddNote} className="flex items-center mb-4">
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={note}
                maxLength={600}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note... (Limit 600 letters)"
                className="flex-1 p-2 border border-[#1e8a66] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1e8a66] bg-white text-black font-urbanist h-10"
              />
              <button
                type="submit"
                className="bg-[#2AD6A1] text-white p-2 rounded-full hover:bg-[#27CEA7] transition flex items-center justify-center"
              >
                <IoSend size={18} className="text-white" />
              </button>
            </div>
          </form>

          {notesLoading ? (
            <p className="text-[#1e8a66] font-urbanist">Loading notes...</p>
          ) : notes.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {notes.map((noteItem) => (
                <div key={noteItem._id} className="bg-white p-3 rounded-lg shadow-md w-[300px] max-w-xs relative">
                  <button
                    onClick={() => handleDeleteNote(noteItem._id)}
                    className="text-red-600 hover:text-red-800 absolute top-2 right-2"
                    title="Delete note"
                  >
                    <IoTrashOutline size={18} />
                  </button>
                  <p
                    className="text-black font-semibold text-base font-urbanist mb-2 cursor-pointer"
                    onClick={() => openModal(noteItem)}
                  >
                    {noteItem.note.length > 10 ? noteItem.note.substring(0, 10) + "..." : noteItem.note}
                  </p>
                  <div className="flex items-center text-sm font-urbanist space-x-2">
                    <div className="flex items-center space-x-1">
                      <IoPersonOutline size={12} className="text-[#1e8a66]" />
                      <span className="text-black text-xs">{noteItem.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IoCalendarOutline size={12} className="text-[#1e8a66]" />
                      <span className="text-black text-xs">{new Date(noteItem.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IoTimeOutline size={12} className="text-[#1e8a66]" />
                      <span className="text-black text-xs">{new Date(noteItem.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 font-urbanist">No notes added yet.</p>
          )}
        </div>
      </div>

      {selectedNote && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0000009c] z-[99999]">
          <div className="bg-white p-6 rounded-lg relative shadow-lg max-w-2/3 w-full border border-[#1e8a66]">
            <button
              onClick={closeModal}
              className="text-red-600 hover:text-red-800 absolute top-2 right-2"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <p className="text-black font-semibold text-base font-urbanist mb-4">{selectedNote.note}</p>
            <div className="flex items-center text-sm font-urbanist space-x-2">
              <div className="flex items-center space-x-1">
                <IoPersonOutline size={12} className="text-[#1e8a66]" />
                <span className="text-black text-xs">{selectedNote.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoCalendarOutline size={12} className="text-[#1e8a66]" />
                <span className="text-black text-xs">{new Date(selectedNote.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoTimeOutline size={12} className="text-[#1e8a66]" />
                <span className="text-black text-xs">{new Date(selectedNote.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Base>
  );
};

export default JobDetailedPage;