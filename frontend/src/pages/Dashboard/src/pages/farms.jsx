import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useForm }  from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Home,
  Save,
  XCircle,
  PlusCircle,
  Users2,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AreaChart,
  Droplet,
} from 'lucide-react';

const farmSchema = z.object({
  farmer_id: z.string().min(1, "Farmer ID is required"),
  name: z.string().min(3, "Farm name must be at least 3 characters long"),
  location: z.string().min(5, "Location must be at least 5 characters long"),
  size_acres: z.preprocess(
    (val) => parseFloat(val),
    z.number().min(0.01, "Size in acres must be greater than 0")
  ),
  irrigation: z.boolean(),
  gps_coordinates: z.string().optional().or(z.literal('')),
});

function Farms() {
  const [farms, setFarms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [farmers, setFarmers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalFarms, setTotalFarms] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFarms, setLoadingFarms] = useState(false);

  useEffect(() => {
    // Fetch farmers for the dropdown in the FarmForm
    axios.get("http://localhost:5000/farmers") // Ensure this endpoint is correct
      .then((res) => {
        setFarmers(res.data); // Assuming res.data is an array of farmer objects
      })
      .catch((err) => console.error("Error fetching farmers for dropdown:", err));
  }, []); // Empty dependency array means this runs once on mount

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(farmSchema) });

  const debouncedSetSearchTerm = useCallback((value) => {
    // Clear any previous timeout to ensure only the last call fires
    if (debouncedSetSearchTerm.timeoutId) {
      clearTimeout(debouncedSetSearchTerm.timeoutId);
    }
    const handler = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms debounce delay
    debouncedSetSearchTerm.timeoutId = handler; // Store timeout ID
  }, []);

  const fetchFarms = useCallback(async () => {
    setLoadingFarms(true);
    const loadingToastId = toast.loading("Fetching farms...");
    try {
      const res = await axios.get("http://localhost:5000/farms", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });
      setFarms(res.data.farms); // Assuming res.data has 'farms' array and 'totalCount'
      setTotalFarms(res.data.totalCount);
      // Removed: toast.success("Farms fetched successfully"); to avoid repetitive toasts on search
    } catch (error) {
      console.error("Failed to fetch farms:", error);
      toast.error("Failed to fetch farms.", { id: loadingToastId });
    } finally {
      toast.dismiss(loadingToastId);
      setLoadingFarms(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const totalPages = Math.ceil(totalFarms / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onSubmit = async (data) => {
    const loadingToastId = toast.loading("Adding farm...");
    try {
      // FIX: Convert farmer_id to String before sending, as BigInt cannot be serialized by JSON.stringify
      const dataToSend = { ...data, farmer_id: String(data.farmer_id) };
      await axios.post("http://localhost:5000/farms", dataToSend);
      reset();
      setShowAddModal(false);
      toast.success("✅ Farm added successfully!", { id: loadingToastId });
      fetchFarms();
    } catch (err) {
      console.error("Error adding farm:", err);
      toast.error(err.response?.data?.message || "❌ Failed to add farm!", { id: loadingToastId });
    }
  };

  const handleEditClick = (farm) => {
    setEditingFarm(farm);
    // Reset form with current farm data, ensuring farmer_id is string and irrigation is boolean
    reset({ ...farm, farmer_id: String(farm.farmer_id), irrigation: farm.irrigation || false });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loadingToastId = toast.loading("Updating farm...");
    try {
      if (editingFarm) {
        // FIX: Convert farmer_id to String before sending
        const dataToSend = { ...data, farmer_id: String(data.farmer_id) };
        await axios.put(`http://localhost:5000/farms/${editingFarm.id}`, dataToSend);
        setEditingFarm(null);
        setShowEditModal(false);
        toast.success("✅ Farm updated successfully!", { id: loadingToastId });
        fetchFarms();
      }
    } catch (err) {
      console.error("Error updating farm:", err);
      toast.error(err.response?.data?.message || "❌ Failed to update farm!", { id: loadingToastId });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loadingToastId = toast.loading("Deleting farm...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/farms/${deleteId}`);
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("🗑️ Farm deleted successfully!", { id: loadingToastId });
        fetchFarms();
      }
    } catch (err) {
      console.error("Error deleting farm:", err);
      toast.error(err.response?.data?.message || "❌ Failed to delete farm!", { id: loadingToastId });
    }
  };

  // Filtering on the client-side based on searchTerm
  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farm.gps_coordinates && farm.gps_coordinates.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (farm.farmer && farm.farmer.full_name && farm.farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
      {/* HEADER SECTION: Title, Search, and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Farm Lists</h1>
        <button
          onClick={() => {
            reset({
              farmer_id: "",
              name: "",
              location: "",
              size_acres: "",
              irrigation: false,
              gps_coordinates: "",
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Farm
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search farms by name, location..."
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
          onChange={(e) => debouncedSetSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {/* Farms Table Section */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Farmer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Acres
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Irrigation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                GPS Coords
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingFarms ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Loading farms...
                </td>
              </tr>
            ) : filteredFarms.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No farms found matching your search.
                </td>
              </tr>
            ) : (
              filteredFarms.map((farm) => (
                <tr key={String(farm.id)} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(farm.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {farm.farmer ? farm.farmer.full_name : String(farm.farmer_id)} {/* Display Farmer's full_name or ID */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farm.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farm.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farm.size_acres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farm.irrigation ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {farm.gps_coordinates || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(farm)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Farm"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(farm.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Farm"
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loadingFarms}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1 || loadingFarms}
              className={`px-4 py-2 rounded-lg shadow-md transition duration-150 ease-in-out ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              } disabled:opacity-50`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loadingFarms}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {showAddModal && (
        <FarmForm
          title="Add New Farm"
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowAddModal(false);
            reset();
          }}
          farmers={farmers}
        />
      )}

      {showEditModal && (
        <FarmForm
          title="Edit Farm"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingFarm(null);
            reset();
          }}
          farmers={farmers}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this farm? This action cannot be undone.</p>
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

function FarmForm({ title, handleSubmit, onSubmit, register, errors, onCancel, farmers }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">{title}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Farmer ID Select */}
            <div className="relative flex-1 w-full">
              <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("farmer_id")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="farmer_id"
              >
                <option value="">-- Select Farmer --</option>
                {farmers.map(farmer => (
                  <option key={String(farmer.id)} value={String(farmer.id)}>
                    {farmer.full_name} ({String(farmer.id)})
                  </option>
                ))}
              </select>
              {errors.farmer_id && <p className="text-red-600 text-sm mt-1">{errors.farmer_id.message}</p>}
            </div>

            {/* Farm Name Field */}
            <div className="relative flex-1 w-full">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Farm Name"
                {...register("name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Location Field */}
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                {...register("location")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
            </div>

            {/* Size Acres Field */}
            <div className="relative flex-1 w-full">
              <AreaChart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="Size (Acres)"
                {...register("size_acres")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.size_acres && <p className="text-red-600 text-sm mt-1">{errors.size_acres.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Irrigation Checkbox */}
            <div className="relative flex-1 w-full flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
              <Droplet className="text-gray-400 mr-3" size={20} />
              <label htmlFor="irrigation" className="flex items-center cursor-pointer text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  id="irrigation"
                  {...register("irrigation")}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-2"
                />
                Irrigation Available
              </label>
              {errors.irrigation && <p className="text-red-600 text-sm mt-1">{errors.irrigation.message}</p>}
            </div>

            {/* GPS Coordinates Field */}
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="GPS Coordinates (Optional)"
                {...register("gps_coordinates")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.gps_coordinates && <p className="text-red-600 text-sm mt-1">{errors.gps_coordinates.message}</p>}
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

export default Farms;
