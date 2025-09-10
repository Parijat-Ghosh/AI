import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // So that page will not be refreshed while submitting the form
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("All fields are required");
    }

    try {
      const url = "http://localhost:5000/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { message, success, token, user, error } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', user.name);
        setTimeout(() => {
          navigate("/");
        }, 1000);
        
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (err) {
      console.error("Error during login:", err);
      handleError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-black text-center mb-2">
          Login
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Enter your email below to login to your account
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              placeholder="m@example.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-gray-700 transition"
            onSubmit={handleLogin}>
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-black font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}