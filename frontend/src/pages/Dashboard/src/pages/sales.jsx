// frontend/src/components/Sales.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Tag, // Icon for product type
  Package, // Icon for quantity
  DollarSign, // Icon for price
  User, // Icon for buyer name
  Save,
  XCircle,
  PlusCircle,
  Home, // For farm ID
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar, // For sale date
} from 'lucide-react';

// Zod schema for sales data
const salesSchema = z.object({
  farm_id: z.string().min(1, "Farm ID is required"),
  product_type: z.string().min(1, "Product type is required"),
  product_name: z.string().optional().or(z.literal('')),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Quantity must be a non-negative number").optional()
  ),
  unit: z.string().optional().or(z.literal('')),
  price_per_unit: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Price per unit must be a non-negative number").optional()
  ),
  sale_date: z.string().refine((date) => date === "" || !isNaN(new Date(date).getTime()), "Invalid sale date").optional().or(z.literal('')),
  buyer_name: z.string().optional().or(z.literal('')),
});

function Sales() {
  const [sales, setSales] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [farms, setFarms] = useState([]); // To populate the farm_id dropdown
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalSales, setTotalSales] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSales, setLoadingSales] = useState(false);

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
    formState: { errors },
  } = useForm({ resolver: zodResolver(salesSchema) });

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

  // HADDA WAXAA LAGA SAARAY TOAST-KII GUUSHA AHAA EE LOOMA BAHDNAAN JIRIN
  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    // Waxaan ka saarnay loading toast halkan. Waxaad isticmaali kartaa loadingSales state si aad
    // u muujiso loading indicator gudaha shaxda ama meel kale oo ku habboon.
    // Haddii aad runtii u baahan tahay loading toast, waa inaad isticmaashaa hab kale.
    try {
      const res = await axios.get("http://localhost:5000/sales", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        },
      });
      setSales(res.data.sales);
      setTotalSales(res.data.totalCount);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      toast.error("Failed to fetch sales data."); // Ciladaha oo kaliya ayaa la tusayaa
    } finally {
      setLoadingSales(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const totalPages = Math.ceil(totalSales / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onSubmit = async (data) => {
    const loadingToastId = toast.loading("Adding sale record...");
    try {
      await axios.post("http://localhost:5000/sales", data);
      reset();
      setShowAddModal(false);
      toast.success("✅ Sale record added successfully!", { id: loadingToastId });
      fetchSales(); // Dib u soo qaado xogta si ay usoo muuqato isbedelka
    } catch (err) {
      console.error("Error adding sale record:", err);
      toast.error(err.response?.data?.message || "❌ Failed to add sale record!", { id: loadingToastId });
    } finally {
      // Toast.dismiss halkan looma baahna sababtoo ah toast.success/error ayaa si otomaatig ah u joojinaya
    }
  };

  const handleEditClick = (item) => {
    setEditingSale(item);
    const saleDate = item.sale_date ? new Date(item.sale_date).toISOString().split('T')[0] : '';
    reset({
      ...item,
      farm_id: String(item.farm_id),
      quantity: item.quantity !== null ? item.quantity : '',
      price_per_unit: item.price_per_unit !== null ? item.price_per_unit : '',
      sale_date: saleDate,
    });
    setShowEditModal(true);
  };

  const onUpdate = async (data) => {
    const loadingToastId = toast.loading("Updating sale record...");
    try {
      if (editingSale) {
        await axios.put(`http://localhost:5000/sales/${editingSale.id}`, data);
        setEditingSale(null);
        setShowEditModal(false);
        toast.success("✅ Sale record updated successfully!", { id: loadingToastId });
        fetchSales(); // Dib u soo qaado xogta si ay usoo muuqato isbedelka
      }
    } catch (err) {
      console.error("Error updating sale record:", err);
      toast.error(err.response?.data?.message || "❌ Failed to update sale record!", { id: loadingToastId });
    } finally {
      // Toast.dismiss halkan looma baahna sababtoo ah toast.success/error ayaa si otomaatig ah u joojinaya
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    const loadingToastId = toast.loading("Deleting sale record...");
    try {
      if (deleteId) {
        await axios.delete(`http://localhost:5000/sales/${deleteId}`);
        setDeleteId(null);
        setShowDeleteModal(false);
        toast.success("🗑️ Sale record deleted successfully!", { id: loadingToastId });
        fetchSales(); // Dib u soo qaado xogta si ay usoo muuqato isbedelka
      }
    } catch (err) {
      console.error("Error deleting sale record:", err);
      toast.error(err.response?.data?.message || "❌ Failed to delete sale record!", { id: loadingToastId });
    } finally {
      // Toast.dismiss halkan looma baahna sababtoo ah toast.success/error ayaa si otomaatig ah u joojinaya
    }
  };

  // Client-side filtering based on searchTerm
  const filteredSales = sales.filter(item =>
    (item.product_type && item.product_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.buyer_name && item.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.farm && item.farm.name && item.farm.name.toLowerCase().includes(searchTerm.toLowerCase())) // Assuming farm object is included
  );

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
      {/* HEADER SECTION: Title, Search, and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sales Records</h1>
        <button
          onClick={() => {
            reset({
              farm_id: "",
              product_type: "",
              product_name: "",
              quantity: "",
              unit: "kg", // Default unit
              price_per_unit: "",
              sale_date: "",
              buyer_name: "",
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Sale
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search sales by product, buyer, etc."
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
                Product Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Product Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Unit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Price/Unit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Sale Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Buyer Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Total Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingSales ? (
              <tr>
                <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Loading sales data...
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  No sales records found.
                </td>
              </tr>
            ) : (
              filteredSales.map((item) => (
                <tr key={String(item.id)} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(item.farm_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.product_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.product_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.quantity !== null ? parseFloat(item.quantity).toFixed(2) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.unit || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.price_per_unit !== null ? parseFloat(item.price_per_unit).toFixed(2) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.sale_date ? new Date(item.sale_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {item.buyer_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {/* Calculate total revenue on the client-side for display if not present from API */}
                    {item.quantity !== null && item.price_per_unit !== null
                      ? (parseFloat(item.quantity) * parseFloat(item.price_per_unit)).toFixed(2)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition duration-150 ease-in-out"
                      title="Edit Sale"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition duration-150 ease-in-out"
                      title="Delete Sale"
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
            disabled={currentPage === 1 || loadingSales}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1 || loadingSales}
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
            disabled={currentPage === totalPages || loadingSales}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition duration-150 ease-in-out flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}

      {showAddModal && (
        <SalesForm
          title="Add New Sale Record"
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
        <SalesForm
          title="Edit Sale Record"
          handleSubmit={handleSubmit}
          onSubmit={onUpdate}
          register={register}
          errors={errors}
          onCancel={() => {
            setShowEditModal(false);
            setEditingSale(null);
            reset();
          }}
          farms={farms}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this sale record? This action cannot be undone.</p>
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

function SalesForm({ title, handleSubmit, onSubmit, register, errors, onCancel, farms }) {
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

            {/* Product Type Field */}
            <div className="relative flex-1 w-full">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Product Type (e.g., 'Crop', 'Livestock')"
                {...register("product_type")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.product_type && <p className="text-red-600 text-sm mt-1">{errors.product_type.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Product Name Field */}
            <div className="relative flex-1 w-full">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Product Name (e.g., 'Wheat', 'Milk')"
                {...register("product_name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.product_name && <p className="text-red-600 text-sm mt-1">{errors.product_name.message}</p>}
            </div>

            {/* Quantity Field */}
            <div className="relative flex-1 w-full">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01" // Allows decimal quantities
                placeholder="Quantity"
                {...register("quantity")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Unit Field */}
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg/L</span> {/* Placeholder icon/text */}
              <input
                type="text"
                placeholder="Unit (e.g., 'kg', 'liter', 'bushel')"
                {...register("unit")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.unit && <p className="text-red-600 text-sm mt-1">{errors.unit.message}</p>}
            </div>

            {/* Price Per Unit Field */}
            <div className="relative flex-1 w-full">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01" // Allows decimal prices
                placeholder="Price Per Unit"
                {...register("price_per_unit")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.price_per_unit && <p className="text-red-600 text-sm mt-1">{errors.price_per_unit.message}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Sale Date Field */}
            <div className="relative flex-1 w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                placeholder="Sale Date"
                {...register("sale_date")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.sale_date && <p className="text-red-600 text-sm mt-1">{errors.sale_date.message}</p>}
            </div>

            {/* Buyer Name Field */}
            <div className="relative flex-1 w-full">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buyer Name"
                {...register("buyer_name")}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700"
              />
              {errors.buyer_name && <p className="text-red-600 text-sm mt-1">{errors.buyer_name.message}</p>}
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

export default Sales;
