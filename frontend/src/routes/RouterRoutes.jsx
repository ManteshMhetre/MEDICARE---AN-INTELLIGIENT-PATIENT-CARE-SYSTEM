import React from "react";
import { Routes, Route } from "react-router";
import useScrollRestore from "../hooks/useScrollRestore";
import LandingPage from "../pages/LandingPage";
import AboutUs from "../pages/AboutUs"
import Home from "../pages/Home";
import Doctors from "../pages/Doctors";
import MeetPage from "../pages/MeetPage";
import ErrorPage from "../pages/ErrorPage";
import Feedback from "../pages/Feedback";
import ResetPassword from "../components/resetPassword/ResetPassword";
import PrivacyPolicy from "../pages/Privacy";
import ContactUs from "../pages/ContactUs";
import ImageAnalyzer from "../pages/ImageAnalyzer";
import FindDietician from "../pages/FindDietician/FindDietician";
import Features from "../pages/Features";
const RouterRoutes = () => {
  useScrollRestore();

  return (
    <> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/instant-meet" element={<MeetPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/privacy" element= {<PrivacyPolicy/>} />
        <Route path="/image-analysis" element= {<ImageAnalyzer/>} />
        <Route path="/find-doctor" element= {<FindDietician/>} />
        <Route path="/features" element= {<Features/>} />
      </Routes>
    </>
  );
};

export default RouterRoutes;
