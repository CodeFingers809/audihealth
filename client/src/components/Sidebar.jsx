import React from 'react';
import { 
  LayoutDashboard, 
  Bot,
  Newspaper,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarLinks = [
  {
    title: "Analysis",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500"
  },
  {
    title: "FinBuddy",
    href: "/dashboard/finBuddy",
    icon: Bot,
    color: "text-blue-500"
  },
  {
    title: "Latest News",
    href: "/dashboard/news",
    icon: Newspaper,
    color: "text-blue-500"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500"
  }
];

const Sidebar = ({ children }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-50">
        <div className="p-6">
          <Link to="/">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fin<span className="font-['Devanagari']">साथी</span>
              </h1>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-4">
            {sidebarLinks.map(({ title, href, icon: Icon, color }) => (
              <Link 
                key={href}
                to={href}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium">{title}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;