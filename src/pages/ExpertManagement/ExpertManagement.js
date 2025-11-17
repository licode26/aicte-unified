import React, { useState, useEffect } from "react";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Header from "../../components/Header";
import SubHead from "../../components/SubHead";
import { FaPlus, FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaBriefcase } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import "../../styles/ExpertManagement.css";

const ExpertManagement = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    domain: '',
    experience: '',
    qualification: '',
    organization: '',
    designation: '',
    bio: '',
    status: 'Active'
  });

  const domains = [
    'Computer Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Artificial Intelligence',
    'Data Science',
    'Cybersecurity',
    'Robotics',
    'IoT',
    'Blockchain',
    'Cloud Computing',
    'Software Engineering'
  ];

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/domainExperts/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expertsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setExperts(expertsArray);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast.error('Failed to fetch experts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.specialization || !formData.domain) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const expertId = editingExpert ? editingExpert.id : push(dbref(database, '/domainExperts/')).key;
      
      await update(dbref(database, `/domainExperts/${expertId}`), {
        ...formData,
        id: expertId,
        createdAt: editingExpert ? editingExpert.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(editingExpert ? 'Expert updated successfully!' : 'Expert added successfully!');
      setModalIsOpen(false);
      setEditingExpert(null);
      resetForm();
      fetchExperts();
    } catch (error) {
      console.error('Error saving expert:', error);
      toast.error('Failed to save expert');
    }
  };

  const handleEdit = (expert) => {
    setEditingExpert(expert);
    setFormData({
      name: expert.name || '',
      email: expert.email || '',
      phone: expert.phone || '',
      specialization: expert.specialization || '',
      domain: expert.domain || '',
      experience: expert.experience || '',
      qualification: expert.qualification || '',
      organization: expert.organization || '',
      designation: expert.designation || '',
      bio: expert.bio || '',
      status: expert.status || 'Active'
    });
    setModalIsOpen(true);
  };

  const handleDelete = async (expertId) => {
    if (window.confirm('Are you sure you want to delete this expert?')) {
      try {
        await update(dbref(database, `/domainExperts/${expertId}`), null);
        toast.success('Expert deleted successfully!');
        fetchExperts();
      } catch (error) {
        console.error('Error deleting expert:', error);
        toast.error('Failed to delete expert');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      domain: '',
      experience: '',
      qualification: '',
      organization: '',
      designation: '',
      bio: '',
      status: 'Active'
    });
  };

  const openModal = () => {
    setEditingExpert(null);
    resetForm();
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingExpert(null);
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
    <div className="expert-management">
      <Header />
      <SubHead title="Expert Management" btnFunc={openModal} />
      
      <div className="experts-container">
        <div className="experts-grid">
          {experts.map((expert) => (
            <div key={expert.id} className="expert-card">
              <div className="expert-header">
                <div className="expert-avatar">
                  <FaUser size={24} />
                </div>
                <div className="expert-basic-info">
                  <h3>{expert.name}</h3>
                  <p className="expert-designation">
                    {expert.designation} {expert.organization && `at ${expert.organization}`}
                  </p>
                  <span className={`status-badge ${expert.status?.toLowerCase()}`}>
                    {expert.status}
                  </span>
                </div>
              </div>
              
              <div className="expert-body">
                <div className="expert-details">
                  <div className="detail-row">
                    <FaEnvelope className="detail-icon" />
                    <span>{expert.email}</span>
                  </div>
                  {expert.phone && (
                    <div className="detail-row">
                      <FaPhone className="detail-icon" />
                      <span>{expert.phone}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <FaBriefcase className="detail-icon" />
                    <span>{expert.domain}</span>
                  </div>
                </div>
                
                <div className="expert-specialization">
                  <h4>Specialization</h4>
                  <p>{expert.specialization}</p>
                </div>
                
                {expert.experience && (
                  <div className="expert-experience">
                    <strong>Experience:</strong> {expert.experience} years
                  </div>
                )}
                
                {expert.bio && (
                  <div className="expert-bio">
                    <h4>Bio</h4>
                    <p>{expert.bio}</p>
                  </div>
                )}
              </div>
              
              <div className="expert-actions">
                <button
                  onClick={() => handleEdit(expert)}
                  className="action-btn edit-btn"
                  title="Edit Expert"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(expert.id)}
                  className="action-btn delete-btn"
                  title="Delete Expert"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          
          {experts.length === 0 && (
            <div className="empty-state">
              <FaUser size={48} className="empty-icon" />
              <h3>No Experts Found</h3>
              <p>Add domain experts to help students and teachers</p>
              <button onClick={openModal} className="create-first-btn">
                <FaPlus /> Add Expert
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit Expert */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="expert-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>{editingExpert ? 'Edit Expert' : 'Add New Expert'}</h2>
          <button onClick={closeModal} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="expert-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                placeholder="expert@example.com"
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
              <label>Domain *</label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Domain</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 10"
                min="0"
                max="50"
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
                <option value="Busy">Busy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="e.g., PhD in Computer Science"
              />
            </div>
            
            <div className="form-group">
              <label>Organization</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="e.g., IIT Delhi"
              />
            </div>
            
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g., Professor"
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Specialization *</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g., Machine Learning, Data Mining"
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Brief bio of the expert..."
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingExpert ? 'Update Expert' : 'Add Expert'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpertManagement;
