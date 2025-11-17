import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import Modal from "react-modal";
import Header from "../../components/Header";
import SubHead from "../../components/SubHead";
import { FaPlus, FaEdit, FaEye, FaBook, FaGraduationCap } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import SemesterManagement from "./SemesterManagement";
import "../../styles/StreamManagement.css";

const StreamManagement = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '4',
    totalSemesters: '8',
    category: 'BTech'
  });

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/streams/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const streamsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setStreams(streamsArray);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to fetch streams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const streamId = editingStream ? editingStream.id : push(dbref(database, '/streams/')).key;
      
      await update(dbref(database, `/streams/${streamId}`), {
        ...formData,
        id: streamId,
        createdAt: editingStream ? editingStream.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(editingStream ? 'Stream updated successfully!' : 'Stream created successfully!');
      setModalIsOpen(false);
      setEditingStream(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        duration: '4',
        totalSemesters: '8',
        category: 'BTech'
      });
      fetchStreams();
    } catch (error) {
      console.error('Error saving stream:', error);
      toast.error('Failed to save stream');
    }
  };

  const handleEdit = (stream) => {
    setEditingStream(stream);
    setFormData({
      name: stream.name,
      code: stream.code,
      description: stream.description || '',
      duration: stream.duration || '4',
      totalSemesters: stream.totalSemesters || '8',
      category: stream.category || 'BTech'
    });
    setModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModal = () => {
    setEditingStream(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      duration: '4',
      totalSemesters: '8',
      category: 'BTech'
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingStream(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader size={50} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="stream-management">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <SubHead title="Stream Management" btnFunc={openModal} />
              
              <div className="streams-container">
                <div className="streams-grid">
                  {streams.map((stream) => (
                    <div key={stream.id} className="stream-card">
                      <div className="stream-header">
                        <div className="stream-icon">
                          <FaGraduationCap size={24} />
                        </div>
                        <div className="stream-info">
                          <h3>{stream.name}</h3>
                          <span className="stream-code">{stream.code}</span>
                        </div>
                      </div>
                      
                      <div className="stream-body">
                        <p className="stream-description">
                          {stream.description || 'No description available'}
                        </p>
                        <div className="stream-details">
                          <div className="detail-item">
                            <span className="label">Category:</span>
                            <span className="value">{stream.category}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Duration:</span>
                            <span className="value">{stream.duration} years</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Semesters:</span>
                            <span className="value">{stream.totalSemesters}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="stream-actions">
                        <button
                          onClick={() => handleEdit(stream)}
                          className="action-btn edit-btn"
                          title="Edit Stream"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => window.location.href = `/Streams/semesters/${stream.id}`}
                          className="action-btn view-btn"
                          title="Manage Semesters"
                        >
                          <FaBook />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {streams.length === 0 && (
                    <div className="empty-state">
                      <FaGraduationCap size={48} className="empty-icon" />
                      <h3>No Streams Found</h3>
                      <p>Create your first stream to get started</p>
                      <button onClick={openModal} className="create-first-btn">
                        <FaPlus /> Create Stream
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal for Create/Edit Stream */}
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="stream-modal"
                overlayClassName="modal-overlay"
              >
                <div className="modal-header">
                  <h2>{editingStream ? 'Edit Stream' : 'Create New Stream'}</h2>
                  <button onClick={closeModal} className="close-btn">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="stream-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Stream Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science Engineering"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Stream Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., CSE"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="BTech">B.Tech</option>
                        <option value="MTech">M.Tech</option>
                        <option value="Diploma">Diploma</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Duration (Years)</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                      >
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        <option value="4">4 Years</option>
                        <option value="5">5 Years</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Total Semesters</label>
                      <select
                        name="totalSemesters"
                        value={formData.totalSemesters}
                        onChange={handleInputChange}
                      >
                        <option value="4">4 Semesters</option>
                        <option value="6">6 Semesters</option>
                        <option value="8">8 Semesters</option>
                        <option value="10">10 Semesters</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the stream..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={closeModal} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingStream ? 'Update Stream' : 'Create Stream'}
                    </button>
                  </div>
                </form>
              </Modal>
            </>
          }
        />
        <Route
          path="/semesters/:streamId"
          element={<SemesterManagement />}
        />
      </Routes>
    </div>
  );
};

export default StreamManagement;
