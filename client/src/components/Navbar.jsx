import React from 'react'
import { Link } from "react-router-dom";
import { ArrowRight, Check, Menu, Mic, Heart, AlertCircle } from "lucide-react";
import logo from "../assets/logo.jpeg"

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Add active style function for Links
    const getLinkClass = ({ isActive }) => {
      return `${
        isActive ? "text-pink-500" : "text-gray-600"
      } font-medium hover:text-pink-500 transition-colors`;
    };
  return (
    <>
      <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-2 animate-fadeIn">
              <img src={logo} className="w-8 h-10" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                AudiHealth
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 z-50">
              <Link to="/" className={getLinkClass("/")}>
                Home
              </Link>
              <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/health" className={getLinkClass("/health")}>
                Diagnose
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-pink-500"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Single Mobile Menu Implementation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="p-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-pink-500"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-4 p-4">
              <Link
                to="/"
                className={getLinkClass("/")}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={getLinkClass("/dashboard")}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/health"
                className={getLinkClass("/health")}
                onClick={() => setIsMenuOpen(false)}
              >
                Diagnose
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar