import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaProjectDiagram, FaCheckCircle, FaTimesCircle, FaEnvelope, FaToolbox, FaBookmark, FaStickyNote, FaDownload, FaHourglassHalf } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import Base from "../components/Base";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Legend } from "recharts";
import "react-toastify/dist/ReactToastify.css";
import { baseURL } from "../App";

const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md flex justify-between items-center flex-1 min-w-50 transform transition-all hover:scale-105 hover:shadow-lg border-l-4 border-[#4fd1c5]">
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-base text-[#4fd1c5] font-medium">{label}</p>
      </div>
      <div className="p-3 rounded-full flex items-center justify-center bg-gradient-to-r from-[#4fd1c5] to-[#38a89d] shadow-lg">
        <Icon className="text-white" size={20} />
      </div>
    </div>
  );
};

const ProjectStatsDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    working: 0,
    completed: 0,
    notFit: 0,
    saved: 0,
    noted: 0,
    scrapedToday: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const [lineChartData, setLineChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUsername(parsedUserData.username);
        fetchStats(parsedUserData.username);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchStats = async (username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/get_existing_jobs_count?username=${username}`);
      if (!response.ok) {
        const text = await response.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const statsData = {
        total: data.counts.total || 0,
        pending: data.counts.pending || 0,
        contacted: data.counts.contacted || 0,
        working: data.counts.working || 0,
        completed: data.counts.completed || 0,
        notFit: data.counts.notFit || 0,
        saved: data.counts.saved || 0,
        noted: data.counts.noted || 0,
        scrapedToday: data.counts.scrapedToday || 0,
      };

      setStats(statsData);

      const updatedBarChartData = [
        { name: "Working", working: statsData.working },
        { name: "Completed", completed: statsData.completed },
      ];

      setBarChartData(updatedBarChartData);

      const newLineData = [
        { name: "Under Review", value: statsData.pending },
        { name: "Contacted", value: statsData.contacted },
        { name: "Working", value: statsData.working },
        { name: "Completed", value: statsData.completed },
      ];

      setLineChartData(newLineData);
    } catch (err) {
      setError(err.message || "Failed to fetch stats.");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = [
    { name: "Under Review", value: stats.pending, color: "#4C51BF" },
    { name: "Contacted", value: stats.contacted, color: "#38B2AC" },
  ];

  const pieChartData2 = [
    { name: "Total Jobs", value: stats.total, color: "#ED8936" },
    { name: "Under Review", value: stats.pending, color: "#38B2AC" },
    { name: "Not Fit", value: stats.notFit, color: "#E53E3E" },
  ];

  const statsData1 = [
    { label: "Under Review", value: stats.pending, icon: FaHourglassHalf },
    { label: "Contacted", value: stats.contacted, icon: FaEnvelope },
    { label: "Working On", value: stats.working, icon: FaToolbox },
    { label: "Completed", value: stats.completed, icon: FaCheckCircle },
  ];

  const statsData2 = [
    { label: "Total Projects", value: stats.total, icon: FaProjectDiagram },
    { label: "Scraped Today", value: stats.scrapedToday, icon: FaDownload },
  ];

  const statsData3 = [
    { label: "Not Fit For Us", value: stats.notFit, icon: FaTimesCircle },
    { label: "Saved Jobs", value: stats.saved, icon: FaBookmark },
    { label: "Noted Jobs", value: stats.noted, icon: FaStickyNote },
  ];

  // Custom Tooltip Component for better styling
  const CustomTooltip = ({ active, payload, label, total }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((entry, index) => {
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Calculate total for pieChartData2 to fix percentages
  const pieChart2Total = pieChartData2.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Base>
      <div className="container mx-auto p-6 pt-0 bg-teal-50">
        <div className="relative h-32">
          <div className="mb-8 h-32 pt-6 w-full z-[9998]">
            <h1 className="text-2xl md:text-4xl text-black font-bold font-urbanist">Project Statistics Dashboard</h1>
            <p className="text-gray-600 mt-2 font-urbanist">Uncover insights at a glance</p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#27CEA7]"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-white shadow-lg border-l-4 border-red-500 rounded-lg text-black font-semibold text-center">
            {error}
            <button
              className="ml-4 px-4 py-2 bg-gradient-to-r from-[#27CEA7] to-[#1FA588] text-white rounded-md hover:shadow-lg transition"
              onClick={() => fetchStats(username)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData1.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  bgColor="bg-[#E0FFF9]"
                  textColor="text-[#27CEA7]"
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>

            {/* Top row with Bar Chart and Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform transition-all hover:shadow-2xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-urbanist">Working vs Completed</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="white" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="white"
                      tick={{ fontSize: 12, fontFamily: "Urbanist", fill: "#6b7280" }}
                      axisLine={{ stroke: "white" }}
                    />
                    <YAxis
                      stroke="white"
                      tick={{ fontSize: 12, fontFamily: "Urbanist", fill: "#6b7280" }}
                      axisLine={{ stroke: "white" }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{
                        paddingBottom: "10px",
                        fontFamily: "Urbanist",
                        fontSize: 12,
                      }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill="#47b3ee"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      background={{ fill: "#f8fafc", radius: 4 }}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-completed-${index}`}
                          fill="url(#completedGradient)"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="working"
                      stackId="a"
                      fill="#27CEA7"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-working-${index}`}
                          fill="url(#workingGradient)"
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="workingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#34D399" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart (Under Review vs Contacted) */}
              <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:shadow-2xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-urbanist">Under Review vs Contacted</h3>
                <div className="flex flex-col">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                    <Pie
  data={pieChartData}
  cx="50%"
  cy="50%"
  outerRadius={80}
  innerRadius={50}
  dataKey="value"
  startAngle={90}
  endAngle={450}
  paddingAngle={4}
label={({ value }) => `${value}`}
  labelLine={{ stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "2 2" }}
>
  {pieChartData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={`url(#pieGradient2-${index})`}
      stroke="#FFFFFF"
      strokeWidth={2}
    />
  ))}
</Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const total = stats.pending + stats.contacted;
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                          return [`${value} (${percentage}%)`, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: "rgb(178, 223, 219)",
                          borderRadius: "10px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid rgb(0, 137, 123)",
                          fontSize: "14px",
                          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                          minHeight: "10px"
                        }}
                        itemStyle={{
                          color: "#004D40",
                          fontWeight: 500,
                          marginBottom: "4px"
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#00695C",
                          marginBottom: "8px"
                        }}
                      />
                      <defs>
                        {pieChartData.map((entry, index) => (
                          <linearGradient key={index} id={`pieGradient2-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 w-full">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-[#4C51BF] mr-2"></span>
                        <span className="text-sm font-urbanist">Under Review</span>
                      </div>
                      <span className="text-sm font-bold font-urbanist">
                        {stats.pending + stats.contacted > 0
                          ? `${((stats.pending / (stats.pending + stats.contacted)) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-[#38B2AC] mr-2"></span>
                        <span className="text-sm font-urbanist">Contacted</span>
                      </div>
                      <span className="text-sm font-bold font-urbanist">
                        {stats.pending + stats.contacted > 0
                          ? `${((stats.contacted / (stats.pending + stats.contacted)) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie Chart (Working vs Completed vs Not Fit) */}
              <div className="bg-white shadow-xl rounded-xl p-6 transform transition-all hover:shadow-2xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-urbanist">Distribution Analysis</h3>
                <div className="flex flex-col">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                    <Pie
  data={pieChartData2}
  cx="50%"
  cy="50%"
  outerRadius={80}
  innerRadius={50}
  dataKey="value"
  startAngle={90}
  endAngle={450}
  paddingAngle={4}
  label={({ value }) => `${value}`}
  labelLine={{ stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "2 2" }}
>
  {pieChartData2.map((entry, index) => (
    <Cell
      key={`cell-${entry.name}`}
      fill={`url(#pieGradient-${index})`}
      stroke="#FFFFFF"
      strokeWidth={2}
    />
  ))}
</Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const total = pieChart2Total;
                          return [`${value}`, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: "rgb(178, 223, 219)",
                          borderRadius: "10px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid rgb(0, 137, 123)",
                          fontSize: "14px",
                          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                          minHeight: "10px"
                        }}
                        itemStyle={{
                          color: "#004D40",
                          fontWeight: 500,
                          marginBottom: "4px"
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#00695C",
                          marginBottom: "8px"
                        }}
                      />
                      <defs>
                        {pieChartData2.map((entry, index) => (
                          <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 w-full">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-[#ED8936] mr-2"></span>
                        <span className="text-sm font-urbanist">Total Jobs</span>
                      </div>
                      <span className="text-sm font-bold font-urbanist">
                        {pieChart2Total > 0
                          ? `${((stats.total / pieChart2Total) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-[#38B2AC] mr-2"></span>
                        <span className="text-sm font-urbanist">Under Review</span>
                      </div>
                      <span className="text-sm font-bold font-urbanist">
                        {pieChart2Total > 0
                          ? `${((stats.pending / pieChart2Total) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-[#E53E3E] mr-2"></span>
                        <span className="text-sm font-urbanist">Not Fit</span>
                      </div>
                      <span className="text-sm font-bold font-urbanist">
                        {pieChart2Total > 0
                          ? `${((stats.notFit / pieChart2Total) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...statsData2, ...statsData3].map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  bgColor="bg-[#E0FFF9]"
                  textColor="text-[#27CEA7]"
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>

            {/* Bottom row with Line Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6 transform transition-all hover:shadow-2xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 font-urbanist">Completion Progress Over Time</h3>
              <div className="flex flex-col lg:flex-row">
                {/* Metrics Section */}
                <div className="p-6 flex flex-col space-y-4 justify-center items-start lg:w-1/4 bg-gray-50 rounded-lg lg:rounded-l-xl mb-4 lg:mb-0">
  <p className="text-xl font-bold font-urbanist text-gray-800">Overall Jobs</p>
  <div className="space-y-3 w-full">
    {/* Calculate the total of only the four categories */}
    {(() => {
      const relevantTotal = stats.pending + stats.contacted + stats.working + stats.completed;
      const underReviewPercentage = relevantTotal > 0 ? ((stats.pending / relevantTotal) * 100).toFixed(1) : "0";
      const contactedPercentage = relevantTotal > 0 ? ((stats.contacted / relevantTotal) * 100).toFixed(1) : "0";
      const workingPercentage = relevantTotal > 0 ? ((stats.working / relevantTotal) * 100).toFixed(1) : "0";
      const completedPercentage = relevantTotal > 0 ? ((stats.completed / relevantTotal) * 100).toFixed(1) : "0";

      return (
        <>
          <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors">
            <span className="text-sm font-urbanist text-gray-600">Under Review</span>
            <span className="text-sm font-bold font-urbanist text-[#4C51BF]">
              {underReviewPercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors">
            <span className="text-sm font-urbanist text-gray-600">Contacted</span>
            <span className="text-sm font-bold font-urbanist text-[#38B2AC]">
              {contactedPercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors">
            <span className="text-sm font-urbanist text-gray-600">Working</span>
            <span className="text-sm font-bold font-urbanist text-[#3B82F6]">
              {workingPercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors">
            <span className="text-sm font-urbanist text-gray-600">Completed</span>
            <span className="text-sm font-bold font-urbanist text-[#10B981]">
              {completedPercentage}%
            </span>
          </div>
        </>
      );
    })()}
  </div>
</div>
                {/* Line Chart */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis
                        dataKey="name"
                        stroke="white"
                        tick={{ fontSize: 12, fontFamily: "Urbanist", fill: "#6b7280" }}
                        axisLine={{ stroke: "white" }}
                      />
                      <YAxis
                        stroke="white"
                        tick={{ fontSize: 12, fontFamily: "Urbanist", fill: "white" }}
                        axisLine={{ stroke: "white" }}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                
                        contentStyle={{ 
                          backgroundColor: "rgb(178, 223, 219)",
                          borderRadius: "10px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid rgb(0, 137, 123)",
                          fontSize: "14px",
                          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                          minHeight: "10px"
                        }}
                        itemStyle={{
                          color: "#004D40",
                          fontWeight: 500,
                          marginBottom: "4px"
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#00695C",
                          marginBottom: "8px"
                        }}
                        cursor={{ stroke: "#80CBC4", strokeWidth: 2 }}
                      />
                      
                  
                      <Legend 
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                          paddingBottom: "10px",
                          fontFamily: "Urbanist",
                          fontSize: 12,
                        }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Line
                        name="Progress"
                        type="monotone"
                        dataKey="value"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2, stroke: "#38B2AC", fill: "white", strokeDasharray: "" }}
                        activeDot={{ r: 8, stroke: "white", strokeWidth: 2, fill: "#38B2AC" }}
                      />
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#4C51BF" stopOpacity={1} />
                          <stop offset="50%" stopColor="#38B2AC" stopOpacity={1} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Base>
  );
};

export default ProjectStatsDashboard;