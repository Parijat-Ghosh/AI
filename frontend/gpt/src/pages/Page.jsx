
import { useState, useEffect } from "react";
import HeroSection from "../components/hero-section";
import { ToastContainer } from "react-toastify";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to check login status
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") || localStorage.getItem("currentUser") || localStorage.getItem("loggedInUser");
    return !!(token || user);
  };

  // Initialize login status on component mount
  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
  }, []);

  // Handle logout callback
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      <HeroSection 
        showSignup={!isLoggedIn} 
        showLogout={isLoggedIn}
        onLogout={handleLogout}
      />
      <ToastContainer />
    </div>
  );
}