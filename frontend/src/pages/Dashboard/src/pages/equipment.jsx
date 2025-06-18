// frontend/src/components/Equipment.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Wrench, // Icon for equipment
  Save,
  XCircle,
  PlusCircle,
  Home, // For farm ID
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar, // For purchase date
  CheckCircle, // For operational status
  CircleDot, // For condition
} from 'lucide-react';

// Zod schema for equipment data
const equipmentSchema = z.object({
  farm_id: z.string().min(1, "Farm ID is required"),
  name: z.string().min(3, "Equipment name must be at least 3 characters long"),
  purchase_date: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), "Invalid purchase date").optional().or(z.literal('')),
  condition: z.enum(["new", "good", "fair", "poor"], {
    errorMap: () => ({ message: "Condition must be one of: new, good, fair, poor" })
  }).optional().or(z.literal('')),
  is_operational: z.boolean().default(true),
});

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [farms, setFarms] = useState([]); // To populate the farm_id dropdown
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  // Fetch farms for the dropdown
  useEffect(() => {
    axios.get("http://localhost:5000/farms") // Ensure your farms endpoint is correct
      .then((res) => {
        setFarms(res.data.farms); // Adjust based on your /api/farms response structure
      })
      .catch((err) => console.error("Error fetching farms for dropdown:", err));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Added setValue for boolean checkbox
    formState: { errors },
  } = useForm({ resolver: zodResolver(equipmentSchema) });

  const debouncedSetSearchTerm = useCallback((value) => {
    const handler = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, []);

  const fetchEquipment = useCallback(async () => {
    setLoadingEquipment(true);
    const loadingToastId = toast.loading("Fetching equipment...");
    try {
      const res = await axios.get("http://localhost:5000/equipment", { // Updated endpoint
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });
      setEquipment(res.data.equipment); // Adjust based on your /api/equipment response structure
      setTotalEquipment(res.data.totalCount);
      toast.success("Equipment fetched successfully");
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
      toast.error("Failed to fetch equipment");
    } finally {
      toast.dismiss(loadingToastId);
      setLoadingEquipment(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const totalPages = Math.ceil(totalEquipment / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onSubmit = async (data) => {
    const loading = toast.loading("Adding equipment...");
    try {
      await axios.post("http://localhost:5000/equipment", data); // Updated endpoint
      reset();
      setShowAddModal(false);
      toast.success("✅ Equipment added successfully!");
      fetchEquipment();
    } catch (err) {
      console.error("Error adding equipment:", err);
      toast.error("❌ Failed to add equipment!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const handleEditClick = (item) => {
    setEditingEquipment(item);
    // Ensure date fields are formatted for input type="date"
    const purchaseDate = item.purchase_date ? new Date(item.purchase_date).toISOString().split('T')[0] : '';

    reset({
      ...item,
      farm_id: String(item.farm_id), // Ensure it's a string for the select input
      purchase_date: purchaseDate,
      // For boolean checkbox, setValue is better as register might not always reflect checked state directly
      is_operational: item.is_operational,
    });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loading = toast.loading("Updating equipment...");
    try {
      if (editingEquipment) {
        await axios.put(`http://localhost:5000/equipment/${editingEquipment.id}`, data); // Updated endpoint
        setEditingEquipment(null);
        setShowEditModal(false);
        toast.success("✅ Equipment updated successfully!");
        fetchEquipment();
      }
    } catch (err) {
      console.error("Error updating equipment:", err);
      toast.error("❌ Failed to update equipment!");
    } finally {
      toast.dismiss(loading);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loading = toast.loading("Deleting equipment...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/equipment/${deleteId}`); // Updated endpoint
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("🗑️ Equipment deleted successfully!");
        fetchEquipment();
      }
    } catch (err) {
      console.error("Error deleting equipment:", err);
      toast.error("❌ Failed to delete equipment!");
    } finally {
      toast.dismiss(loading);
    }
  };

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Equipment List</h1>
        <button
          onClick={() => {
            reset({
              farm_id: "",
              name: "",
              purchase_date: "",
              condition: "",
              is_operational: true, // Default status
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Equipment
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search equipment by name, condition..."
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
                Purchase Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Condition
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Operational
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingEquipment ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Loading equipment...
                </td>
              </tr>
            ) : equipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No equipment found.
                </td>
              </tr>
            ) : (
              equipment.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.farm_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.condition || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.is_operational ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Equipment"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Equipment"
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
            disabled={currentPage === 1 || loadingEquipment}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1 || loadingEquipment}
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
            disabled={currentPage === totalPages || loadingEquipment}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {showAddModal && (
        <EquipmentForm
          title="Add New Equipment"
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
        <EquipmentForm
          title="Edit Equipment"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingEquipment(null);
            reset();
          }}
          farms={farms}
          setValue={setValue} // Pass setValue for checkboxes
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this equipment? This action cannot be undone.</p>
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

function EquipmentForm({ title, handleSubmit, onSubmit, register, errors, onCancel, farms }) {
  // setValue is used here to properly set the checkbox state when editing
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

            {/* Equipment Name Field */}
            <div className="relative flex-1 w-full">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Equipment Name"
                {...register("name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Purchase Date Field */}
            <div className="relative flex-1 w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                placeholder="Purchase Date"
                {...register("purchase_date")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.purchase_date && <p className="text-red-600 text-sm mt-1">{errors.purchase_date.message}</p>}
            </div>

            {/* Condition Select */}
            <div className="relative flex-1 w-full">
              <CircleDot className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                {...register("condition")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                id="condition"
              >
                <option value="">-- Select Condition --</option>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
              {errors.condition && <p className="text-red-600 text-sm mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          {/* Is Operational Checkbox */}
          <div className="relative flex items-center gap-2">
            <input
              type="checkbox"
              id="is_operational"
              {...register("is_operational")}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_operational" className="text-gray-800 dark:text-gray-200 flex items-center">
              <CheckCircle size={18} className="mr-1 text-gray-400" /> Is Operational
            </label>
            {errors.is_operational && <p className="text-red-600 text-sm mt-1">{errors.is_operational.message}</p>}
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

export default Equipment;