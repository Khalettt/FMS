import { useEffect, useState } from "react";
import axios from "axios";

export const ProfileModal = ({ isOpen, setIsOpen }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Fetch user error:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4">
      {/* Modal box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Profile Details
        </h2>

        {user ? (
          <div className="space-y-3 text-slate-700 dark:text-slate-200">
            <img
              src={`http://localhost:5000/uploads/${user.image_photo}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
            <div>
            <div className="flex justify-between items-center"> 
            <p><strong>Fullname:</strong> {user.fullname}</p>
            <p><strong>Username:</strong> {user.username}</p>
            </div>
            <div className="flex justify-between items-center"> 
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
