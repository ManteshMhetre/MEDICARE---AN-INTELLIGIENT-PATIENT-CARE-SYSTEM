import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDocTitle from "../hooks/useDocTitle";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { MdExpandMore } from "react-icons/md";
import { TbStethoscope, TbHeartPlus } from "react-icons/tb";
import { BsRobot } from "react-icons/bs";
import { GiMedicines } from "react-icons/gi";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt, FaHospital } from "react-icons/fa";
import { IoAccessibility } from "react-icons/io5";
import Preloader from "../components/common/Preloader";
import commonContext from "../contexts/common/commonContext";
import useScrollDisable from "../hooks/useScrollDisable";
import bg from "../assets/landing-bg.png";
import bg2 from "../assets/landing-bg.png";
import hero from "../assets/hero.png";
import need from "../assets/need.png";
import profiles from "../data/teamData";
import TestimonialSection from "../components/landingPage/TestimonialCarousel";
import FindDietician from "../pages/FindDietician/FindDietician";

const TypingEffect = ({ text, speed = 100, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;

    if (!isDeleting && displayedText.length < text.length) {
      // Typing
      timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
    } else if (!isDeleting && displayedText.length === text.length) {
      // Pause at the end before starting to delete
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, speed * 10);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length - 1));
      }, speed / 2);
    } else if (isDeleting && displayedText.length === 0) {
      // Reset to start typing again
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, speed * 5);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, speed]);

  return (
    <div className="w-full">
      <h2
        className={`${className} md:overflow-hidden md:whitespace-nowrap inline-block`}
        style={
          {
            // width: `${text.length}ch`,
            // minWidth: `${text.length}ch`
          }
        }
      >
        {displayedText}
      </h2>
    </div>
  );
};

