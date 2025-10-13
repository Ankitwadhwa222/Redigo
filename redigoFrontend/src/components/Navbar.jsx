import {
  ArrowRightCircle,
  MessageCircle,
  PlusCircle,
  UserPlus,
  X,
  Menu,
  Home,
  Search,
  HelpCircle,
  Star,
  Shield,
  DollarSign
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showOptions]);

  const handlePublish = () => {
    console.log("🚗 Navigating → Add Ride");
    navigate("/add-ride");
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowOptions(false);
    setShowMobileMenu(false);
    navigate("/");
    // Force page reload to update auth state
    setTimeout(() => window.location.reload(), 100);
  };

  const handleNavClick = (path) => {
    console.log("🔗 Navigating to:", path);
    if (path.startsWith("/")) navigate(path);
    setShowMobileMenu(false);
  };

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("👤 User menu clicked, current state:", showOptions);
    setShowOptions(prev => !prev);
  };

  const handleUserMenuAction = (action) => {
    console.log("🎯 User menu action:", action);
    setShowOptions(false);
    if (typeof action === 'function') {
      action();
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-[100] w-full border-b border-gray-200 shadow-sm">
        <div className="flex h-16 mx-auto max-w-screen-xl items-center justify-between font-poppins px-4 md:px-10">
          {/* LOGO */}
          <div className="flex items-center space-x-2">
            <h1
              className="text-2xl font-extrabold bg-gradient-to-r from-cyan-800 to-cyan-600 bg-clip-text text-transparent cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              Redigo
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              Home
            </Link>
            <Link to="/search-rides" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              Search Rides
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              How it works
            </a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              Features
            </a>
            <a href="#safety" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              Safety
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors">
              Pricing
            </a>

            <Link
              to="/messages"
              className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex relative items-center space-x-4">
            {/* Publish Button */}
            <button
              type="button"
              className="flex justify-center items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              onClick={handlePublish}
            >
              <PlusCircle className="h-5 w-5 text-gray-800 hover:text-cyan-800 transition-colors mr-2" />
              <span className="text-sm text-gray-800 tracking-tight">Publish Your Ride</span>
            </button>

            {/* USER DROPDOWN - FIXED */}
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                onClick={toggleUserMenu}
                aria-label="User menu"
                aria-expanded={showOptions}
                aria-haspopup="true"
              >
                <UserPlus className="h-6 w-6 text-gray-800 hover:text-cyan-800 transition-colors" />
              </button>

              {/* Desktop Dropdown Menu - COMPLETELY FIXED */}
              {showOptions && (
                <>
                  {/* Backdrop for mobile-like behavior on desktop */}
                  <div 
                    className="fixed inset-0 z-[150]" 
                    onClick={() => setShowOptions(false)}
                  />
                  
                  {/* Actual Dropdown */}
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-[200] animate-in slide-in-from-top-2 duration-200"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* Dropdown Arrow */}
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                    
                    {!isLoggedIn ? (
                      <>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-800 flex items-center justify-between transition-colors group"
                          onClick={() => handleUserMenuAction(() => navigate("/signin"))}
                          role="menuitem"
                        >
                          <span className="font-medium">Sign In</span>
                          <ArrowRightCircle className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                        </button>
                        
                        <div className="my-1 border-t border-gray-100"></div>
                        
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-800 flex items-center justify-between transition-colors group"
                          onClick={() => handleUserMenuAction(() => navigate("/signup"))}
                          role="menuitem"
                        >
                          <span className="font-medium">Sign Up</span>
                          <ArrowRightCircle className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Account</p>
                        </div>
                        
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-800 flex items-center justify-between transition-colors group"
                          onClick={() => handleUserMenuAction(() => navigate("/user/dashboard"))}
                          role="menuitem"
                        >
                          <span className="font-medium">Your Rides</span>
                          <ArrowRightCircle className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                        </button>
                        
                        <div className="my-1 border-t border-gray-100"></div>
                        
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-between transition-colors group"
                          onClick={() => handleUserMenuAction(handleLogout)}
                          role="menuitem"
                        >
                          <span className="font-medium">Logout</span>
                          <ArrowRightCircle className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => {
                console.log("📱 Mobile menu toggle clicked");
                setShowMobileMenu((prev) => !prev);
              }}
              className="p-2 text-gray-700 hover:text-cyan-800 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Toggle mobile menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => {
            console.log("🧹 Closing mobile overlay");
            setShowMobileMenu(false);
          }}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`fixed top-16 left-0 right-0 bg-white shadow-xl z-[95] md:hidden transform transition-all duration-300 ease-in-out ${
          showMobileMenu ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {/* LINKS */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleNavClick("/")}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors text-left"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Home</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick("/search-rides")}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors text-left"
              >
                <Search className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Search Rides</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick("/messages")}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors text-left"
              >
                <MessageCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Messages</span>
              </button>

              {[
                { id: "how-it-works", icon: HelpCircle, label: "How It Works" },
                { id: "features", icon: Star, label: "Features" },
                { id: "safety", icon: Shield, label: "Safety" },
                { id: "pricing", icon: DollarSign, label: "Pricing" }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors text-left"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* PUBLISH BUTTON */}
            <button
              type="button"
              onClick={handlePublish}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 shadow-lg"
            >
              <PlusCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold">Publish Your Ride</span>
            </button>

            <div className="border-t border-gray-200 my-4" />

            {/* USER OPTIONS */}
            <div className="space-y-2">
              {!isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/signin")}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Sign In</span>
                    <ArrowRightCircle className="h-4 w-4 flex-shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/signup")}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Sign Up</span>
                    <ArrowRightCircle className="h-4 w-4 flex-shrink-0" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/user/dashboard")}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Your Rides</span>
                    <ArrowRightCircle className="h-4 w-4 flex-shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Logout</span>
                    <ArrowRightCircle className="h-4 w-4 flex-shrink-0" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;