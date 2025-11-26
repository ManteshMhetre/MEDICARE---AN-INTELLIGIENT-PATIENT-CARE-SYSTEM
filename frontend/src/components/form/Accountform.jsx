import React, { useContext, useEffect, useRef, useState } from "react";
import commonContext from "../../contexts/common/commonContext";
import useOutsideClose from "../../hooks/useOutsideClose";
import useScrollDisable from "../../hooks/useScrollDisable";
import { Alert, CircularProgress } from "@mui/material";
import httpClient from "../../httpClient";
import {
  FaUser,
  FaUserMd,
  FaUserClock,
  FaIdCard,
  FaPhoneAlt,
  FaPencilAlt,
  FaTimes,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { auth, signInWithPopup, provider } from "../../firebase";
import heartRateLogo from "../../assets/heart-rate-logo.png";
import doctorMale from "../../assets/doctor-male.png";
import doctorFemale from "../../assets/doctor-female.png";
import patientMale from "../../assets/patient-male.png";
import patientFemale from "../../assets/patient-female.png";

const AccountForm = ({ isSignup, setIsSignup }) => {
  const { isFormOpen, toggleForm, setFormUserInfo } = useContext(commonContext);
  const [username, setUsername] = useState("");
  const [usertype, setUsertype] = useState("patient");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [isInvEmail, setIsInvEmail] = useState(false);
  const [isInvPass, setIsInvPass] = useState(false);
  const [isInvPhone, setIsInvPhone] = useState(false);
  const [isInvAge, setIsInvAge] = useState(false);
  const [isAlert, setIsAlert] = useState("");
  const [alertCont, setAlertCont] = useState("");
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [ismedicareAuth, setIsmedicareAuth] = useState(true);
  const setCurrAuthApp = [setIsmedicareAuth, setIsGoogleAuth];
  const [currAuthAppIdx, setCurrAuthAppIdx] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useOutsideClose(formRef, () => {
    toggleForm(false);
    setUsername("");
    setUsertype("patient");
    setAge("");
    setGender("male");
    setPhone("");
    setEmail("");
    setPasswd("");
    setIsForgotPassword(false);
    setSpecialization("");
    setDoctorId("");
    setProfilePic(null);
    setProfilePicFile(null);
  });

  useScrollDisable(isFormOpen);

  const [isSignupVisible, setIsSignupVisible] = useState(isSignup);
  useEffect(() => {
    setIsSignupVisible(isSignup);
  }, [isSignup]);

  // Signup-form visibility toggling
  const handleIsSignupVisible = () => {
    setIsSignupVisible((prevState) => !prevState);
    setIsForgotPassword(false);
  };

  // Default profile picture based on usertype and gender
  const getDefaultProfilePic = () => {
    if (usertype === "doctor") {
      return gender === "female" ? doctorFemale : doctorMale;
    } else {
      return gender === "female" ? patientFemale : patientMale;
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
      setProfilePicFile(file);
    }
  };

  // Clear profile picture
  const removeProfilePic = () => {
    setProfilePic(null);
  };

  const checkAge = (a) => {
    const t = parseInt(a) > 0 && parseInt(a) <= 120 && /^[0-9]{1,3}$/.test(a);
    setIsInvAge(!t);
    return t;
  };

  const checkEmail = (email) => {
    // eslint-disable-next-line
    const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    setIsInvEmail(!res);
    return res;
  };

  const checkPasswd = (passwd) => {
    const res = /^.{6,}$/.test(passwd);
    setIsInvPass(!res);
    return res;
  };

  const validatePhoneNumber = (phoneNumber) => {
    const pattern = /^\+?1?\d{10,10}$/;
    const res = pattern.test(phoneNumber);
    setIsInvPhone(!res);
    return res;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isInvEmail) return;

    setIsSuccessLoading(true);
    try {
      await httpClient.post("/forgot_password", { email });
      setIsAlert("success");
      setAlertCont("Password reset link sent to your email");
      setTimeout(() => {
        setIsAlert("");
        setIsForgotPassword(false);
      }, 1500);
    } catch (err) {
      setIsAlert("error");
      setAlertCont("Email not found");
      setTimeout(() => setIsAlert(""), 1500);
    }
    setIsSuccessLoading(false);
  };

  const handleAuthApp = (idx) => {
    setCurrAuthAppIdx((prevIdx) => {
      setCurrAuthApp[prevIdx](false); // Reset previous auth to false
      setCurrAuthApp[idx](true); // Set new auth to true
      return idx; // Update index properly
    });
  };

  const handleGoogleRegister = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // Get the ID token

      // Create a FormData object
      const formData = new FormData();
      formData.append("registerer", usertype);
      formData.append("email", result.user.email);
      formData.append("id_token", idToken);

      if (profilePicFile && profilePicFile instanceof File) {
        // If profilePicFile exists, append it
        formData.append("profile_picture", profilePicFile);
      } else {
        // If profilePicFile is empty, fetch patientMale URL and convert it to Blob
        try {
          const response = await fetch(getDefaultProfilePic());
          const blob = await response.blob();
          formData.append("profile_picture", blob, "default_profile.jpg");
        } catch (err) {
          console.error("Error fetching default profile picture:", err);
        }
      }

      // Send the FormData request
      const res = await httpClient.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsAlert("success");
      setAlertCont("Signup Successful");

      setTimeout(() => {
        setIsAlert("");
        toggleForm(false);
        setFormUserInfo({
          username: res.data.username,
          usertype: usertype,
          gender: res.data.gender,
          phone: res.data.phone,
          email: res.data.email,
          passwd,
          specialization: res.data.specialization,
          doctorId: res.data.doctorId,
          age: res.data.age,
          verified: false,
          profile_picture: res.data.profile_picture,
        });
        toggleForm(false);
        // window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsAlert("error");
      setAlertCont("Signup Failed");
      setTimeout(() => {
        setIsAlert("");
      }, 1500);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // Get the ID token

      // Send ID token to the backend for login
      const res = await httpClient.post("/login", { id_token: idToken });

      // Store access token in local storage
      localStorage.setItem("token", res.data.access_token);

      // Set success alert
      setIsAlert("success");
      setAlertCont("Login Successful");

      // Update user info & UI state
      setTimeout(() => {
        setIsAlert("");
        toggleForm(false);
        setFormUserInfo({
          username: res.data.username,
          usertype: res.data.usertype,
          gender: res.data.gender,
          phone: res.data.phone,
          email: res.data.email,
          passwd,
          specialization: res.data.specialization,
          doctorId: res.data.doctorId,
          age: res.data.age,
          verified: res.data.verified,
          profile_picture: res.data.profile_picture,
          fee: res.data.fee,
        });

        // window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Login Error:", error);

      // Handle login failure
      setIsAlert("error");
      setAlertCont("Login Failed");

      setTimeout(() => {
        setIsAlert("");
      }, 1500);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isInvEmail || isInvPass || isInvPhone) return;

    setIsSuccessLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("registerer", usertype);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("phone", "+91" + phone);
      formData.append("email", email);
      formData.append("passwd", passwd);
      formData.append("specialization", specialization);
      formData.append("doctorId", doctorId);

      // Handle profile picture
      if (profilePicFile && profilePicFile instanceof File) {
        formData.append("profile_picture", profilePicFile);
      } else {
        try {
          const response = await fetch(getDefaultProfilePic());
          const blob = await response.blob();
          formData.append("profile_picture", blob, "default_profile.jpg");
        } catch (err) {
          console.error("Error fetching default profile picture:", err);
        }
      }

      setIsSuccessLoading(false);

      // Choose between login or signup
      if (isSignupVisible) {
        isGoogleAuth
          ? await handleGoogleRegister()
          : await handleRegister(formData);
      } else {
        isGoogleAuth ? await handleGoogleLogin() : await handleLogin();
      }
    } catch (error) {
      console.error("Form Submission Error:", error);
      setIsSuccessLoading(false);
      setIsAlert("error");
      setAlertCont("An unexpected error occurred.");
      setTimeout(() => setIsAlert(""), 1500);
    }
  };

  // Helper function to handle registration
  const handleRegister = async (formData) => {
    try {
      const res = await httpClient.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsAlert("success");
      setAlertCont("Signup Successful");

      setTimeout(() => {
        setIsAlert("");
        setFormUserInfo({
          username,
          usertype,
          gender,
          phone,
          email,
          passwd,
          specialization,
          doctorId,
          age,
          verified: false,
          profile_picture: res.data.profile_picture,
        });
        toggleForm(false);
        // window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Signup Error:", err);
      setIsAlert("error");
      setAlertCont("User already exists");
      setTimeout(() => setIsAlert(""), 1500);
    }
  };

  // Helper function to handle login
  const handleLogin = async () => {
    try {
      const res = await httpClient.post("/login", { email, passwd });

      localStorage.setItem("token", res.data.access_token);
      setIsAlert("success");
      setAlertCont("Login Successful");

      setTimeout(() => {
        setIsAlert("");
        toggleForm(false);
        setFormUserInfo({
          username: res.data.username,
          usertype: res.data.usertype,
          gender: res.data.gender,
          phone: res.data.phone,
          email: res.data.email,
          passwd,
          specialization: res.data.specialization,
          doctorId: res.data.doctorId,
          age: res.data.age,
          verified: res.data.verified,
          profile_picture: res.data.profile_picture,
        });
        // window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Login Error:", err);
      setIsAlert("error");
      setAlertCont("Login Failed");
      setTimeout(() => setIsAlert(""), 1500);
    }
  };

  return (
    <>
      {isFormOpen && (
        <div className="relative">
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black-1/50 pointer-events-none">
            <form
              id=""
              className="relative bg-blue-3 text-blue-8 max-w-[450px] max-h-[90vh] overflow-y-auto scrollbar-none w-full p-12 rounded-[3px] z-[99] max-xs:px-4 max-xs:py-8 mx-4 pointer-events-auto"
              ref={formRef}
              onSubmit={
                isForgotPassword ? handleForgotPassword : handleFormSubmit
              }
            >
              {isAlert !== "" && (
                <Alert severity={isAlert} className="form_sucess_alert">
                  {alertCont}
                </Alert>
              )}

              {/*===== Form-Header =====*/}
              <div className="text-white-1">
                <h2 className="mb-[0.6rem]">
                  {isForgotPassword
                    ? "Forgot Password"
                    : isSignupVisible
                    ? "Sign Up"
                    : "Login"}
                </h2>
                {!isForgotPassword && (
                  <p>
                    {isSignupVisible
                      ? "Already have an account ?"
                      : "New to medicare ?"}
                    &nbsp;&nbsp;
                    <button
                      type="button"
                      onClick={handleIsSignupVisible}
                      className="text-blue-1 opacity-80 hover:opacity-100"
                    >
                      {isSignupVisible ? "Login" : "Create an account"}
                    </button>
                  </p>
                )}
              </div>

              {/*===== Form-Body =====*/}
              <div className="mt-7">
                {isSignupVisible && (
                  <>
                    <div className="relative mb-5">
                      <div
                        className="flex justify-center rounded-full relative w-[45%] aspect-square mx-auto bg-white-1 shadow-[0_0_5px_1px_#282f42] border-[2px] border-blue-3"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <img
                          src={profilePic || getDefaultProfilePic()} // Show uploaded image or default
                          alt="Profile"
                          className="w-full h-full rounded-full"
                        />

                        {/* Show delete icon on hover only if the user has uploaded a picture */}
                        {profilePic && isHovered && (
                          <button
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md cursor-pointer border-2 border-red-500"
                            onClick={removeProfilePic}
                          >
                            <FaTimes className="w-5 h-5 text-red-500" />
                          </button>
                        )}

                        {/* Edit Icon Positioned at Bottom-Right of the Image */}
                        <label
                          htmlFor="profile_picture"
                          className="absolute bottom-0 right-2 bg-white-1 p-2 rounded-full shadow-md cursor-pointer border-2 border-blue-3"
                        >
                          <FaPencilAlt className="w-5 h-5 text-blue-3" />
                        </label>
                      </div>

                      {/* Hidden Input Field */}
                      <input
                        type="file"
                        name="profile_picture"
                        id="profile_picture"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="relative mb-5">
                      <label className="text-blue-1">Register as</label>
                      <div className="mt-[10px]">
                        <input
                          type="radio"
                          name="usertype"
                          id="patient"
                          className="appearance-none my-0 mx-[5px] w-[1.2em] h-[1.2em] bg-blue-1 content-none cursor-pointer outline-none rounded-[15px] -top-[2px] -left-[1px] relative inline-block visible border-[4px] border-blue-1 checked:bg-blue-8"
                          value="patient"
                          checked={usertype === "patient"}
                          onChange={(e) => setUsertype(e.target.value)}
                        />{" "}
                        <label
                          htmlFor="patient"
                          className="cursor-pointer text-white-1 mr-4"
                        >
                          Patient
                        </label>
                        <input
                          type="radio"
                          name="usertype"
                          id="doctor"
                          className="appearance-none my-0 mx-[5px] w-[1.2em] h-[1.2em] bg-blue-1 content-none cursor-pointer outline-none rounded-[15px] -top-[2px] -left-[1px] relative inline-block visible border-[4px] border-blue-1 checked:bg-blue-8"
                          value="doctor"
                          checked={usertype === "doctor"}
                          onChange={(e) => setUsertype(e.target.value)}
                        />{" "}
                        <label
                          htmlFor="doctor"
                          className="cursor-pointer text-white-1 mr-4"
                        >
                          Doctor
                        </label>
                      </div>
                    </div>

                    {!isGoogleAuth && (
                      <>
                        <div className="relative mb-4">
                          <FaUser
                            className="absolute left-3 top-[15px] text-white-1"
                            size={16}
                          />
                          <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>

                        {usertype === "doctor" && (
                          <>
                            <div className="relative mb-4">
                              <FaUserMd
                                className="absolute left-3 top-[15px] text-white-1"
                                size={18}
                              />
                              <input
                                type="text"
                                name="specialization"
                                placeholder="Specialization"
                                className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                                value={specialization}
                                onChange={(e) =>
                                  setSpecialization(e.target.value)
                                }
                                required
                              />
                            </div>

                            <div className="relative mb-4">
                              <FaIdCard
                                className="absolute left-3 top-[15px] text-white-1"
                                size={18}
                              />
                              <input
                                type="text"
                                name="ID"
                                placeholder="Doctor ID"
                                className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                                value={doctorId}
                                onChange={(e) => setDoctorId(e.target.value)}
                                required
                              />
                            </div>
                          </>
                        )}

                        {usertype === "patient" && (
                          <div>
                            <div className="relative mb-4">
                              <FaUserClock
                                className="absolute left-3 top-[15px] text-white-1"
                                size={18}
                              />
                              <input
                                type="text"
                                name="age"
                                placeholder="Age"
                                className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                                value={age}
                                onChange={(e) => {
                                  checkAge(e.target.value);
                                  setAge(e.target.value);
                                }}
                                required
                              />
                            </div>
                            {age !== "" && isInvAge && (
                              <Alert
                                severity="error"
                                className="form_sucess_alert"
                              >
                                Invalid Age
                              </Alert>
                            )}
                          </div>
                        )}

                        <div className="relative mb-5">
                          <label className="text-blue-1">Gender</label>
                          <div className="mt-[10px]">
                            <input
                              type="radio"
                              name="gender"
                              id="male"
                              className="appearance-none my-0 mx-[5px] w-[1.2em] h-[1.2em] bg-blue-1 content-none cursor-pointer outline-none rounded-[15px] -top-[2px] -left-[1px] relative inline-block visible border-[4px] border-blue-1 checked:bg-blue-8"
                              value="male"
                              checked={gender === "male"}
                              onChange={(e) => setGender(e.target.value)}
                            />{" "}
                            <label
                              htmlFor="male"
                              className="cursor-pointer text-white-1 mr-4"
                            >
                              Male
                            </label>
                            <input
                              type="radio"
                              name="gender"
                              id="female"
                              className="appearance-none my-0 mx-[5px] w-[1.2em] h-[1.2em] bg-blue-1 content-none cursor-pointer outline-none rounded-[15px] -top-[2px] -left-[1px] relative inline-block visible border-[4px] border-blue-1 checked:bg-blue-8"
                              value="female"
                              checked={gender === "female"}
                              onChange={(e) => setGender(e.target.value)}
                            />{" "}
                            <label
                              htmlFor="female"
                              className="cursor-pointer text-white-1 mr-4"
                            >
                              Female
                            </label>
                            <input
                              type="radio"
                              name="gender"
                              id="other"
                              className="appearance-none my-0 mx-[5px] w-[1.2em] h-[1.2em] bg-blue-1 content-none cursor-pointer outline-none rounded-[15px] -top-[2px] -left-[1px] relative inline-block visible border-[4px] border-blue-1 checked:bg-blue-8"
                              value="other"
                              checked={gender === "other"}
                              onChange={(e) => setGender(e.target.value)}
                            />{" "}
                            <label
                              htmlFor="other"
                              className="cursor-pointer text-white-1 mr-4"
                            >
                              Other
                            </label>
                          </div>
                        </div>

                        <div className="relative mb-4">
                          <FaPhoneAlt
                            className="absolute left-3 top-[15px] text-white-1"
                            size={15}
                          />
                          <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                            value={phone}
                            onChange={(e) => {
                              validatePhoneNumber(e.target.value);
                              setPhone(e.target.value);
                            }}
                            required
                          />
                        </div>
                        {phone !== "" && isInvPhone && (
                          <Alert severity="error" className="input_alert">
                            Invalid Phone Number
                          </Alert>
                        )}
                      </>
                    )}
                  </>
                )}

                {!isGoogleAuth && (
                  <>
                    <div>
                      <div className="relative mb-4">
                        <MdEmail
                          className="absolute left-3 top-[15px] text-white-1"
                          size={18}
                        />
                        <input
                          type="text"
                          name="email"
                          placeholder="Email"
                          className="py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                          value={email}
                          onChange={(e) => {
                            checkEmail(e.target.value);
                            setEmail(e.target.value);
                          }}
                          required
                        />
                      </div>
                      {email !== "" && isInvEmail && (
                        <Alert severity="error" className="input_alert">
                          Invalid Email
                        </Alert>
                      )}
                    </div>

                    {!isForgotPassword && (
                      <div>
                        <div className="relative mb-4">
                          <FaLock
                            className="absolute left-3 top-[15px] text-white-1 transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                            size={16}
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="appearance-none py-3 px-3 pl-10 text-white-1 peer-disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1 placeholder:text-white-1 placeholder:text-opacity-50"
                            value={passwd}
                            onChange={(e) => {
                              checkPasswd(e.target.value);
                              setPasswd(e.target.value);
                            }}
                            required
                            autoComplete=""
                          />
                          <span
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-[15px] cursor-pointer transition-transform duration-500 hover:scale-125"
                          >
                            {showPassword ? (
                              <IoEyeOffOutline
                                className="absolute right-3 top-[15px] cursor-pointer"
                                size={18}
                              />
                            ) : (
                              <IoEyeOutline
                                className="text-white-1"
                                size={18}
                              />
                            )}
                          </span>
                        </div>

                        {isSignupVisible && passwd !== "" && isInvPass && (
                          <Alert severity="warning" className="input_alert">
                            Password should contain at least 6 characters
                          </Alert>
                        )}
                      </div>
                    )}

                    {!isSignupVisible && !isForgotPassword && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-blue-1 text-sm hover:underline text-left outline-none border-none"
                      >
                        Forgot Password?
                      </button>
                    )}

                    {isForgotPassword && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-blue-1 text-sm hover:underline text-left outline-none border-none"
                      >
                        Back to Login
                      </button>
                    )}
                  </>
                )}

                {ismedicareAuth && (
                  <button
                    type="submit"
                    className="mt-[0.8rem] mb-[0.4rem] bg-blue-7 hover:bg-blue-6 disabled:bg-blue-7 disabled:cursor-not-allowed py-[0.8rem] px-6 rounded-[3px] transition-colors duration-200 ease-out text-blue-1 w-full"
                    disabled={
                      // Disable the button in the following cases:
                      // - If "Forgot Password" is active and the email is invalid, but only if Google Auth is not used
                      (!isGoogleAuth && isForgotPassword && isInvEmail) || // Disable if Forgot Password and email is invalid, unless Google Auth
                      (isSignupVisible &&
                        (isInvAge || isInvEmail || isInvPass)) || // Disable if Sign Up and any input is invalid
                      (!isForgotPassword &&
                        !isSignupVisible &&
                        (isInvEmail || isInvPass)) // Disable if Login and email or password is invalid
                    }
                  >
                    {isSuccessLoading ? (
                      <CircularProgress size={24} />
                    ) : isForgotPassword ? (
                      "Send Reset Link"
                    ) : isSignupVisible ? (
                      "Sign Up"
                    ) : (
                      "Login"
                    )}
                  </button>
                )}

                {isGoogleAuth && (
                  <>
                    <button
                      type="submit"
                      className="mt-[0.8rem] mb-[0.4rem] w-full flex justify-center items-center bg-white-1 dark:bg-gray-900 rounded-[3px] px-6 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-200"
                    >
                      <img
                        src="https://img.icons8.com/fluency/48/google-logo.png"
                        alt="google-logo"
                        className="max-h-[25px] mr-2"
                      />
                      <span>
                        {isSignupVisible ? "Sign Up" : "Login"} with Google
                      </span>
                    </button>
                  </>
                )}
              </div>

              {!isForgotPassword && (
                <div className="mt-12 w-full">
                  <div className="mb-8">
                    <div className="border-t-[2px] border-blue-1 w-full h-2"></div>
                    <div className="relative flex justify-center">
                      <span class="absolute -top-4 text-center text-sm text-blue-1 bg-blue-3 px-4">
                        {isSignupVisible ? "Sign Up using" : "Sign In using"}
                      </span>
                    </div>
                  </div>
                  <div class="rounded-md px-2 relative">
                    <div class="flex items-center justify-center gap-x-6">
                      <div class="relative flex h-[40px] w-[40px] items-center justify-center">
                        <input
                          type="radio"
                          id="medicareAuth"
                          name="authMethod"
                          value="medicareAuth"
                          class="peer z-10 h-full w-full opacity-0"
                          onChange={() => handleAuthApp(0)}
                          checked={ismedicareAuth}
                        />
                        <label
                          htmlFor="medicareAuth"
                          className="absolute top-0 left-0 cursor-pointer peer-checked:translate peer-checked:scale-[1.1] peer-checked:bg-white-1 peer-checked:border-[3px] border-white-1 rounded-full peer-checked:p-[0.4rem] p-[0.3rem] flex justify-center items-center peer-checked:shadow-blue-7 peer-checked:shadow-[0px_2px_4px_#282f42,_inset_0px_0px_7px_#282f42]"
                        >
                          <img
                            src={heartRateLogo}
                            alt="medicare-logo"
                            className={`z-50 relative left-[0.39px] ${
                              ismedicareAuth
                                ? "top-[1.5px]"
                                : "top-[0.27px]"
                            }`}
                          />
                        </label>
                      </div>
                      <div class="relative flex h-[41px] w-[41px] items-center justify-center">
                        <input
                          type="radio"
                          id="GoogleAuth"
                          name="authMethod"
                          value="GoogleAuth"
                          class="peer z-10 h-full w-full opacity-0"
                          onChange={() => handleAuthApp(1)}
                          checked={isGoogleAuth}
                        />
                        <label
                          htmlFor="GoogleAuth"
                          className="peer-checked:border-[3px] peer-checked:border-white-1 absolute z-50 top-0 left-0 cursor-pointer peer-checked:bg-white-1 rounded-full peer-checked:p-[0.35rem] p-[0.3rem] peer-checked:shadow-[0px_2px_4px_#282f42,_inset_0px_0px_7px_#282f42]"
                        >
                          <img
                            src="https://img.icons8.com/fluency/48/google-logo.png"
                            alt="google-logo"
                            className="z-50 w-full h-full"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/*===== Form-Close-Btn =====*/}
              <div
                className="bg-[rgba(176,187,216,0.5)] text-white-1 absolute top-0 right-0 w-[30px] h-[30px] text-[1.8rem] leading-[30px] text-center cursor-pointer overflow-hidden opacity-80 transition-opacity duration-200 hover:opacity-100"
                title="Close"
                onClick={() => toggleForm(false)}
              >
                &times;
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountForm;
