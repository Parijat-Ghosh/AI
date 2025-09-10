import React from "react";
import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Page from "./pages/Page";
import Pricing from "./pages/Pricing";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/Page" element={<Page />} />
          <Route path="/" element={<Page />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* optional: allow direct chat id route */}
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ChatProvider>
  );
}

export default App;
