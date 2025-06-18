import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import {
  ChartColumn,
  Home,
  NotepadText,
  Settings,
  Tractor,
  Leaf,
  Boxes,
  ShoppingCart,
  AlarmClock,
  DollarSign
} from "lucide-react";

import logoLight from "./../assets/logo-light.svg";
import logoDark from "./../assets/logo-dark.svg";
import { cnn } from "../utils/cn";
import PropTypes from "prop-types";

const navbarLinks = [
  {
    title: "Dashboard",
    links:  [
      { label: "Dashboard", icon: Home, path: "/dashboard" }, 
      { label: "Analytics", icon: ChartColumn, path: "/dashboard/analytics" }, 
      { label: "Reports", icon: NotepadText, path: "/dashboard/reports" }
    ]
  },
  {
    title: "Registration",
    links: [
      { label: "Farmers Collection", icon: Tractor, path: "/dashboard/farmers" },
      { label: "Farms Collection", icon: Leaf, path: "/dashboard/farms" },
      { label: "Crops Collection", icon: Boxes, path: "/dashboard/crops" },
      { label: "Equipment Collection", icon: DollarSign, path: "/dashboard/equipment" },
      { label: "Sales Collection", icon: ShoppingCart, path: "/dashboard/sales" },
      { label: "Fertilization Collection", icon: AlarmClock, path: "/dashboard/fertilization" }
      ]
  },
  {
    title: "Account Settings",
    links: [{ label: "Settings", icon: Settings, path: "/dashboard/settings" }]
  }
];

export const Sidebar = forwardRef(({ collapsed }, ref) => {
  return (
    <aside
      ref={ref}
      aria-label="Sidebar Navigation"
      className={cnn(
        "fixed z-[100] h-full flex flex-col overflow-x-hidden border-r bg-white dark:bg-slate-900 dark:border-slate-700 border-slate-300 transition-all",
        collapsed ? "md:w-[70px] md:items-center max-md:-left-full" : "md:w-[240px] max-md:left-0"
      )}
    >
      {/* Logo Section */}
      <div className={cnn("flex items-center p-3 gap-x-3", collapsed && "justify-center")}>
        <img src={logoLight} alt="Logo" className="dark:hidden" />
        <img src={logoDark} alt="Logo" className="hidden dark:block" />
        {!collapsed && (
          <span className="text-lg font-medium text-slate-900 dark:text-slate-50">
            SomFarmers
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-y-4 p-3 overflow-y-auto scrollbar-thin w-full">
        {navbarLinks.map((group) => (
          <nav
            key={group.title}
            className={cnn("flex flex-col gap-y-1", collapsed && "items-center")}
          >
            <p
              className={cnn(
                "text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 px-2",
                collapsed && "md:w-[45px] text-center"
              )}
            >
              {group.title}
            </p>

            {group.links.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  cnn(
                    "flex items-center gap-x-3 px-2 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                    isActive && "bg-slate-100 dark:bg-slate-800",
                    collapsed && "justify-center w-[45px]"
                  )
                }
              >
                <Icon size={22} className="flex-shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </NavLink>
            ))}
          </nav>
        ))}
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool
};
