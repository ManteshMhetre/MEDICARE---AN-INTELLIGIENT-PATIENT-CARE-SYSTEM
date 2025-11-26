import React, { useState, useContext, useRef } from "react";
import commonContext from "../../contexts/common/commonContext";
import useOutsideClose from "../../hooks/useOutsideClose";
import useScrollDisable from "../../hooks/useScrollDisable";
import { Alert, CircularProgress } from "@mui/material";
import httpClient from "../../httpClient";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import doctorMale from "../../assets/doctor-male.png";
import doctorFemale from "../../assets/doctor-female.png";
import patientMale from "../../assets/patient-male.png";
import patientFemale from "../../assets/patient-female.png";

const Profile = () => {
  const { isProfileOpen, toggleProfile, setFormUserInfo } =
    useContext(commonContext);
  const [username, setUsername] = useState(
    localStorage.getItem("username") ?? ""
  );
  const [age, setAge] = useState(localStorage.getItem("age") ?? "");
  const [gender, setGender] = useState(localStorage.getItem("gender") ?? "");
  const [phone, setPhone] = useState(localStorage.getItem("phone") ?? "");
  const [specialization, setSpecialization] = useState(
    localStorage.getItem("specialization") ?? ""
  );
  const [doctorId, setDoctorId] = useState(localStorage.getItem("doctorId") ?? "");
  const [fee, setFee] = useState(localStorage.getItem("fee") ?? 199);
  const email = localStorage.getItem("email") ?? "";
  const [isChPasswd, setChPasswd] = useState(false);
  const [passwd, setPasswd] = useState("");
  const [isInvPass, setIsInvPass] = useState(false);
  const [isInvAge, setIsInvAge] = useState(false);
  const [isAlert, setIsAlert] = useState("");
  const [alertCont, setAlertCont] = useState("");
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const isDoctor = localStorage.getItem("usertype") === "doctor";

  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profile_picture") ?? null
  );
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const profileRef = useRef();

  useOutsideClose(profileRef, () => {
    toggleProfile(false);
    setUsername(localStorage.getItem("username") ?? "");
    setAge(localStorage.getItem("age") ?? "");
    setGender(localStorage.getItem("gender") ?? "");
    setPhone(localStorage.getItem("phone") ?? "");
    setSpecialization(localStorage.getItem("specialization") ?? "");
    setFee(localStorage.getItem("fee") ?? 0);
    setPasswd("");
    setDoctorId(localStorage.getItem("doctorId") ?? "");
    setPasswd("");
    setProfilePic(localStorage.getItem("profile_picture") ?? null);
    setProfilePicFile(null);
  });

  useScrollDisable(isProfileOpen);

  // Default profile picture based on usertype and gender
  const getDefaultprofile_picture = () => {
    if (isDoctor) {
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
  const removeprofile_picture = () => {
    setProfilePic(null);
  };

  const checkAge = (a) => {
    const valid =
      parseInt(a) > 0 && parseInt(a) <= 120 && /^[0-9]{1,3}$/.test(a);
    setIsInvAge(!valid);
    return valid;
  };

  const checkPasswd = (passwd) => {
    const valid = /^.{6,}$/.test(passwd);
    setIsInvPass(!valid);
    return valid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isInvAge || (isChPasswd && isInvPass)) {
      return;
    }

    setIsSuccessLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);
    formData.append("usertype", isDoctor ? "doctor" : "patient");
    formData.append("age", age);
    formData.append("specialization", specialization);
    formData.append("gender", gender);
    formData.append("phone", phone);
    if (isChPasswd) {
      formData.append("passwd", passwd);
    }
    formData.append("fee", fee);
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

    const res = await httpClient.put("/update_details", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (res) {
      setIsSuccessLoading(false);
      setIsAlert("success");
      setAlertCont("Successfully updated");
      setTimeout(() => {
        setIsAlert("");
        setAlertCont("");
        setFormUserInfo({
          username,
          usertype: isDoctor ? "doctor" : "patient",
          gender,
          phone,
          email,
          passwd: passwd ?? localStorage.getItem("passwd"),
          specialization,
          doctorId,
          age,
          fee,
          profile_picture: res.data.profile_picture,
        });
        toggleProfile(false);
      }, 1500);
    } else {
      setIsSuccessLoading(false);
      setIsAlert("error");
      setAlertCont("Something went wrong. Please try again later");
      setTimeout(() => {
        setIsAlert("");
        setAlertCont("");
      }, 1000);
    }
  };

  const renderAlert = () => {
    return (
      isAlert && (
        <Alert severity={isAlert} className="form_sucess_alert">
          {alertCont}
        </Alert>
      )
    );
  };

  return (
    <>
      {isProfileOpen && (
        <div className="relative">
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black-1/50 pointer-events-none">
            <form
              id=""
              className="relative bg-blue-3 text-blue-8 max-w-[450px] max-h-[90vh] overflow-y-auto scrollbar-none w-full p-12 rounded-[3px] z-[99] max-xs:px-4 max-xs:py-8 mx-4 pointer-events-auto"
              ref={profileRef}
              onSubmit={handleFormSubmit}
            >
              {renderAlert()}

              {/*===== Form-Header =====*/}
              <div className="text-white-1">
                <h2 className="mb-[0.6rem]">Profile</h2>
                <p>Check your profile</p>
              </div>

              {/*===== Form-Body =====*/}
              <div className="mt-10">
                <div className="relative mb-5">
                  <div
                    className="flex justify-center rounded-full relative w-[45%] aspect-square mx-auto bg-white-1 shadow-[0_0_5px_1px_#282f42] border-[2px] border-blue-3"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-3 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={profilePic || getDefaultprofile_picture()} // Show uploaded image or default
                      alt="Profile"
                      className="w-full h-full rounded-full"
                      onLoad={() => setIsImageLoading(false)}
                    />

                    {/* Show delete icon on hover only if the user has uploaded a picture */}
                    {profilePic && isHovered && (
                      <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md cursor-pointer border-2 border-red-500"
                        onClick={removeprofile_picture}
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
                <div className="relative mb-4">
                  <input
                    type="text"
                    name="username"
                    className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                    Username
                  </label>
                </div>

                {isDoctor && (
                  <>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        name="specialization"
                        className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                      />
                      <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                        Specialization {"(Eg. Cancer Surgeon)"}
                      </label>
                    </div>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        name="ID"
                        className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        required
                      />
                      <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                        Doctor Id 
                      </label>
                    </div>
                  </>
                )}

                {!isDoctor && (
                  <div>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        name="age"
                        className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                        value={age}
                        onChange={(e) => {
                          checkAge(e.target.value);
                          setAge(e.target.value);
                        }}
                        required
                      />
                      <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                        Age
                      </label>
                    </div>
                    {age !== "" && isInvAge && (
                      <Alert severity="error" className="form_sucess_alert">
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
                  <input
                    type="text"
                    name="phone"
                    className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                    Phone
                  </label>
                </div>

                {isDoctor && (
                  <div className="relative mb-4">
                    <input
                      type="number"
                      name="fee"
                      className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      min={1}
                      required
                    />
                    <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                      Fee
                    </label>
                  </div>
                )}
                <div>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      name="email"
                      className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                      value={email}
                      disabled
                    />
                    <label className=" peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                      Email
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-start items-center">
                    <input
                      type="checkbox"
                      name="passcheck"
                      id="passcheck"
                      className="mr-[10px] cursor-pointer"
                      checked={isChPasswd}
                      onChange={() => setChPasswd((prev) => !prev)}
                    />
                    <label
                      htmlFor="passcheck"
                      className="cursor-pointer text-white-1"
                    >
                      {" "}
                      Wanna change password?
                    </label>
                  </div>
                </div>

                {isChPasswd && (
                  <div>
                    <div className="relative mb-4">
                      <input
                        type="password"
                        name="password"
                        className="py-3 px-3 text-white-1 peer disabled:cursor-not-allowed border-[1px] border-blue-1 w-full outline-none rounded-[3px] focus:border-[2px] focus:border-blue-1"
                        value={passwd}
                        onChange={(e) => {
                          checkPasswd(e.target.value);
                          setPasswd(e.target.value);
                        }}
                        required
                        autoComplete=""
                      />
                      <label className="peer-disabled:transform peer-disabled:scale-[0.85] peer-disabled:text-blue-1 absolute -top-[10px] left-[10px] bg-blue-3 text-blue-1 px-[5px] text-sm">
                        Update Password
                      </label>
                    </div>
                    {passwd !== "" && isInvPass && (
                      <Alert severity="warning" className="m-0">
                        Password should contain atleast 6 characters
                      </Alert>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-[0.8rem] mb-[0.4rem] relative bg-blue-7 hover:bg-blue-6 disabled:bg-blue-7 disabled:cursor-not-allowed py-[0.8rem] px-6 rounded-[3px] transition-colors duration-200 ease-out text-blue-1 w-full"
                  disabled={isInvAge || isInvPass}
                >
                  {isSuccessLoading ? (
                    <CircularProgress size={24} sx={{ color: "#f5f5f5" }} />
                  ) : (
                    "Update"
                  )}
                </button>
              </div>

              {/*===== Form-Close-Btn =====*/}
              <div
                className="bg-[rgba(176,187,216,0.5)] text-white-1 absolute top-0 right-0 w-[30px] h-[30px] text-[1.8rem] leading-[30px] text-center cursor-pointer overflow-hidden opacity-80 transition-opacity duration-200 hover:opacity-100"
                title="Close"
                onClick={() => toggleProfile(false)}
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

export default Profile;
