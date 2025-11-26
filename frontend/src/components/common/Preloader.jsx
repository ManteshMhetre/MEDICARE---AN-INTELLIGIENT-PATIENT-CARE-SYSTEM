import React from "react";
import logo from "../../assets/header.png";

const Preloader = () => {
    return (
      <div
        id="preloader"
        className="fixed top-0 left-0 w-full h-full z-[99999] bg-white-1 flex items-center justify-center"
      >
        <div className="relative text-center">
          {/* Wave Animation */}
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110px] overflow-hidden animate-spark">
            <svg
              viewBox="0 0 300.08 300.08"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[110px] h-[110px] fill-[#f00] max-sm:w-[90px] max-sm:h-[90px] "
            >
              <g>
                <path d="m293.26 184.14h-82.877l-12.692-76.138c-.546-3.287-3.396-5.701-6.718-5.701-.034 0-.061 0-.089 0-3.369.027-6.199 2.523-6.677 5.845l-12.507 87.602-14.874-148.69c-.355-3.43-3.205-6.056-6.643-6.138-.048 0-.096 0-.143 0-3.39 0-6.274 2.489-6.752 5.852l-19.621 137.368h-9.405l-12.221-42.782c-.866-3.028-3.812-5.149-6.8-4.944-3.13.109-5.777 2.332-6.431 5.395l-8.941 42.332h-73.049c-3.771 0-6.82 3.049-6.82 6.82 0 3.778 3.049 6.82 6.82 6.82h78.566c3.219 0 6.002-2.251 6.67-5.408l4.406-20.856 6.09 21.313c.839 2.939 3.526 4.951 6.568 4.951h20.46c3.396 0 6.274-2.489 6.752-5.845l12.508-87.596 14.874 148.683c.355 3.437 3.205 6.056 6.643 6.138h.143c3.39 0 6.274-2.489 6.752-5.845l14.227-99.599 6.397 38.362c.546 3.287 3.396 5.702 6.725 5.702h88.66c3.771 0 6.82-3.049 6.82-6.82-.001-3.772-3.05-6.821-6.821-6.821z"></path>
              </g>
            </svg>
          </div>
  
          {/* Logo with Pulse Animation */}
          <div className="">
            <img
              src={logo}
              alt="medicare Logo"
              className="h-[75px] max-sm:h-[57px] animate-pulse-custom object-contain transform transition-none duration-200 ease-in-out scale-100 hover:scale-110"
            />
          </div>
        </div>
      </div>
    );
  };
  
  export default Preloader;