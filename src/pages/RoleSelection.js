import React, { useState } from "react";
import { FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaBook, FaIndustry, FaArrowLeft } from "react-icons/fa";
import "../styles/RoleSelection.css";

const RoleSelection = ({ onRoleSelect, onBack }) => {
  const [hoveredRole, setHoveredRole] = useState(null);

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'System Administrator',
      description: 'Manage curriculum, approve drafts, oversee the entire system',
      icon: <FaUserShield size={60} />,
      features: [
        'Approve curriculum drafts',
        'Manage user roles',
        'System analytics',
        'Content moderation'
      ],
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Learner',
      description: 'Access curriculum, view university details, track progress',
      icon: <FaUserGraduate size={60} />,
      features: [
        'View curriculum',
        'University information',
        'Expert directory',
        'Join seminars'
      ],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      subtitle: 'Educator',
      description: 'Manage profile, access teaching resources, create seminars',
      icon: <FaChalkboardTeacher size={60} />,
      features: [
        'Profile management',
        'Teaching resources',
        'Create seminars',
        'Curriculum feedback'
      ],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'curriculum-developer',
      title: 'Curriculum Developer',
      subtitle: 'Content Creator',
      description: 'Design and manage curriculum courses, plan development schedules',
      icon: <FaBook size={60} />,
      features: [
        'Curriculum design',
        'Course planning',
        'Task management',
        'Content development'
      ],
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'industry',
      title: 'Industry',
      subtitle: 'Corporate Partner',
      description: 'Create internships and organize hackathons for students',
      icon: <FaIndustry size={60} />,
      features: [
        'Create internships',
        'Organize hackathons',
        'Collaborate with universities',
        'Provide problem statements'
      ],
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handleRoleSelect = (roleId) => {
    onRoleSelect(roleId);
  };

  return (
    <div className="role-selection-container">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-cyan-100"></div>
      
      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-12">
        <button
          onClick={onBack}
          className="absolute left-8 top-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Choose Your Role
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select how you'd like to access the AICTE Unified Curriculum Portal
        </p>
      </div>

      {/* Role Cards */}
      <div className="relative z-10 flex flex-wrap justify-center gap-8 px-4 pb-12">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-card ${hoveredRole === role.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className={`role-card-inner ${role.bgColor}`}>
              {/* Icon Section */}
              <div className={`icon-section bg-gradient-to-br ${role.color}`}>
                <div className="icon-wrapper">
                  {role.icon}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="content-section">
                <h3 className="role-title">{role.title}</h3>
                <p className="role-subtitle">{role.subtitle}</p>
                <p className="role-description">{role.description}</p>

                {/* Features List */}
                <ul className="features-list">
                  {role.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-bullet">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button className={`action-btn bg-gradient-to-r ${role.color}`}>
                  {role.id === 'admin' ? 'Continue as Admin' : `Sign In as ${role.title}`}
                </button>

                {role.id !== 'admin' && (
                  <p className="auth-note">
                    🔐 Account required - Sign up or sign in to continue
                  </p>
                )}
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="hover-overlay"></div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-gray-500 text-sm">
          Don't worry, you can always switch roles later from your profile settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
