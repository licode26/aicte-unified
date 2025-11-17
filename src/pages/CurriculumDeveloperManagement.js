import React, { useState, useEffect } from "react";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../firebase/init-firebase";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Header from "../components/Header";
import SubHead from "../components/SubHead";
import { FaPlus, FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import "../styles/CurriculumDeveloperManagement.css";

const CurriculumDeveloperManagement = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    department: '',
    specialization: '',
    experience: '',
    developerId: '',
    password: '',
    status: 'Active'
  });

  const specializations = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Web Development',
    'Mobile Development',
    'Database Management',
    'Network Administration',
    'Other'
  ];

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/curriculum-developers/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const developersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDevelopers(developersArray);
      }
    } catch (error) {
      console.error('Error fetching curriculum developers:', error);
      toast.error('Failed to fetch curriculum developers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.specialization || !formData.developerId || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if developerId is unique
    const existingDeveloper = developers.find(dev => dev.developerId === formData.developerId && dev.id !== editingDeveloper?.id);
    if (existingDeveloper) {
      toast.error('Developer ID already exists. Please choose a different one.');
      return;
    }

    try {
      const developerId = editingDeveloper ? editingDeveloper.id : push(dbref(database, '/curriculum-developers/')).key;

      await update(dbref(database, `/curriculum-developers/${developerId}`), {
        ...formData,
        id: developerId,
        createdAt: editingDeveloper ? editingDeveloper.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(editingDeveloper ? 'Curriculum developer updated successfully!' : 'Curriculum developer added successfully!');
      setModalIsOpen(false);
      setEditingDeveloper(null);
      resetForm();
      fetchDevelopers();
    } catch (error) {
      console.error('Error saving curriculum developer:', error);
      toast.error('Failed to save curriculum developer');
    }
  };

  const handleEdit = (developer) => {
    setEditingDeveloper(developer);
    setFormData({
      fullName: developer.fullName || '',
      email: developer.email || '',
      phone: developer.phone || '',
      institution: developer.institution || '',
      department: developer.department || '',
      specialization: developer.specialization || '',
      experience: developer.experience || '',
      developerId: developer.developerId || '',
      password: developer.password || '',
      status: developer.status || 'Active'
    });
    setModalIsOpen(true);
  };

  const handleDelete = async (developerId) => {
    if (window.confirm('Are you sure you want to delete this curriculum developer? This will prevent them from logging in.')) {
      try {
        await update(dbref(database, `/curriculum-developers/${developerId}`), null);
        toast.success('Curriculum developer deleted successfully!');
        fetchDevelopers();
      } catch (error) {
        console.error('Error deleting curriculum developer:', error);
        toast.error('Failed to delete curriculum developer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      institution: '',
      department: '',
      specialization: '',
      experience: '',
      developerId: '',
      password: '',
      status: 'Active'
    });
  };

  const openModal = () => {
    setEditingDeveloper(null);
    resetForm();
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingDeveloper(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader size={50} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="curriculum-developer-management">
      <Header />
      <SubHead title="Curriculum Developer Management" btnFunc={openModal} />

      <div className="developers-container">
        <div className="developers-grid">
          {developers.map((developer) => (
            <div key={developer.id} className="developer-card">
              <div className="developer-header">
                <div className="developer-avatar">
                  <FaUser size={24} />
                </div>
                <div className="developer-basic-info">
                  <h3>{developer.fullName}</h3>
                  <p className="developer-specialization">{developer.specialization}</p>
                  <span className={`status-badge ${developer.status?.toLowerCase()}`}>
                    {developer.status}
                  </span>
                </div>
              </div>

              <div className="developer-body">
                <div className="developer-details">
                  <div className="detail-row">
                    <FaEnvelope className="detail-icon" />
                    <span>{developer.email}</span>
                  </div>
                  {developer.phone && (
                    <div className="detail-row">
                      <FaPhone className="detail-icon" />
                      <span>{developer.phone}</span>
                    </div>
                  )}
                  {developer.institution && (
                    <div className="detail-row">
                      <FaBuilding className="detail-icon" />
                      <span>{developer.institution}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <FaUser className="detail-icon" />
                    <span>Developer ID: {developer.developerId}</span>
                  </div>
                </div>

                {developer.experience && (
                  <div className="developer-experience">
                    <strong>Experience:</strong> {developer.experience}
                  </div>
                )}

                {developer.department && (
                  <div className="developer-department">
                    <strong>Department:</strong> {developer.department}
                  </div>
                )}
              </div>

              <div className="developer-actions">
                <button
                  onClick={() => handleEdit(developer)}
                  className="action-btn edit-btn"
                  title="Edit Developer"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(developer.id)}
                  className="action-btn delete-btn"
                  title="Delete Developer"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {developers.length === 0 && (
            <div className="empty-state">
              <FaUser size={48} className="empty-icon" />
              <h3>No Curriculum Developers Found</h3>
              <p>Add curriculum developers to enable curriculum development and management</p>
              <button onClick={openModal} className="create-first-btn">
                <FaPlus /> Add Curriculum Developer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit Curriculum Developer */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="developer-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>{editingDeveloper ? 'Edit Curriculum Developer' : 'Add New Curriculum Developer'}</h2>
          <button onClick={closeModal} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="developer-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g., Dr. John Smith"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="developer@university.edu"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Specialization *</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Institution</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="e.g., XYZ University"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Developer ID *</label>
              <input
                type="text"
                name="developerId"
                value={formData.developerId}
                onChange={handleInputChange}
                placeholder="Unique developer identifier"
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Login password"
                required
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 5+ years in curriculum development"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingDeveloper ? 'Update Developer' : 'Add Developer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CurriculumDeveloperManagement;
