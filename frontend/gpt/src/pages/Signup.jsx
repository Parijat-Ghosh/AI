import React from "react";
import { useState} from "react";
import { Link , useNavigate} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copySignupInfo = { ...signupInfo };
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // So that page will not be refreshed while submitting the form
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("All fields are required");
    }

    try {
      const url = "http://localhost:5000/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupInfo),
      });
      const result = await response.json();
      const{ message, success, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
        },1000);
       
      }else if(error){
        const details = error?.details[0].message;
        handleError(details);
      }else if(!success){
        handleError(message);
      }
      console.log(result);
    } catch (err) {
      console.error("Error during signup:", err);
      handleError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-transparent shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-black text-center mb-2">
          Sign Up
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Enter your information to create an account
        </p>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Username
            </label>
            <input
              onChange={handleChange}
              name="name"
              value={signupInfo.name}
              type="text"
              placeholder="johndoe"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              value={signupInfo.email}
              placeholder="m@example.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password">
              Password
            </label>
            <input
              onChange={handleChange}
              name="password"
              type="password"
              value={signupInfo.password}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            onClick={handleSignup}
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-gray-700 transition">
            Create an account
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
