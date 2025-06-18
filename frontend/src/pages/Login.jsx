import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { FcGoogle } from 'react-icons/fc';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const parsedData = loginSchema.parse(form);

      const response = await axios.post(
        "http://localhost:5000/login",
        parsedData
      );

      localStorage.setItem("token", response.data.token);
      toast.success("Successfully logged in!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message);
      } else if (err.response) {
        toast.error(
          err.response.data?.error ||
            "Login failed. Please check your credentials."
        );
      } else {
        toast.error(
          "An unexpected error occurred. Please check your network connection."
        );
        console.error("Login Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          Welcome Back!
        </h2>
          <p className="text-center text-sl text-gray-600 italic">SOMFAMERS! Your journey to greatness starts here.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                id="email"
                name="email"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                id="password"
                name="password"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              Remember me
            </label>
            <Link
              to="#"
              className="text-green-600 hover:text-green-800"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="h-px bg-gray-300 w-full" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px bg-gray-300 w-full" />
          </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Login
            </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => toast("Google Login not implemented yet")}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition"
          >
             <FcGoogle className="text-2xl" />
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          {/* Signup Link */}
          <p className="text-center text-sl text-gray-600 mt-4">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              className="font-semibold text-green-600 hover:text-green-800"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

export default Login;
