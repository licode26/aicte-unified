import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref as dbref, update, get, child } from "firebase/database";
import { auth, database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import "../../styles/StudentTeacherAuth.css";

const StudentTeacherAuth = ({ role, onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    institution: '',
    department: '',
    studentId: '', // For students
    employeeId: '', // For teachers
    companyId: '', // For industry
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkEmailUniqueness = async (email, currentRole) => {
    try {
      const db = dbref(database);
      const usersSnapshot = await get(child(db, '/users/'));

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        for (const [, userData] of Object.entries(users)) {
          if (userData.email === email && userData.role !== currentRole) {
            return `This email is already registered as a ${userData.role}. Each email can only be associated with one role.`;
          }
        }
      }
      return null; // Email is unique for this role
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      return 'Error checking email uniqueness. Please try again.';
    }
  };

  const validateForm = async () => {
    if (isLogin) {
      // Login validation
      if (role === 'industry') {
        if (!formData.companyId || !formData.password) {
          toast.error('Company ID and password are required');
          return false;
        }
      } else if (role === 'curriculum-developer') {
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required');
          return false;
        }
      } else {
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required');
          return false;
        }
      }
    } else {
      // Registration validation - only for non-industry and non-curriculum-developer roles
      if (!formData.email || !formData.password) {
        toast.error('Email and password are required');
        return false;
      }

      if (!formData.fullName || !formData.institution) {
        toast.error('Please fill in all required fields');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }

      if (role === 'student' && !formData.studentId) {
        toast.error('Student ID is required');
        return false;
      }

      if (role === 'teacher' && !formData.employeeId) {
        toast.error('Employee ID is required');
        return false;
      }

      // Check email uniqueness across roles
      const emailCheckResult = await checkEmailUniqueness(formData.email, role);
      if (emailCheckResult) {
        toast.error(emailCheckResult);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (role === 'industry') {
          // For industry, check against industries collection
          const db = dbref(database);
          const industriesSnapshot = await get(child(db, '/industries/'));
          let industryUser = null;

          if (industriesSnapshot.exists()) {
            const industries = industriesSnapshot.val();
            console.log('Available industries:', industries); // Debug log
            console.log('Login attempt:', { companyId: formData.companyId, password: formData.password }); // Debug log

            for (const [key, industry] of Object.entries(industries)) {
              console.log('Checking industry:', key, industry); // Debug log
              if (industry.companyId === formData.companyId &&
                  industry.password === formData.password &&
                  industry.status === 'Active') {
                industryUser = { ...industry, uid: key };
                console.log('Match found:', industryUser); // Debug log
                break;
              }
            }
          }

          if (!industryUser) {
            console.log('No matching industry user found'); // Debug log
            toast.error('Invalid company ID or password, or account is inactive');
            return;
          }

          // Create a mock user object for industry
          const user = {
            uid: industryUser.uid,
            email: industryUser.email,
            displayName: industryUser.companyName
          };

          toast.success('Login successful!');
          onSuccess(user, role);
        } else if (role === 'curriculum-developer') {
          // For curriculum-developer, check against curriculum-developers collection
          const db = dbref(database);
          const developersSnapshot = await get(child(db, '/curriculum-developers/'));
          let developerUser = null;

          if (developersSnapshot.exists()) {
            const developers = developersSnapshot.val();
            console.log('Available curriculum developers:', developers); // Debug log
            console.log('Login attempt:', { email: formData.email, password: formData.password }); // Debug log

            for (const [key, developer] of Object.entries(developers)) {
              console.log('Checking developer:', key, developer); // Debug log
              if (developer.email === formData.email &&
                  developer.password === formData.password &&
                  developer.status === 'Active') {
                developerUser = { ...developer, uid: key };
                console.log('Match found:', developerUser); // Debug log
                break;
              }
            }
          }

          if (!developerUser) {
            console.log('No matching curriculum developer found'); // Debug log
            toast.error('Invalid email or password, or account is inactive');
            return;
          }

          // Create a mock user object for curriculum-developer (consistent with other roles)
          const user = {
            user: {
              uid: developerUser.uid,
              email: developerUser.email,
              displayName: developerUser.fullName
            },
            role: 'curriculum-developer'
          };

          toast.success('Login successful!');
          onSuccess(user, role);
        } else {
          // Regular Firebase auth for students, teachers
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const user = userCredential.user;

          // Check if user has the correct role
          // You might want to fetch user profile from database to verify role
          toast.success('Login successful!');
          onSuccess(user, role);
        }
      } else {
        // Registration - only for non-industry and non-curriculum-developer roles
        if (role === 'industry' || role === 'curriculum-developer') {
          toast.error(`${role === 'industry' ? 'Industry' : 'Curriculum Developer'} accounts cannot be registered through this form. Please contact your administrator.`);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Create user profile in database
        const userProfile = {
          uid: user.uid,
          email: formData.email,
          fullName: formData.fullName,
          role: role,
          institution: formData.institution,
          department: formData.department,
          phone: formData.phone,
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        if (role === 'student') {
          userProfile.studentId = formData.studentId;
        } else if (role === 'teacher') {
          userProfile.employeeId = formData.employeeId;
        }

        await update(dbref(database, `/users/${user.uid}`), userProfile);

        toast.success('Registration successful!');
        onSuccess(user, role);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('Email is already registered');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address');
          break;
        default:
          toast.error('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      institution: '',
      department: '',
      studentId: '',
      employeeId: '',
      companyId: '',
      phone: ''
    });
  };

  const toggleMode = () => {
    if (role !== 'industry' && role !== 'curriculum-developer') {
      setIsLogin(!isLogin);
      resetForm();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shapes">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`auth-shape shape-${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="auth-content">
        <button onClick={onBack} className="back-button">
          <FaArrowLeft /> Back
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <div className="role-icon">
              <FaUser size={32} />
            </div>
            <h1>Sign In</h1>
            <p>
              Welcome back! Access your {role === 'industry' ? 'industry' : role} portal
            </p>

            {/* Quick toggle buttons - Hide for industry and curriculum-developer roles */}
            {role !== 'industry' && role !== 'curriculum-developer' && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  style={{
                    background: isLogin ? '#667eea' : 'transparent',
                    color: isLogin ? 'white' : '#667eea',
                    border: '2px solid #667eea',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  style={{
                    background: !isLogin ? '#667eea' : 'transparent',
                    color: !isLogin ? 'white' : '#667eea',
                    border: '2px solid #667eea',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {(role === 'industry' || role === 'curriculum-developer') && !isLogin && (
              <div className="industry-notice">
                <p>{role === 'industry' ? 'Industry' : 'Curriculum Developer'} accounts are created by administrators only. Please contact your administrator to set up your account.</p>
              </div>
            )}

            {!isLogin && role !== 'industry' && role !== 'curriculum-developer' && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Institution *</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Your institution"
                      required={!isLogin}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Your department"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <div className="form-group">
                    <label>Student ID *</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder="Enter your student ID"
                      required={!isLogin}
                    />
                  </div>
                )}

                {role === 'teacher' && (
                  <div className="form-group">
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="Enter your employee ID"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
              </>
            )}

            {role === 'industry' && isLogin ? (
              <>
                <div className="form-group">
                  <label>Company ID *</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      placeholder="Enter your company ID"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!isLogin && role !== 'industry' && role !== 'curriculum-developer' && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            {role !== 'industry' && role !== 'curriculum-developer' && (
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="toggle-mode-btn"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTeacherAuth;
