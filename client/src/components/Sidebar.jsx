import React, { useContext } from "react";
import {
  LayoutDashboard,
  Bot,
  ClipboardPlus,
  Dumbbell,
  LogOut,
  HandHelping,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-pink-500",
  },
  {
    title: "Diagnosis",
    href: "/health",
    icon: ClipboardPlus,
    color: "text-pink-500",
  },
  { title: "AudiBuddy", href: "/audibuddy", icon: Bot, color: "text-pink-500" },
  {
    title: "Exercise",
    href: "/exercise",
    icon: Dumbbell,
    color: "text-pink-500",
  },
  {
    title: "Seek Help",
    href: "/map",
    icon: HandHelping,
    color: "text-pink-500",
  },
];

const Sidebar = ({ children }) => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-50">
        <div className="p-6 border-b border-pink-100">
          <Link to="/">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              AudiHealth
            </h1>
          </Link>
        </div>
        <nav className="flex-1 px-4 pb-4 pt-4">
          {sidebarLinks.map(({ title, href, icon: Icon, color }) => (
            <Link
              key={href}
              to={href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-pink-50"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <span>{title}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t border-pink-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-100 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
