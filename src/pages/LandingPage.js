import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import "../styles/LandingPage.css";

const LandingPage = ({ onRoleSelect }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      title: "AICTE UNIFIED",
      subtitle: "Curriculum Portal",
      description: "Centralized platform for curriculum design, review, and collaboration",
      tags: ["Collaborative", "Transparent", "Scalable"],
      gradient: "from-blue-600 to-purple-700"
    },
    {
      title: "SMART EDUCATION",
      subtitle: "Future Ready",
      description: "Empowering technical education with modern curriculum standards",
      tags: ["Innovation", "Quality", "Excellence"],
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "DIGITAL INDIA",
      subtitle: "Education 4.0",
      description: "Building tomorrow's workforce through structured learning",
      tags: ["Digital", "Modern", "Progressive"],
      gradient: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleGetStarted = () => {
    onRoleSelect('role-selection');
  };

  return (
    <div className="landing-container">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`floating-shape shape-${i + 1}`}
              style={{
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="logo-container">
            <img 
              src="/logo.png" 
              alt="AICTE Logo" 
              className="w-20 h-20 mx-auto mb-4 animate-pulse"
            />
          </div>
        </div>

        {/* Sliding Cards Container */}
        <div className="card-container">
          <div className={`slide-card ${isAnimating ? 'slide-out' : 'slide-in'}`}>
            <div className={`card-gradient bg-gradient-to-br ${slides[currentSlide].gradient}`}>
              <div className="card-content">
                <h1 className="main-title">
                  {slides[currentSlide].title}
                </h1>
                <h2 className="subtitle">
                  {slides[currentSlide].subtitle}
                </h2>
                <p className="description">
                  {slides[currentSlide].description}
                </p>
                
                {/* Tags */}
                <div className="tags-container">
                  {slides[currentSlide].tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <div className="get-started-section">
          <button
            onClick={handleGetStarted}
            className="get-started-btn"
          >
            <span>Get Started</span>
            <FaChevronDown className="ml-2 animate-bounce" />
          </button>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <div className="feature-item">
            <div className="feature-icon">📚</div>
            <span>Curriculum Design</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👥</div>
            <span>Collaboration</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <span>Analytics</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✅</div>
            <span>Approval Workflow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
