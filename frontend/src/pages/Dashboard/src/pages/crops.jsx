import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Sprout, // Changed from Home for crop name
  Save,
  XCircle,
  PlusCircle,
  Home, 
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar, // For dates
  BarChart2, // For status, changed from AreaChart
  Tag, // For variety, changed from Droplet
} from 'lucide-react';

// Zod schema for crop data
const cropSchema = z.object({
  farm_id: z.string().min(1, "Farm ID is required"),
  name: z.string().min(3, "Crop name must be at least 3 characters long"),
  variety: z.string().optional().or(z.literal('')),
  planting_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid planting date").optional().or(z.literal('')),
  expected_harvest_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid harvest date").optional().or(z.literal('')),
  status: z.enum(["planted", "growing", "harvested"], {
    errorMap: () => ({ message: "Status must be one of: planted, growing, harvested" })
  }).default("planted"),
});

function Crops() {
  const [crops, setCrops] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [farms, setFarms] = useState([]); // To populate the farm_id dropdown
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCrops, setTotalCrops] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCrops, setLoadingCrops] = useState(false);

  // Fetch farms for the dropdown
  useEffect(() => {
    axios.get("http://localhost:5000/farms") // Assuming you have a /farms endpoint
      .then((res) => {
        setFarms(res.data.farms); // Adjust based on your /farms response structure
      })
      .catch((err) => console.error("Error fetching farms for dropdown:", err));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(cropSchema) });

  const debouncedSetSearchTerm = useCallback((value) => {
    const handler = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, []);

  const fetchCrops = useCallback(async () => {
    setLoadingCrops(true);
    const loadingToastId = toast.loading("Fetching crops...");
    try {
      const res = await axios.get("http://localhost:5000/crops", { // Changed endpoint to /crops
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });
      setCrops(res.data.crops); // Adjust based on your /crops response structure
      setTotalCrops(res.data.totalCount);
      toast.success("Crops fetched successfully");
    } catch (error) {
      console.error("Failed to fetch crops:", error);
      toast.error("Failed to fetch crops");
    } finally {
      toast.dismiss(loadingToastId);
      setLoadingCrops(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const totalPages = Math.ceil(totalCrops / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onSubmit = async (data) => {
    const loading = toast.loading("Adding crop...");
    try {
      await axios.post("http://localhost:5000/crops", data); // Changed endpoint to /crops
      reset();
      setShowAddModal(false);
      toast.success(" Crop added successfully!");
      fetchCrops();
    } catch (err) {
      console.error("Error adding crop:", err);
      toast.error("❌ Failed to add crop!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const handleEditClick = (crop) => {
    setEditingCrop(crop);
    // Ensure date fields are formatted for input type="date"
    const plantingDate = crop.planting_date ? new Date(crop.planting_date).toISOString().split('T')[0] : '';
    const expectedHarvestDate = crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toISOString().split('T')[0] : '';

    reset({
      ...crop,
      farm_id: String(crop.farm_id), // Ensure it's a string for the select input
      planting_date: plantingDate,
      expected_harvest_date: expectedHarvestDate,
    });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loading = toast.loading("Updating crop...");
    try {
      if (editingCrop) {
        await axios.put(`http://localhost:5000/crops/${editingCrop.id}`, data); // Changed endpoint to /crops
        setEditingCrop(null);
        setShowEditModal(false);
        toast.success("✅ Crop updated successfully!");
        fetchCrops();
      }
    } catch (err) {
      console.error("Error updating crop:", err);
      toast.error("❌ Failed to update crop!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loading = toast.loading("Deleting crop...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/crops/${deleteId}`); // Changed endpoint to /crops
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("🗑️ Crop deleted successfully!");
        fetchCrops();
      }
    } catch (err) {
      console.error("Error deleting crop:", err);
      toast.error("❌ Failed to delete crop!");
    } finally {
      toast.dismiss(loading);
    }
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Crop Lists</h1>
        <button
          onClick={() => {
            reset({
              farm_id: "",
              name: "",
              variety: "",
              planting_date: "",
              expected_harvest_date: "",
              status: "planted", // Default status
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Crop
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search crops by name, variety..."
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
          onChange={(e) => debouncedSetSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Farm ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Variety
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Planting Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Harvest Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingCrops ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Loading crops...
                </td>
              </tr>
            ) : crops.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No crops found.
                </td>
              </tr>
            ) : (
              crops.map((crop) => (
                <tr key={crop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(crop.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(crop.farm_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {crop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {crop.variety || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {crop.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(crop)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Crop"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(crop.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Crop"
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
            disabled={currentPage === 1 || loadingCrops}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1 || loadingCrops}
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
            disabled={currentPage === totalPages || loadingCrops}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {showAddModal && (
        <CropForm
          title="Add New Crop"
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowAddModal(false);
            reset();
          }}
          farms={farms}
        />
      )}

      {showEditModal && (
        <CropForm
          title="Edit Crop"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingCrop(null);
            reset();
          }}
          farms={farms}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this crop? This action cannot be undone.</p>
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

function CropForm({ title, handleSubmit, onSubmit, register, errors, onCancel, farms }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">{title}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Farm ID Select */}
            <div className="relative flex-1 w-full">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("farm_id")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="farm_id"
              >
                <option value="">-- Select Farm --</option>
                {farms.map(farm => (
                  <option key={String(farm.id)} value={String(farm.id)}>
                    {farm.name} (ID: {String(farm.id)})
                  </option>
                ))}
              </select>
              {errors.farm_id && <p className="text-red-600 text-sm mt-1">{errors.farm_id.message}</p>}
            </div>

            {/* Crop Name Field */}
            <div className="relative flex-1 w-full">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Crop Name"
                {...register("name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Variety Field */}
            <div className="relative flex-1 w-full">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Variety (Optional)"
                {...register("variety")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.variety && <p className="text-red-600 text-sm mt-1">{errors.variety.message}</p>}
            </div>

            {/* Status Select */}
            <div className="relative flex-1 w-full">
              <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("status")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="status"
              >
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="harvested">Harvested</option>
              </select>
              {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Planting Date Field */}
            <div className="relative flex-1 w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                placeholder="Planting Date"
                {...register("planting_date")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.planting_date && <p className="text-red-600 text-sm mt-1">{errors.planting_date.message}</p>}
            </div>

            {/* Expected Harvest Date Field */}
            <div className="relative flex-1 w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                placeholder="Expected Harvest Date"
                {...register("expected_harvest_date")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.expected_harvest_date && <p className="text-red-600 text-sm mt-1">{errors.expected_harvest_date.message}</p>}
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

export default Crops;