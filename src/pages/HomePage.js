import React from "react";
import AdminHome from "../components/AdminHome";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/init-firebase";
import SignIn from "./Authentication/SignIn";
import Register from "./Authentication/Register";
import ForgetPassword from "./Authentication/ForgetPassword";
import StudentTeacherAuth from "./Authentication/StudentTeacherAuth";
import LandingPage from "./LandingPage";
import RoleSelection from "./RoleSelection";
import StudentPortal from "./StudentPortal/StudentPortal";
import TeacherPortal from "./TeacherPortal/TeacherPortal";
import CurriculumDeveloperPortal from "./CurriculumDeveloperPortal";
import IndustryPortal from "./IndustryPortal";
import { Routes, Route } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { ToastContainer } from "react-toastify";
import logo from "../res/AICTE_logo.png";

function HomePage() {
  const currentUser = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [showLanding, setShowLanding] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState(null);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authenticatedUser, setAuthenticatedUser] = React.useState(null);

  React.useEffect(() => {
    // Only clear auth if we're not dealing with admin
    const clearAuth = async () => {
      try {
        // Check if current user is admin before clearing
        if (currentUser?.currentUser?.email !== "admin@gmail.com") {
          await signOut(auth);
        }
      } catch (error) {
        // Ignore errors, just ensure we start fresh
      }
    };

    clearAuth();

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [currentUser]);

  const handleRoleSelection = (role) => {
    console.log('Role selected:', role);

    if (role === 'role-selection') {
      setShowLanding(false);
      setSelectedRole(null);
    } else if (role === 'admin') {
      setSelectedRole(role);
      setShowLanding(false);
      setShowAuth(false);
      setAuthenticatedUser(null);
    } else if (role === 'student' || role === 'teacher' || role === 'curriculum-developer' || role === 'industry') {
      // For student, teacher, curriculum-developer, and industry, show authentication
      setSelectedRole(role);
      setShowLanding(false);
      setShowAuth(true);
      setAuthenticatedUser(null);
    }
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setSelectedRole(null);
    setShowAuth(false);
    setAuthenticatedUser(null);
  };

  const handleAuthSuccess = (user, role) => {
    console.log('Auth success:', user, role);
    setAuthenticatedUser({ user, role });
    setShowAuth(false);
  };

  const handleBackToRoleSelection = () => {
    setShowAuth(false);
    setSelectedRole(null);
    setAuthenticatedUser(null);
  };

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.currentUser && currentUser.currentUser.email === "admin@gmail.com";

  return (
    <>
      {isAdmin ? (
        <Routes>
          <Route path="/*" element={<AdminHome user={currentUser.currentUser.email} />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
        </Routes>
      ) : (
        <div className="min-h-screen">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
              }}
            >
              <HashLoader
                className="darkMode"
                size={36}
                margin={2}
                loading={loading}
              />
            </div>
          ) : showLanding ? (
            <LandingPage onRoleSelect={handleRoleSelection} />
          ) : showAuth ? (
            <StudentTeacherAuth
              role={selectedRole}
              onBack={handleBackToRoleSelection}
              onSuccess={handleAuthSuccess}
            />
          ) : selectedRole === 'admin' ? (
            <div className="flex flex-col justify-center items-center min-h-screen">
              <img className="h-28 mt-2 mx-auto w-28" src={logo} alt="Logo" />
              <Routes>
                <Route path="*" element={<SignIn />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgetpassword" element={<ForgetPassword />} />
              </Routes>
              <button
                onClick={handleBackToLanding}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Back to Home
              </button>
            </div>
          ) : authenticatedUser && selectedRole === 'student' ? (
            <StudentPortal onBack={handleBackToLanding} user={authenticatedUser} />
          ) : authenticatedUser && selectedRole === 'teacher' ? (
            <TeacherPortal onBack={handleBackToLanding} user={authenticatedUser} />
          ) : authenticatedUser && selectedRole === 'curriculum-developer' ? (
            <CurriculumDeveloperPortal onBack={handleBackToLanding} user={authenticatedUser} />
          ) : authenticatedUser && selectedRole === 'industry' ? (
            <IndustryPortal onBack={handleBackToLanding} user={authenticatedUser} />
          ) : (
            <RoleSelection onRoleSelect={handleRoleSelection} onBack={handleBackToLanding} />
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default HomePage;
