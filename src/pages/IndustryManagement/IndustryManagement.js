import React, { useState, useEffect } from "react";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Header from "../../components/Header";
import SubHead from "../../components/SubHead";
import { FaPlus, FaEdit, FaTrash, FaIndustry, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import "../../styles/IndustryManagement.css";

const IndustryManagement = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    industryType: '',
    location: '',
    website: '',
    description: '',
    companyId: '',
    password: '',
    status: 'Active'
  });

  const industryTypes = [
    'Technology',
    'Software Development',
    'Information Technology',
    'Consulting',
    'Manufacturing',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Automotive',
    'Telecommunications',
    'Energy',
    'Pharmaceuticals',
    'Media & Entertainment',
    'Other'
  ];

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/industries/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const industriesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setIndustries(industriesArray);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast.error('Failed to fetch industries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.email || !formData.industryType || !formData.companyId || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if companyId is unique
    const existingIndustry = industries.find(ind => ind.companyId === formData.companyId && ind.id !== editingIndustry?.id);
    if (existingIndustry) {
      toast.error('Company ID already exists. Please choose a different one.');
      return;
    }

    try {
      const industryId = editingIndustry ? editingIndustry.id : push(dbref(database, '/industries/')).key;

      await update(dbref(database, `/industries/${industryId}`), {
        ...formData,
        id: industryId,
        createdAt: editingIndustry ? editingIndustry.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(editingIndustry ? 'Industry updated successfully!' : 'Industry added successfully!');
      setModalIsOpen(false);
      setEditingIndustry(null);
      resetForm();
      fetchIndustries();
    } catch (error) {
      console.error('Error saving industry:', error);
      toast.error('Failed to save industry');
    }
  };

  const handleEdit = (industry) => {
    setEditingIndustry(industry);
    setFormData({
      companyName: industry.companyName || '',
      email: industry.email || '',
      phone: industry.phone || '',
      industryType: industry.industryType || '',
      location: industry.location || '',
      website: industry.website || '',
      description: industry.description || '',
      companyId: industry.companyId || '',
      password: industry.password || '',
      status: industry.status || 'Active'
    });
    setModalIsOpen(true);
  };

  const handleDelete = async (industryId) => {
    if (window.confirm('Are you sure you want to delete this industry? This will prevent them from logging in.')) {
      try {
        await update(dbref(database, `/industries/${industryId}`), null);
        toast.success('Industry deleted successfully!');
        fetchIndustries();
      } catch (error) {
        console.error('Error deleting industry:', error);
        toast.error('Failed to delete industry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      email: '',
      phone: '',
      industryType: '',
      location: '',
      website: '',
      description: '',
      companyId: '',
      password: '',
      status: 'Active'
    });
  };

  const openModal = () => {
    setEditingIndustry(null);
    resetForm();
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingIndustry(null);
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
    <div className="industry-management">
      <Header />
      <SubHead title="Industry Management" btnFunc={openModal} />

      <div className="industries-container">
        <div className="industries-grid">
          {industries.map((industry) => (
            <div key={industry.id} className="industry-card">
              <div className="industry-header">
                <div className="industry-avatar">
                  <FaIndustry size={24} />
                </div>
                <div className="industry-basic-info">
                  <h3>{industry.companyName}</h3>
                  <p className="industry-type">{industry.industryType}</p>
                  <span className={`status-badge ${industry.status?.toLowerCase()}`}>
                    {industry.status}
                  </span>
                </div>
              </div>

              <div className="industry-body">
                <div className="industry-details">
                  <div className="detail-row">
                    <FaEnvelope className="detail-icon" />
                    <span>{industry.email}</span>
                  </div>
                  {industry.phone && (
                    <div className="detail-row">
                      <FaPhone className="detail-icon" />
                      <span>{industry.phone}</span>
                    </div>
                  )}
                  {industry.location && (
                    <div className="detail-row">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{industry.location}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <FaBuilding className="detail-icon" />
                    <span>Company ID: {industry.companyId}</span>
                  </div>
                </div>

                {industry.website && (
                  <div className="industry-website">
                    <strong>Website:</strong> <a href={industry.website} target="_blank" rel="noopener noreferrer">{industry.website}</a>
                  </div>
                )}

                {industry.description && (
                  <div className="industry-description">
                    <h4>Description</h4>
                    <p>{industry.description}</p>
                  </div>
                )}
              </div>

              <div className="industry-actions">
                <button
                  onClick={() => handleEdit(industry)}
                  className="action-btn edit-btn"
                  title="Edit Industry"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(industry.id)}
                  className="action-btn delete-btn"
                  title="Delete Industry"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {industries.length === 0 && (
            <div className="empty-state">
              <FaIndustry size={48} className="empty-icon" />
              <h3>No Industries Found</h3>
              <p>Add industry partners to enable internship and hackathon opportunities</p>
              <button onClick={openModal} className="create-first-btn">
                <FaPlus /> Add Industry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit Industry */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="industry-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>{editingIndustry ? 'Edit Industry' : 'Add New Industry'}</h2>
          <button onClick={closeModal} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="industry-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g., TechCorp Solutions"
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
                placeholder="contact@company.com"
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
              <label>Industry Type *</label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Industry Type</option>
                {industryTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.company.com"
              />
            </div>

            <div className="form-group">
              <label>Company ID *</label>
              <input
                type="text"
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                placeholder="Unique company identifier"
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

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the company..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingIndustry ? 'Update Industry' : 'Add Industry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IndustryManagement;