const LandingPage = () => {
  const { isLoading, toggleLoading } = useContext(commonContext);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const faqRef = useRef(null);

  useEffect(() => {
    toggleLoading(true);
    setTimeout(() => toggleLoading(false), 2000);
  }, []);

  useScrollDisable(isLoading);
  useDocTitle();
  const navigate = useNavigate();

  const handleFaqClick = (index) => {
    setOpenFaqIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleOutsideClick = (event) => {
    if (faqRef.current && !faqRef.current.contains(event.target)) {
      setOpenFaqIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  const handleOnCLick = () => {
    navigate("/doctors");
  };

  const faqs = [
    {
      question: "What is MediCare?",
      answer:
        "It is the web application that connects patients to the right doctor or allow them to choose a doctor as per their need. It provides information about users, doctors, news, appointments, and prescriptions. It also allows users to create instant meetings with doctors, and buy medicines. It allows users to check their health status by using his/her symptoms.",
    },
    {
      question:
        "Can we get a free account in MediCare and use all its features for free?",
      answer:
        "Yes, Ofcourse. You can use all the features provided by MediCare for free.",
    },
    {
      question: "Can we book an appointment at any time?",
      answer:
        "Yes. You can book an appointment of a doctor if he/she is free at that time.",
    },
    {
      question: "Is there a way to test our health?",
      answer:
        "Yes. You can test your health by a Model that predicts the disease probability in the future.",
    },
    {
      question: "Can we purchase the medicines from here?",
      answer: "Yes. You can purchase the medicines from MediCare store.",
    },
  ];

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      <div>
        <section className="h-screen w-full bg-[#f5f5f5] dark:bg-black-6">
          {/* curvy-img */}
          <div className="relative top-[5.5rem] h-[90%] bg-left bg-no-repeat bg-cover -b-4 left-0 z-0 bg-curvy-shape dark:bg-curvy-shape-dark max-lg:h-[95%] max-md:h-[80%] max-md:top-[23.5rem]"></div>
          <div className="absolute left-0 top-0 h-[85%] z-[1] flex justify-between items-center w-full text-blue-8 text-shadow-landing-highlight dark:text-shadow-landing-highlight-dark max-md:flex max-md:justify-end max-md:items-center max-md:flex-col-reverse max-xxs:top-12 max-lg:px-4">
            <div className="max-w-[55%]  md:pl-10 max-md:pt-8 max-md:max-w-[90%]">
              {/* highlight-heading */}
              {/* <h2 className="text-[2.5rem] mb-4 text-shado animated-heading max-md:text-[1.7em]">
                Healing Hands & Caring Hearts
              </h2> */}
              <TypingEffect
                text="Healing Hands & Caring Hearts"
                className="text-[2.5rem] mb-4 dark:mb-0 animated-heading max-md:text-[1.7em] dark:text-white-1 h-16"
              />
              {/* highlight-text */}
              <p className="text-[1rem] mt-[1.4rem] animate-fadeIn duration-200 ease-in-out gap-[2em] max-md:text-[1em] dark:text-white-1">
                Connecting patients and doctors, no matter the distance <br />
                we are dedicated to your wellbeing & committed to your care...
              </p>
              {/* {localStorage.getItem("username") && localStorage.getItem("username") !== "undefined" && localStorage.getItem("usertype") === "patient" && (
                                <button onClick={() => navigate("/wellness-programs")}>Join Wellness Program</button>
                            )} */}
            </div>

            <div className="max-w-[45%] sm:pr-16 sm:px-16 text-center max-md:max-w-full">
              <img
                src={bg}
                alt="landing bg"
                className="my-[20px] rounded-2xl"
              />
            </div>
          </div>
        </section>
        {/* services-section */}
        <section className="py-16 px-0 text-center bg-white-1 dark:bg-black-7">
          <div>
            <h2 className="text-[#333] mb-8 dark:text-yellow-1">
              Services we provide
            </h2>
          </div>
          {/* service-list */}
          <div className="flex flex-wrap justify-around mt-8 max-w-[1200px] my-0 mx-auto">
            {/* service-item */}
            <div className="bg-[#f5f5f5] flex flex-col items-center flex-shrink flex-grow-0 basis-[30%] min-w-[280px] max-w-[280px] text-center p-[25px] rounded-[10px] transition-all duration-300 border-[1px] border-white-[#dcdcdc] m-4 hover:scale-[1.05] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-black-2 dark:border-yellow-1 dark:border-opacity-40">
              {/* icon-container */}
              <div className="flex items-center justify-center min-h-[80px] max-h-[80px]">
                {/* icon icon-1*/}
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.8rem] bg-[rgba(25, 150, 143, 0.1)] text-[#19958f] border-[2px] border-[#19958f] dark:text-green-8 dark:border-green-7">
                  <TbStethoscope />
                </div>
              </div>
              <h3 className="text-[#222] mb-3 text-[1.25rem] dark:text-white-1">
                Experienced Doctors
              </h3>
              <p className="text-[#555] text-[0.9rem] dark:text-white-1">
                Connect with doctors through live video calls and receive
                prescriptions.
              </p>
            </div>
            <div className="flex flex-col items-center flex-shrink flex-grow-0 basis-[30%] min-w-[280px] max-w-[280px] text-center p-[25px] rounded-[10px] transition-all duration-300 border-[1px] border-white-[#dcdcdc] bg-[#f5f5f5] m-4 hover:scale-[1.05] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-black-2 dark:border-yellow-1 dark:border-opacity-40">
              <div className="flex items-center justify-center min-h-[80px] max-h-[80px]">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.8rem] bg-[rgba(245, 158, 50, 0.1)] text-[#f59c23] border-[2px] border-[#f59c23] dark:text-yellow-9 dark:border-yellow-7">
                  <BsRobot />
                </div>
              </div>
              <h3 className="text-[#222] mb-3 text-[1.25rem] dark:text-white-1">
                Health Prediction & Analysis
              </h3>
              <p className="text-[#555] text-[0.9rem] dark:text-white-1">
                Assess your health status with our AI/ML models
              </p>
            </div>
            <div className="flex flex-col items-center flex-shrink flex-grow-0 basis-[30%] min-w-[280px] max-w-[280px] text-center p-[25px] rounded-[10px] transition-all duration-300 border-[1px] border-white-[#dcdcdc] bg-[#f5f5f5] m-4 hover:scale-[1.05] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-black-2 dark:border-yellow-1 dark:border-opacity-40">
              <div className="flex items-center justify-center min-h-[80px] max-h-[80px]">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.8rem] bg-[rgba(240, 80, 50, 0.1)] text-[#f05032] border-[2px] border-[#f05032] dark:text-red-5 dark:border-red-6">
                <BsRobot />
                </div>
              </div>
              <h3 className="text-[#222] mb-3 text-[1.25rem] dark:text-white-1">
                AI Powered Chatbot
              </h3>
              <p className="text-[#555] text-[0.9rem] dark:text-white-1">
                A chatbot to give seamless services for user queries
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-0 bg-[#f5f5f5] dark:bg-black-8">
          <div className="w-full flex flex-wrap my-0 mx-auto justify-center items-center max-w-[1300px] max-md:flex max-md:flex-col">
            <div className="flex-shrink-0 flex-grow-0 basis-[40%] w-full p-4 text-center max-md:mb-8">
              <div className="max-sm:flex max-sm:justify-center">
                <img
                  src={need}
                  alt="why"
                  className="w-[90%] max-ma:max-w-[400px] max-md:w-[90%]"
                />
              </div>
            </div>
            <div className="flex-shrink-0 flex-grow-0 basis-[55%] p-4 max-md:p-8">
              <h2 className="text-blue-9 mb-8 dark:text-blue-33 ">
                Why do we need a proper health care?
              </h2>
              <ul className="dark:text-white-1 text-blue-8">
                <li className="my-4 mx-auto ">
                  WHO recommends 44.5 doctors per 10,000 people but India has
                  only 22 per 10k people so major supply demand mismatchIndia
                  has 22.8 doctors for every 10K citizens, the half of what WHO
                  recommends.
                </li>
                <li className="my-4 mx-auto">
                  Also, local doctors may fail to provide the best consultation
                  as they lack expertise & experience.
                </li>
                <li className="my-4 mx-auto">
                  Thus all-in-one online hospital was created. It offers a
                  disease prediction system, pharmacy, and payments.
                </li>
                <li className="my-4 mx-auto">
                  This platform provides access to quality healthcare from
                  anywhere, improving healthcare outcomes and accessibility.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-20 px-0 bg-[#f5f5f5] dark:bg-black-8">
          <div className="w-full flex flex-wrap my-0 mx-auto justify-center items-center max-w-[1300px] max-md:flex max-md:flex-col">
            
          <div className="flex-shrink-0 flex-grow-0 basis-[55%] p-4 max-md:p-8">
  <h2 className="text-blue-9 mb-8 dark:text-blue-33">
    Why is finding nearby hospitals important?
  </h2>
  <ul className="dark:text-white-1 text-blue-8">
    <li className="my-4 mx-auto">
      In emergencies, quick access to nearby hospitals can save lives by reducing response time.
    </li>
    <li className="my-4 mx-auto">
      Locating hospitals with the right facilities ensures timely and proper medical care.
    </li>
    <li className="my-4 mx-auto">
      Finding hospitals nearby helps patients avoid long travel times, reducing stress and health risks.
    </li>
    <li className="my-4 mx-auto">
      A smart hospital locator can assist in identifying the best options based on specialization, availability, and user ratings.
    </li>
  </ul>

  <div>
              <button onClick={()=> navigate("/find-doctor")} class="px-5 py-4 focus:outline focus:ring-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white-1">Find Nearby Hospital</button>
            </div>
</div>


            <div className="flex-shrink-0 flex-grow-0 basis-[40%] w-full p-4 text-center max-md:mb-8">
              <div className="max-sm:flex max-sm:justify-center">
                <img
                  src={hero}
                  alt="why"
                  className="w-[90%] max-ma:max-w-[400px] max-md:w-[90%] rounded-xl"
                />
              </div>
           
            </div>
          </div>
        </section>

       

        <section className="py-12 px-0 bg-white-1 dark:bg-black-3">
          <div className="text-center text-blue-9 dark:text-blue-33">
            <h2>Our Benefits</h2>
            <div className="flex flex-wrap my-0 mx-auto max-w-[1000px] justify-center mt-8 text-blue-7 dark:text-white-1">
              {/* first */}
              <div className="flex justify-between items-center shrink-0 grow-0 basis-[20%] min-w-[210px] max-w-[210px] text-center py-4 px-8 rounded-[7px] transition-all duration-300 ease-in-out bg-[rgba(246,171,47,0.1)] dark:bg-yellow-6 dark:bg-opacity-10 m-4 dark:hover:shadow-[0_0_4px_0_#ffc92e] hover:shadow-[0_0_4px_1px_#f6ab2f]">
                {/* icon */}
                <div className="text-[1.5rem] shrink-0 grow-0 basis-[20%] text-[#f6ab2f]">
                  <MdOutlineHealthAndSafety />{" "}
                </div>
                <p className="flex shrink-0 grow-0 basis-[70%]">
                  TeleHealth services
                </p>
              </div>
              <div className="flex justify-between items-center shrink-0 grow-0 basis-[20%] min-w-[210px] max-w-[210px] text-center py-4 px-8 rounded-[7px] transition-all duration-300 ease-in-out bg-[rgba(12,184,182,0.1)]  m-4 hover:shadow-[0_0_4px_0_#0cb8b6] dark:hover:shadow-[0_0_4px_1px_#0fd4ca]">
                <div className="text-[1.5rem] shrink-0 grow-0 basis-[20%] text-[#0cb8b6]">
                  <IoAccessibility />{" "}
                </div>
                <p className="flex shrink-0 grow-0 basis-[70%]">
                  Convenience and accessibility
                </p>
              </div>
              <div className="flex justify-between items-center shrink-0 grow-0 basis-[20%] min-w-[210px] max-w-[210px] text-center py-4 px-8 rounded-[7px] transition-all duration-300 ease-in-out bg-[rgba(230,73,45,0.1)] dark:bg-red-6 dark:bg-opacity-10 m-4 hover:shadow-[0_0_4px_0_#e6492d] dark:hover:shadow-[0_0_4px_1px_#ff0a0a]">
                <div className="text-[1.5rem] shrink-0 grow-0 basis-[20%] text-[#e6492d]">
                  <TbStethoscope />{" "}
                </div>
                <p className="flex shrink-0 grow-0 basis-[70%]">
                  Online Appointment Booking
                </p>
              </div>
              <div className="flex justify-between items-center shrink-0 grow-0 basis-[20%] min-w-[210px] max-w-[210px] text-center py-4 px-8 rounded-[7px] transition-all duration-300 ease-in-out bg-[rgba(22,101,216,0.1)] m-4 hover:shadow-[0_0_4px_0_#1665d8] dark:hover:shadow-[0_0_4px_1px_#4188f5]">
                <div className="text-[1.5rem] shrink-0 grow-0 basis-[20%] text-[#1665d8]">
                  <TbHeartPlus />{" "}
                </div>
                <p className="flex shrink-0 grow-0 basis-[70%]">
                  Competitive advantage
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* team-section */}
        <section className="py-20 px-0 text-center bg-white-1 dark:bg-black-3">
          {/* team-div */}
          <div>
            <div>
              <h2 className="text-blue-9 mb-8 dark:text-blue-33">
                Meet Our Doctor's Team
              </h2>
            </div>
            {/* team */}
            <div className="flex flex-wrap my-0 mx-auto max-w-[1200px] justify-center mt-8">
              {profiles.map((profile) => (
                // item
                <div
                  className="flex justify-center items-center flex-col flex-grow-0 flex-shrink-0 basis-[25%] relative min-w-[250px] max-w-[250px] text-center rounded-[12px] transition-all duration-300 bg-white-1 border-[1px] border-[#eaeaea] m-4 py-4 px-0 hover:shadow-[0_0_10px_10px_#fff] group cursor-pointer dark:hover:shadow-[0_0_9px_8px_#fff] hover:rounded-[12px]"
                  key={profile.id}
                >
                  <div>
                    <img
                      src={profile.imgSrc}
                      alt={profile.name}
                      className="w-[250px] h-[250px] border-[1px] border-[#eaeaea]"
                    />
                    {/* contact-div */}
                    <div className="absolute bottom-[85px] text-[0] opacity-0 flex justify-center items-center transition-all duration-500 ease-linear bg-[rgba(74,76,178,0.8)] w-[250px] h-[70px] rounded-tl-[70%] rounded-tr-[70%] group-hover:opacity-100 group-hover:visible group-hover:text-[30px]">
                      {profile.contact.map((contact, index) => {
                        const IconComponent =
                          contact.icon === "IoMdMail"
                            ? IoMdMail
                            : contact.icon === "FaPhoneAlt"
                            ? FaPhoneAlt
                            : FaHospital;
                        return (
                          <div
                            // contact-icon
                            className="text-white-1 p-[5px] pl-0 m-[7px] cursor-pointer transition-all duration-100 ease-linear hover:text-white-1"
                            key={index}
                            onClick={handleOnCLick}
                          >
                            <IconComponent />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <h3 className="text-blue-6 mt-4 mb-[0.7rem] cursor-pointer hover:text-blue-9">
                    {profile.name}
                  </h3>
                  <p className="text-grey-3">{profile.specialty}</p>
                </div>
              ))}
            </div>
          </div>

          <TestimonialSection />
        </section>
        {/* faq-section */}
        <section className="py-20 px-0 text-center text-white-1 dark:bg-black-8">
          {/* faq-div */}
          <div
            className="w-full flex flex-wrap my-0 mx-auto p-[5px] justify-between items-start max-w-[1300px] max-md:flex max-md:flex-col max-md:justify-center"
            ref={faqRef}
          >
            {/* img-div */}
            <div className="shrink-0 grow-0 basis-[40%] w-full p-4 text-center max-md:mb-8">
              <img
                src="faq-img.png"
                alt="faq"
                className="w-[90%] max-md:max-w-[400px] max-md:w-full"
              />
            </div>
            {/* content */}
            <div className="shrink-0 grow-0 basis-[55%] p-4 max-md:p-8">
              <h2 className="text-blue-8 mb-8 dark:text-white-1">Any Queries ?</h2>
              {/* faqs */}
              <div className="w-full my-0 mx-auto rounded-[12px]">
                {faqs.map((item, index) => (
                  <Accordion
                    key={index}
                    // faq-item
                    sx={{
                      backgroundColor: "#7584ae", // Equivalent to bg-blue-3
                      color: "#FFFFFF", // Equivalent to text-white-1
                      borderRadius: "5px",
                      marginBottom: "15px",
                      border: "none",
                      outline: "none",
                      transition: "box-shadow 0.1s ease",
                      ":hover": {
                        boxShadow: "0px 0px 10px 2px rgba(59, 130, 246, 0.6)", // Hover shadow effect
                      },
                    }}
                    className="dark:bg-blue-34"
                    expanded={openFaqIndex === index}
                    onChange={() => handleFaqClick(index)}
                  >
                    <AccordionSummary
                      expandIcon={<MdExpandMore style={{ color: "#FFFFFF" }} />}
                      className="expand-icon"
                    >
                      {/* item-qn */}
                      <div className="text-left">{item.question}</div>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        backgroundColor: "#FFFFFF", // Equivalent to bg-white-1
                        color: "#4A4CB2", // Equivalent to text-blue-7
                        borderRadius: "12px",
                        padding: "3px",
                        margin: "10px",
                      }}
                      className="dark:bg-[#000]"
                    >
                      {/* item-ans */}
                      <div className="w-full p-4 rounded-[12px] bg-white-1 text-blue-7 text-left dark:text-white-1 dark:bg-[#000]" >
                        {item.answer}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
