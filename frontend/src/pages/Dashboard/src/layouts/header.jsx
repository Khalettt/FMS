import { useTheme } from "../hooks/use-theme"; 

import { Bell, ChevronsLeft, Moon, Search, Sun, LogOut } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ProfileModal } from "./ProfileModal"; 

import profileImg from "../assets/profile-image.jpg"; // Default profile image

import axios from "axios";

export const Header = ({ collapsed, setCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null); // State-ka user-ka

  useEffect(() => {
    // Shaqo: Soo qaado macluumaadka user-ka marka component-ku soo kaco
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Qaado token-ka
        if (!token) {
          console.warn("No token found, user might not be logged in.");
          // Si uu user-ka u ogaado, waxaad ku celin kartaa login page-ka haddii token-ku maqan yahay
          navigate("/login"); 
          return;
        }
        // FIIRO GAAR AH: Hubi in API endpoint-ka uu yahay mid sax ah (tusaale: /api/auth/me)
        const res = await axios.get("http://localhost:5000/api/auth/me", { // Halkan waxaan ka bedelay `/api/me` una bedelay `/api/auth/me`
          headers: {
            Authorization: `Bearer ${token}`, // Ku dar token-ka header-ka
          },
        });
        setUser(res.data); // Keydi macluumaadka user-ka
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        // Haddii token-ku ansax ahayn ama dhibaato kale jirto
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            toast.error("Fadhigaaga ayaa dhacay. Fadlan dib u gal.");
            localStorage.removeItem("token");
            navigate("/login");
        } else {
            toast.error("Kama guulaysan soo qaadashada macluumaadka user-ka.");
        }
      }
    };

    fetchUser();
  }, []); // [] waxay xaqiijinaysaa in tani ay hal mar oo kaliya socoto marka component-ku soo kaco

  // Sawirka profile-ka ee la isticmaalayo: midka user-ka ama kan default-ka ah
  // Hubi in `user.image_photo` uu yahay magaca saxda ah ee field-ka ka yimid backend-ka
  const profileImageSrc = user && user.image_photo
    ? `http://localhost:5000/uploads/${user.image_photo}` // Hubi in URL-ku sax yahay
    : profileImg;

  // Shaqada logout-ka
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Si guul ah ayaad uga baxday!");
    navigate("/login");
  };

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between px-4 shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronsLeft
            className={`size-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Search Box */}
        <div className="relative flex items-center rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white focus-within:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
          <Search className="mr-2 size-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "light" ? (
            <Moon className="size-5 text-slate-600" />
          ) : (
            <Sun className="size-5 text-slate-300" />
          )}
        </button>

        {/* Notification */}
        <button
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="size-5 text-slate-500 dark:text-slate-300" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden px-2 py-1"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {/* Sawirka Profile-ka */}
            <img
              src={profileImageSrc} // Halkan waxaan ku isticmaalay src-ga la diyaariyay
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if fallback also fails
                e.target.src = profileImg; // Haddii sawirku xumaado, kan default-ka ah soo bandhig
              }}
            />
            {/* Magaca User-ka */}
            {user && (
              <span className="text-xs p-2 font-medium text-gray-800 dark:text-white">
                {user.fullname} {/* Halkan waxaan ku soo bandhigay fullname */}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fade-in-down"
              role="menu"
              tabIndex="-1"
            >
              <div className="py-1">
                <ProfileModal isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    closeDropdown();
                    setIsProfileOpen(true); 
                  }}
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  role="menuitem"
                >
                  Profile
                </a>

                {/* Account Settings link */}
                    <Link
                    to="/settings"
                    onClick={closeDropdown}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  >
                    Settings
                  </Link>


                <button
                  onClick={() => {
                    closeDropdown(); // Xir dropdown-ka
                    toast(
                      (t) => (
                        <span className="flex flex-col gap-2">
                          <p className="text-sm">
                            Are sure to logout?
                          </p>
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                              No
                            </button>
                            <button
                              onClick={() => {
                                handleLogout(); // U yeer shaqada logout-ka
                                toast.dismiss(t.id);
                              }}
                              className="text-sm px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white"
                            >
                              Yes
                            </button>
                          </div>
                        </span>
                      ),
                      {
                        duration: 2000,
                      }
                    );
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};