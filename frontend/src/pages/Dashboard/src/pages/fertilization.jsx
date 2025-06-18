// frontend/src/components/Fertilization.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Leaf,
  Calendar,
  Package,
  Droplet,
  Home,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  XCircle,
  Save,
} from 'lucide-react';

// Zod schema for fertilization data
const fertilizationSchema = z.object({
  // crop_id should be a string from the frontend, then converted to BigInt on the backend
  crop_id: z.string().min(1, "Crop ID is required"), // Keep as string for select input
  date: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), "Invalid date").optional().or(z.literal('')),
  quantity_kg: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), // Convert empty string to undefined, then Number
    z.number().min(0, "Quantity must be a non-negative number").optional().nullable() // Allow null from backend
  ),
  type: z.string().optional().or(z.literal('')),
});

function Fertilization() {
  const [fertilizations, setFertilizations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingFertilization, setEditingFertilization] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [crops, setCrops] = useState([]); // To populate the crop_id dropdown
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalFertilizations, setTotalFertilizations] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFertilizations, setLoadingFertilizations] = useState(false);

  // Fetch crops for the dropdown
  useEffect(() => {
    axios.get("http://localhost:5000/crops")
      .then((res) => {
        // Ensure res.data.crops is an array and each crop has 'id' and 'name'
        setCrops(res.data.crops || []);
      })
      .catch((err) => console.error("Error fetching crops for dropdown:", err));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fertilizationSchema),
    defaultValues: { // Set default values to avoid undefined issues
      crop_id: "",
      date: "",
      type: "",
      quantity_kg: "",
    }
  });

  const debouncedSetSearchTerm = useCallback((value) => {
    const handler = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, []);

  const fetchFertilizations = useCallback(async () => {
    setLoadingFertilizations(true);
    const loadingToastId = toast.loading("Fetching fertilization data...");
    try {
      const res = await axios.get("http://localhost:5000/fertilization", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });
      // Backend returns 'fertilizations' and 'totalCount'
      setFertilizations(res.data.fertilizations);
      setTotalFertilizations(res.data.totalCount);
      toast.success("Fertilization data fetched successfully");
    } catch (error) {
      console.error("Failed to fetch fertilization data:", error);
      toast.error("Failed to fetch fertilization data");
    } finally {
      toast.dismiss(loadingToastId);
      setLoadingFertilizations(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchFertilizations();
  }, [fetchFertilizations]);

  const totalPages = Math.ceil(totalFertilizations / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onSubmit = async (data) => {
    const loading = toast.loading("Adding fertilization record...");
    try {
      // Send data as is, backend will handle BigInt conversion
      await axios.post("http://localhost:5000/fertilization", data);
      reset();
      setShowAddModal(false);
      toast.success("✅ Fertilization record added successfully!");
      fetchFertilizations();
    } catch (err) {
      console.error("Error adding fertilization record:", err);
      toast.error("❌ Failed to add fertilization record!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const handleEditClick = (item) => {
    setEditingFertilization(item);
    const fertilizationDate = item.date ? new Date(item.date).toISOString().split('T')[0] : '';

    // Reset form with current item's data for editing
    reset({
      // Prisma backend will return 'cropId' and 'quantityKg' (camelCase)
      crop_id: String(item.cropId), // Ensure it's a string for the select input
      date: fertilizationDate,
      type: item.type || "", // Ensure type is an empty string if null
      quantity_kg: item.quantityKg !== null ? parseFloat(item.quantityKg) : '', // Set to empty string if null for number input
    });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loading = toast.loading("Updating fertilization record...");
    try {
      if (editingFertilization) {
        await axios.put(`http://localhost:5000/fertilization/${editingFertilization.id}`, data);
        setEditingFertilization(null);
        setShowEditModal(false);
        toast.success("✅ Fertilization record updated successfully!");
        fetchFertilizations();
      }
    } catch (err) {
      console.error("Error updating fertilization record:", err);
      toast.error("❌ Failed to update fertilization record!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loading = toast.loading("Deleting fertilization record...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/fertilization/${deleteId}`);
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("🗑️ Fertilization record deleted successfully!");
        fetchFertilizations();
      }
    } catch (err) {
      console.error("Error deleting fertilization record:", err);
      toast.error("❌ Failed to delete fertilization record!");
    } finally {
      toast.dismiss(loading);
    }
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fertilization Records</h1>
        <button
          onClick={() => {
            reset({ // Reset to default empty values when opening add modal
              crop_id: "",
              date: "",
              type: "",
              quantity_kg: "",
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Fertilization
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search fertilizations by type, crop ID, etc."
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
                Crop ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Quantity (kg)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingFertilizations ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Loading fertilization data...
                </td>
              </tr>
            ) : fertilizations.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No fertilization records found.
                </td>
              </tr>
            ) : (
              fertilizations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.cropId)} {/* Access item.cropId from backend Prisma response */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.type || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.quantityKg !== null ? parseFloat(item.quantityKg).toFixed(2) : "N/A"} {/* Access item.quantityKg from backend Prisma response */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Fertilization"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Fertilization"
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
            disabled={currentPage === 1 || loadingFertilizations}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1 || loadingFertilizations}
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
            disabled={currentPage === totalPages || loadingFertilizations}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {showAddModal && (
        <FertilizationForm
          title="Add New Fertilization Record"
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowAddModal(false);
            reset(); // Reset form when closing add modal
          }}
          crops={crops}
        />
      )}

      {showEditModal && (
        <FertilizationForm
          title="Edit Fertilization Record"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingFertilization(null);
            reset(); // Reset form when closing edit modal
          }}
          crops={crops}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this fertilization record? This action cannot be undone.</p>
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

function FertilizationForm({ title, handleSubmit, onSubmit, register, errors, onCancel, crops }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">{title}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Crop ID Select */}
            <div className="relative flex-1 w-full">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("crop_id")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="crop_id"
              >
                <option value="">-- Select Crop --</option>
                {crops.map(crop => (
                  <option key={String(crop.id)} value={String(crop.id)}>
                    {crop.name} (ID: {String(crop.id)})
                  </option>
                ))}
              </select>
              {errors.crop_id && <p className="text-red-600 text-sm mt-1">{errors.crop_id.message}</p>}
            </div>

            {/* Date Field */}
            <div className="relative flex-1 w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                placeholder="Fertilization Date"
                {...register("date")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Type Field */}
            <div className="relative flex-1 w-full">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Fertilizer Type (e.g., 'Urea', 'Compost')"
                {...register("type")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>}
            </div>

            {/* Quantity (kg) Field */}
            <div className="relative flex-1 w-full">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="Quantity (kg)"
                {...register("quantity_kg")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.quantity_kg && <p className="text-red-600 text-sm mt-1">{errors.quantity_kg.message}</p>}
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

export default Fertilization;