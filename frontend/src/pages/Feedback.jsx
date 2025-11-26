import React, { useState } from "react";
import useDocTitle from "../hooks/useDocTitle";
import Rating from "react-rating-stars-component";
import { useNavigate } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import httpClient from "../httpClient";

const Feedback = () => {
  useDocTitle("Feedback - MediCare");

  const [formData, setFormData] = useState({
    type: "",
    rating: 0,
    comments: "",
    email: "",
    username: "",
    keep_it_anonymous: false,
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const feedbackData = {
      type: formData.type,
      rating: formData.rating,
      comments: formData.comments,
      email: formData.email,
      timestamp: new Date().toISOString(),
      username: formData.username,
      keep_it_anonymous: formData.keep_it_anonymous,
    };

    try {
      const response = await httpClient.post("/website_feedback", feedbackData);

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitStatus("success");
      setFormData({
        type: "",
        rating: 0,
        comments: "",
        email: "",
        username: "",
        keep_it_anonymous: false,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
      setError("Failed to submit feedback. Please try again.");
    }
  };

  const ratingChanged = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Share Your Feedback
            </h1>
            <h2 className="text-lg md:text-xl mb-6 text-gray-600">
              Your feedback matters to us! Help us improve our services.
            </h2>
            <img
              src="https://i.pinimg.com/474x/95/6f/29/956f29bdd6ece3f6e2f7f476f65ef994.jpg"
              alt="Feedback"
              className="w-full max-w-md rounded-xl shadow-lg mx-auto"
            />
          </div>

          <div className="order-1 md:order-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 md:p-8 rounded-xl shadow-lg"
            >
              <div className="mb-6 relative">
                <label
                  htmlFor="type"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Type of Feedback
                </label>
                <div className="relative">
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 text-black-1 rounded-lg py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-5 appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="Services">Services</option>
                    <option value="Models">Models</option>
                    <option value="Products">Products</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                    <FaAngleDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="rating"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Rating
                </label>
                <Rating
                  count={5}
                  value={formData.rating}
                  onChange={ratingChanged}
                  size={32}
                  activeColor="#FFBF00"
                />
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  required
                  value={formData.rating}
                  onChange={ratingChanged}
                  className="absolute opacity-0 w-1 h-1"
                  min="1"
                  max="5"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="comments"
                  className="block text-black-1 font-semibold mb-2"
                >
                  Comments
                </label>
                <textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData({ ...formData, comments: e.target.value })
                  }
                  rows="4"
                  required
                  className="min-h-32 w-full border-2 border-blue-3 rounded-lg p-2 text-base scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-4 scrollbar-thumb-rounded-full hover:scrollbar-thumb-blue-6 focus:outline-none focus:border-blue-5 focus:border-[2.5px]"
                  placeholder="Share your thoughts..."
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="share-experience"
                    className="w-[0.9rem] h-4 cursor-pointer text-blue-5"
                    checked={formData.keep_it_anonymous}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        keep_it_anonymous: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="share-experience"
                    className="text-base cursor-pointer"
                  >
                    Keep my feedback anonymous.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full text-white-1 bg-blue-4 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-7 transition-colors duration-300"
              >
                Submit Feedback
              </button>

              {submitStatus === "error" && (
                <div className="mt-4 text-red-600">{error}</div>
              )}
            </form>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-blue-7 p-8 rounded-[3px] shadow-lg max-w-md mx-4 relative">
              <div
                className="bg-[rgba(176,187,216,0.5)] text-white-1 absolute top-0 right-0 w-[30px] h-[30px] text-[1.8rem] leading-[30px] text-center cursor-pointer overflow-hidden opacity-80 transition-opacity duration-200 hover:opacity-100"
                title="Close"
                onClick={handleClose}
              >
                &times;
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-1">
                Thank You!
              </h2>
              <p className="mb-6 text-white-1 text-opacity-50">
                Your feedback has been successfully submitted.
              </p>
              <button
                className="w-full bg-gray-400 hover:bg-blue-6 text-blue-1 py-[0.8rem] px-6 rounded-[3px] transition-colors duration-200 ease-out"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback;
