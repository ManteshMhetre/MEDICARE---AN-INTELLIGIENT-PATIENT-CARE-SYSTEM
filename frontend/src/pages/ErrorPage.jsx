import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Preloader from "../components/common/Preloader";
import commonContext from "../contexts/common/commonContext";
import useScrollDisable from "../hooks/useScrollDisable";

const ErrorPage = () => {

    const { isLoading, toggleLoading } = useContext(commonContext);

    const navigate = useNavigate();

    useEffect(() => {
        toggleLoading(true);
        setTimeout(() => toggleLoading(false), 1000);
        //eslint-disable-next-line
    }, []);

    useScrollDisable(isLoading);

    if(isLoading) {
        return <Preloader />;
    }

    return (
        // error-page
        <div className="flex-col justify-center items-center px-16 py-[10px] pb-24 max-md:max-w-[600px] w-screen mx-0 my-auto">
            {/* err-img */}
            <div className="w-full flex justify-center">
                <img src="error-bg.png" alt="error-bg" className="max-w-[600px] max-md:max-w-[400px] w-full max-h-[600px]  max-md:max-h-[400px] h-[95vw]"/>
            </div>
            <h2 className="text-blue-7 mb-8 text-center">OOPS! PAGE NOT FOUND</h2>
            {/* err-content */}
            <div className="text-blue-6 mb-8 text-center">
                Sorry, the page you're looking for doesn't exist.
            </div>
            {/* back-btn */}
            <div className="flex justify-center ">
                <button onClick={() => navigate("/")} className="border-none outline-none leading-7 font-sans inline-block bg-blue-4 bg-opacity-100 text-white-1 px-6 py-3 rounded-[8px] cursor-pointer transition-all duration-300 ease-in-out hover:bg-blue-6 active:bg-blue-6 w-auto h-auto">Back to Home</button>
            </div>
        </div>
    );
}

export default ErrorPage;