import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

const Navbar = () => {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50">
        \
        <Sidebar />
        <TopNavbar />
      </div>
    </div>
  );
};

export default Navbar;
