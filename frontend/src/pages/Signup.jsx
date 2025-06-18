import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { User, Mail, Lock, Image, Phone, Home } from 'lucide-react'; // Added Phone and Home icons
import { Toaster, toast } from 'react-hot-toast';

// --- Signup Schema with Phone and Address ---
const signupSchema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
  phone: z.string().optional().nullable(), // Phone is optional
  address: z.string().optional().nullable(), // Address is optional
  imagePhoto: z.any().refine(file => file instanceof File && file.size > 0, {
    message: 'Profile image is required',
  }),
});

function Signup() {
  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    phone: '',    // Added phone to state
    address: '',  // Added address to state
    imagePhoto: null,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, imagePhoto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data using Zod schema
      const parsedData = signupSchema.parse(form);

      const formData = new FormData();
      formData.append('fullname', parsedData.fullname);
      formData.append('username', parsedData.username);
      formData.append('email', parsedData.email);
      formData.append('password', parsedData.password);
      // Append phone and address only if they have values
      if (parsedData.phone) {
        formData.append('phone', parsedData.phone);
      }
      if (parsedData.address) {
        formData.append('address', parsedData.address);
      }
      formData.append('imagePhoto', parsedData.imagePhoto);

      await axios.post('http://localhost:5000/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err instanceof z.ZodError) {
        // Zod validation errors
        toast.error(err.errors[0]?.message);
      } else if (err.response) {
        // Backend errors (e.g., username/email already exists)
        toast.error(err.response.data?.error || 'Registration failed. Please try again.');
      } else {
        // Network or unexpected errors
        toast.error('An unexpected error occurred. Please check your network connection.');
        console.error('Signup Error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="fullname"
                name="fullname"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.fullname}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Phone (New Field) */}
          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="phone"
                name="phone"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number (Optional)"
              />
            </div>
          </div>

          {/* Address (New Field) */}
          <div>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="address"
                name="address"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address (Optional)"
              />
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="file"
                id="imagePhoto"
                name="imagePhoto"
                accept="image/*"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150 ease-in-out"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-800">
              Login
            </Link>
          </p>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

export default Signup;