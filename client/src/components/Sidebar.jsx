import React from "react";
import { LayoutDashboard, Bot, Newspaper, Settings } from "lucide-react";
import { Link } from "react-router-dom";

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
    icon: LayoutDashboard,
    color: "text-pink-500",
  },
  {
    title: "AudiBuddy",
    href: "/audibuddy",
    icon: Bot,
    color: "text-pink-500",
  },

];

const Sidebar = ({ children }) => {
  return (
    <div
      className="flex min-h-screen"
    >
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-50">
        <div className="p-6 border-b border-pink-100">
          <Link to="/">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all">
                AudiHealth
              </h1>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 pb-4 pt-4">
          <div className="space-y-2">
            {sidebarLinks.map(({ title, href, icon: Icon, color }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-pink-50 transition-all duration-200 group"
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform duration-200`}
                  />
                  <div className="absolute inset-0 bg-pink-200 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-200" />
                </div>
                <span className="text-sm font-medium group-hover:text-pink-600 transition-colors duration-200">
                  {title}
                </span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="p-4 mt-auto border-t border-pink-100">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
