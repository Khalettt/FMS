import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Home,
  Save,
  XCircle,
  PlusCircle,
  Users2, // Icon for Farmers list title
  Pencil,
  Trash2,
  Search, // Imported Search icon
} from 'lucide-react';

// Zod Schema for Farmer Validation (WAXAA LA SAXAY EMAIL IYO PHONE)
const farmerSchema = z.object({
  full_name: z.string().min(3, "Full name must be at least 3 characters long"),
  // user_id is received as a string from the select dropdown
  user_id: z.string().min(1, "User ID is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  // Phone hadda wuu noqon karaa faaruq ama null
  phone: z.string().optional().or(z.literal('')).refine(val => {
    if (val === '') return true; // Allow empty string
    return val.length >= 5 && val.length <= 15; // Validate length if not empty
  }, "Phone number must be between 5 and 15 characters long."),
  // Email hadda wuu noqon karaa faaruq ama null, waxaana la validate-garayn doonaa kaliya haddii uu jiro.
  email: z.string().optional().or(z.literal('')).refine(val => {
    if (val === '') return true; // Allow empty string
    return z.string().email("Invalid email address").safeParse(val).success;
  }, "Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
});

// Farmers Component
function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Fetch users for dropdown (Remains unchanged)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users for dropdown.");
      }
    };
    fetchUsers();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(farmerSchema) });

  const fetchFarmers = async () => {
    const loadingToastId = toast.loading("Fetching farmers...");
    try {
      const res = await axios.get("http://localhost:5000/farmers");
      setFarmers(res.data);
      toast.success("Farmers fetched successfully!", { id: loadingToastId });
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
      toast.error("Failed to fetch farmers.", { id: loadingToastId });
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const onSubmit = async (data) => {
    const loadingToastId = toast.loading("Adding farmer...");
    try {
      // FIX HERE: Convert user_id to String before sending
      const dataToSend = {
        ...data,
        user_id: String(data.user_id), // Convert BigInt to String for JSON serialization
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
      };
      await axios.post("http://localhost:5000/farmers", dataToSend);
      reset();
      setShowAddModal(false);
      toast.success("Farmer added successfully!", { id: loadingToastId });
      fetchFarmers();
    } catch (err) {
      console.error("Error adding farmer:", err);
      toast.error(err.response?.data?.message || "Failed to add farmer!", { id: loadingToastId });
    }
  };

  const handleEditClick = (farmer) => {
    setEditingFarmer(farmer);
    // Hubi in email-ka iyo phone-ka la buuxiyo si sax ah modal-ka, ama faaruq ah haddii ay null yihiin.
    reset({
      ...farmer,
      user_id: String(farmer.user_id),
      email: farmer.email || '', // U beddel string faaruq ah haddii ay null tahay
      phone: farmer.phone || '', // U beddel string faaruq ah haddii ay null tahay
    });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loadingToastId = toast.loading("Updating farmer...");
    try {
      if (editingFarmer) {
        // FIX HERE: Convert user_id to String before sending
        const dataToSend = {
          ...data,
          user_id: String(data.user_id), // Convert BigInt to String for JSON serialization
          email: data.email === '' ? null : data.email,
          phone: data.phone === '' ? null : data.phone,
        };
        await axios.put(`http://localhost:5000/farmers/${editingFarmer.id}`, dataToSend);
        setEditingFarmer(null);
        setShowEditModal(false);
        toast.success("Farmer updated successfully!", { id: loadingToastId });
        fetchFarmers();
      }
    } catch (err) {
      console.error("Error updating farmer:", err);
      toast.error(err.response?.data?.message || "Failed to update farmer!", { id: loadingToastId });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loadingToastId = toast.loading("Deleting farmer...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/farmers/${deleteId}`);
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("Farmer deleted successfully!", { id: loadingToastId });
        fetchFarmers();
      }
    } catch (err) {
      console.error("Error deleting farmer:", err);
      toast.error(err.response?.data?.message || "Failed to delete farmer!", { id: loadingToastId });
    }
  };

  // Filtered farmers based on search query
  const filteredFarmers = farmers.filter(farmer =>
    farmer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (farmer.email && farmer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (farmer.phone && farmer.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (farmer.address && farmer.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    farmer.user?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen font-inter sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* HEADER SECTION: Title, Search, and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center ">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          Farmers List
        </h1>

        {/* Search Input and Add Farmer Button Container */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Add Farmer Button */}
          <button
            onClick={() => {
              reset({ // Hubi in fields-ka ay faaruq yihiin
                full_name: "",
                user_id: "",
                gender: "",
                phone: "",
                email: "",
                address: "",
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-5 mb-2 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out w-full sm:w-auto"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Farmer
          </button>
        </div>

      </div>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search farmers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm mb-2"
        />
      </div>
      {/* FARMERS TABLE SECTION */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                User ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Gender
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFarmers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No farmers found matching your search.
                </td>
              </tr>
            ) : (
              filteredFarmers.map((farmer) => (
                <tr key={String(farmer.id)} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(farmer.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(farmer.user_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farmer.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 capitalize">
                    {farmer.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farmer.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farmer.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farmer.address || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(farmer)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Farmer"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(farmer.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Farmer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Farmer Modal */}
      {showAddModal && (
        <FarmerForm
          title="Add New Farmer"
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowAddModal(false);
            reset();
          }}
          users={users}
        />
      )}

      {/* Edit Farmer Modal */}
      {showEditModal && (
        <FarmerForm
          title="Edit Farmer"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingFarmer(null);
            reset();
          }}
          users={users}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this farmer? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex items-center px-5 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                <XCircle className="mr-2" size={18} />
                Cancel
              </button>
              <button
                onClick={proceedDelete}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
              >
                <Trash2 className="mr-2" size={18} />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// FarmerForm Component
function FarmerForm({ title, handleSubmit, onSubmit, register, errors, onCancel, users }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">{title}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Full Name Field */}
            <div className="relative flex-1 w-full">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                {...register("full_name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Select User ID */}
            <div className="relative flex-1 w-full">
              <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("user_id")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="user_id"
              >
                <option value="">-- Select User --</option>
                {users.map(user => (
                  <option key={String(user.id)} value={String(user.id)}>
                    {user.fullname}
                  </option>
                ))}
              </select>
              {errors.user_id && <p className="text-red-600 text-sm mt-1">{errors.user_id.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Gender Field */}
            <div className="relative flex-1 w-full">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("gender")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>}
            </div>
            {/* Email Field */}
            <div className="relative flex-1 w-full">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Phone Field */}
            <div className="relative flex-1 w-full">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Phone"
                {...register("phone")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            {/* Address Field */}
            <div className="relative flex-1 w-full">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Address"
                {...register("address")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-5 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <XCircle className="mr-2" size={18} />
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              <Save className="mr-2" size={18} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Farmers;
