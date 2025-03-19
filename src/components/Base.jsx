import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { ToastContainer } from "react-toastify";

const Base = ({ children }) => {
    const [showSideBar, setShowSideBar] = useState(false)

    return (
        <div className="flex">
            <ToastContainer />
            <div className={`w-60 z-[9999] fixed lg:relative ${!showSideBar && "hidden"} lg:flex`}>
                <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
            </div>
            <div className="flex-1 flex flex-col min-h-screen">
                <div className="h-20 relative">
                    <TopNavbar setShowSideBar={setShowSideBar} />
                    {/* <div className="pointer-events-none absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/80 to-transparent"></div> */}
                </div>
                <div className="bg-[#f2fffb] flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Base;
