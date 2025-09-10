// import React from "react";
// import Sidebar from "../components/Sidebar";

// function ChatLayout({ children }) {
//   return (
//     <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col relative z-10">
//         {children}
//       </div>
//     </div>
//   );
// }

// export default ChatLayout;

// src/layouts/ChatLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

function ChatLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-black text-white"> {/* Full viewport height, no overflow, base styles */}
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full w-16 bg-black/50 backdrop-blur-md flex flex-col items-center py-4 space-y-6 overflow-hidden z-20"> {/* Fixed, full height, narrow width, vertical stack with fixed spacing */}
        <Sidebar /> {/* Sidebar icons/content */}
      </div>
      
      {/* Main Content Area (scrollable) */}
      <div className="flex-1 ml-16 flex flex-col"> {/* Offset for sidebar width, full height flex column */}
        {children} {/* Children will include scrollable content and sticky input */}
      </div>
    </div>
  );
}

export default ChatLayout;
