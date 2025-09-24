import { AlignRight, ArrowRightCircle, MoveRight, PanelsRightBottom, PlusCircle, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [isLogouted, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("User is logged in with token:", token);
      setIsLoggedOut(true);
    }else {
      setIsLoggedOut(false);
    }

  }, []);

  const handlePublish = () => {
    navigate("/add-ride");
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 w-full border-b border-gray-200 shadow-sm">
      <div className="flex h-16 mx-auto max-w-screen-xl items-center justify-between font-poppins px-10">
 
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-800 to-cyan-600 bg-clip-text text-transparent">
            Redigo
          </h1>
        </div>

        {/* Navbar */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="/search-rides"
            className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors"
          >
            Search Rides
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors"
          >
            Features
          </a>
          <a
            href="#safety"
            className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors"
          >
            Safety
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-700 hover:text-cyan-800 transition-colors"
          >
            Pricing
          </a>
        </nav>

    
        <div className="relative flex items-center space-x-4">
         
          <div
            className="flex justify-center items-center cursor-pointer mr-5"
            onClick={handlePublish}
          >
            <PlusCircle className="h-6 w-6 text-gray-800 hover:text-cyan-800 transition-colors mr-1" />
            <span className="text-sm text-gray-800 tracking-tight">
              Publish Your Ride
            </span>
          </div>

        
          <div className="relative ">
            <div
              className="ml-5 cursor-pointer"
              onClick={toggleOptions}
            >
              <UserPlus className="h-6 w-6 text-gray-800 hover:text-cyan-800 transition-colors" />
            </div>

            {showOptions && !isLogouted && (
              <div className="absolute right-0 mt-5 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-2 font-Inter z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between" onClick={() => navigate('/signin')}>
                  Sign In
                  <ArrowRightCircle className="w-4 text-gray-700"></ArrowRightCircle>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between" onClick={() => navigate('/signup')}>
                  Sign Up
                  <ArrowRightCircle className="w-4 text-gray-700"></ArrowRightCircle>
                </button>
              </div>
            )}
            {showOptions && isLogouted && (
              <div className="absolute right-0 mt-5 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-2 font-Inter z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between" onClick={() => {
                  setTimeout(() => {window.location.reload();}, 2000);
                  localStorage.removeItem("token");
                  setIsLoggedOut(false);
                  navigate('/');
                }}>
                  Logout
                  <ArrowRightCircle className="w-4 text-gray-700"></ArrowRightCircle>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
