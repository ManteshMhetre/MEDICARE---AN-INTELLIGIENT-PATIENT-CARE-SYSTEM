import React from "react";
import { Link } from "react-router-dom";
import img from "../assets/aboutus.jpg";

const AboutUs = () => {
  const projectAdmins = [
    {
      name: "Pratik Mane",
      role: "Web Developer",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSle5CxW6QjBz4FH6p5szdloz2gPoQLJ8Outg&s",
    },
    {
      name: "Mantesh Mhetre",
      role: "AI/ML Developer",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSle5CxW6QjBz4FH6p5szdloz2gPoQLJ8Outg&s",
    },
  ];

  const pandemicFeatures = [
    {
      title: "Predictive Analytics",
      description:
        "AI and ML analyze patient data to predict potential health issues before they become critical, enabling early intervention.",
      icon: "📊",
    },
    {
      title: "Personalized Care Plans",
      description:
        "These technologies help create customized care plans based on individual patient data, improving the effectiveness of treatments.",
      icon: "📈",
    },
    {
      title: "Remote Monitoring",
      description:
        "AI-powered devices can monitor patients' vital signs in real-time, alerting caregivers to anomalies and reducing hospital visits.",
      icon: "🚑",
    },
    {
      title: "Timely Interventions",
      description:
        "By continuously analyzing data, AI and ML can identify patterns and trigger timely interventions, preventing complications.",
      icon: "⏱️",
    },
    {
      title: "Remote Consultations",
      description:
        "Secure video conferencing and chat features provide quality care while maintaining social distancing. Connect with specialists worldwide.",
      icon: "🏥",
    },
    {
      title: "AI Powered Chatbot",
      description:
        "Advanced AI-powered system for early detection of COVID-19 and other health conditions using machine learning algorithms.",
      icon: "🤖",
    },
  ];

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-5/12 space-y-8 z-10 lg:pr-8">
              <div>
                <span className="inline-block px-4 py-1 md:ml-12 text-lg font-medium bg-blue-600 text-white rounded-full mb-4">
                  MediCare
                </span>
                <h1 className="text-2xl md:text-xl font-bold text-gray-900 mb-6 leading-tight md:ml-12">
                  A healthcare platform for doctors & patients. We are committed
                  to transforming healthcare through cutting-edge AI and machine
                  learning solutions. Our mission is to enhance patient care by
                  leveraging advanced technologies to provide predictive
                  insights, personalized treatment plans, and real-time health
                  monitoring.
                </h1>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 text-sm md:ml-12">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center lg:w-7/12 relative">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/20 rounded-full blur-3xl"
                style={{ mixBlendMode: "multiply" }}
              />
              <div className="relative">
                <img
                  src={img}
                  alt="Platform Preview"
                  className="w-full h-auto max-w-[450px] object-contain items-end"
                  style={{
                    mixBlendMode: "multiply",
                    filter: "contrast(1.1)",
                    transform: "scale(1.15)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Infrastructure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {pandemicFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">We are Team VedaVerse</h2>
            <p className="text-xl text-gray-600">
              Driving innovation in healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 justify-center">
            {projectAdmins.map((admin) => (
              <div
                key={admin.name}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-center">
                  <div className="w-full aspect-square max-w-[200px] mx-auto mb-6">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-full h-full rounded-2xl object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{admin.name}</h3>
                  <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    {admin.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
