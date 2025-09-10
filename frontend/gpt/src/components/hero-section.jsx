import { Button } from "../ui/Button";
import PulsingBorderShader from "./pulsing-border-shader";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import { useContext } from "react";
import { Heart } from "lucide-react";
import { handleSuccess } from "../lib/utils"
export default function Component({
  showSignup = true,
  showLogout = false,
  onLogout,
}) {
  const { createNewChat } = useContext(ChatContext);

  const navigate = useNavigate();

  const handleGetStarted = async () => {
    const chatId = await createNewChat();
    if (chatId) {
      localStorage.setItem("currentChatId", chatId);
      navigate(`/chat/${chatId}`);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentChatId");

    handleSuccess("Logged out successfully");

    // Call the onLogout callback to update parent state
    if (onLogout) {
      onLogout();
    }

    // Small delay to show the success message before refresh
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="space-y-8 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Personal Assistant
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Your personal{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  assistant
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Experience the future of productivity with an AI assistant that
                understands you, learns from you, and works tirelessly to make
                your life easier.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full group"
                onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {showSignup && (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-indigo-900/20 hover:border-indigo-400 px-8 py-6 text-lg rounded-full bg-transparent"
                  onClick={handleSignup}>
                  Sign up
                </Button>
              )}

              {/* <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-full bg-transparent"
                onClick={handleSignup}>
                Sign up
              </Button> */}

              {showLogout && (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-indigo-900/20 hover:border-indigo-400 px-8 py-6 text-lg rounded-full bg-transparent transition-colors"
                  onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>

            <div className="flex items-center gap-8 pt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Available 24/7
              </div>
              <div>No setup required</div>
              <div>Enterprise ready</div>
            </div>
          </div>

          {/* Right side - Animation */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect behind the shader */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl scale-110" />

              {/* Main shader component */}
              <div className="relative">
                <PulsingBorderShader />
              </div>

              {/* Floating elements */}
              <div
                className="absolute -top-4 -right-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute top-1/3 -left-6 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "1s" }}
              />
              <div
                className="absolute bottom-1/4 -right-8 w-4 h-4 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: "2s" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="fixed bottom-4 right-4 z-20">
        <p className="text-xl text-white hover:text-gray-700 transition-colors duration-200">
          -- made by <span className="font-serif italic">Parijat Ghosh <Heart className="inline w-6 h-8 text-red-500 animate-pulse" fill="currentColor" stroke="none" /></span>
        </p>
      </div> */}

      <div className="fixed bottom-4 right-4 z-20">
        <p className="text-xl text-white hover:text-gray-700 transition-colors duration-200 flex items-center gap-2">
          -- made by <span className="font-serif italic">Parijat Ghosh</span>
          <Heart
            className="w-6 h-6 text-red-500 animate-pulse"
            fill="currentColor"
            stroke="none"
          />
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
