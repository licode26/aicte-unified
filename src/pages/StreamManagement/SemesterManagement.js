import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaBook } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import "../../styles/SemesterManagement.css";

const SemesterManagement = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: '',
    type: 'Core',
    description: ''
  });

  useEffect(() => {
    if (streamId) {
      fetchStreamData();
      fetchSubjects();
    }
  }, [streamId]);

  const fetchStreamData = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, `/streams/${streamId}`));
      if (snapshot.exists()) {
        setStream(snapshot.val());
      } else {
        toast.error('Stream not found');
        navigate('/Streams');
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      toast.error('Failed to fetch stream data');
    }
  };

  const fetchSubjects = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, `/streamSubjects/${streamId}`));
      if (snapshot.exists()) {
        setSubjects(snapshot.val());
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.credits) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const subjectId = editingSubject ? editingSubject.id : push(dbref(database, `/streamSubjects/${streamId}/semester${selectedSemester}`)).key;
      
      await update(dbref(database, `/streamSubjects/${streamId}/semester${selectedSemester}/${subjectId}`), {
        ...formData,
        id: subjectId,
        semester: selectedSemester,
        streamId: streamId,
        createdAt: editingSubject ? editingSubject.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(editingSubject ? 'Subject updated successfully!' : 'Subject added successfully!');
      setModalIsOpen(false);
      setEditingSubject(null);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
    }
  };

  const handleEdit = (subject, semester) => {
    setEditingSubject(subject);
    setSelectedSemester(semester);
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      type: subject.type || 'Core',
      description: subject.description || ''
    });
    setModalIsOpen(true);
  };

  const handleDelete = async (subjectId, semester) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await update(dbref(database, `/streamSubjects/${streamId}/semester${semester}/${subjectId}`), null);
        toast.success('Subject deleted successfully!');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: '',
      type: 'Core',
      description: ''
    });
  };

  const openModal = (semester) => {
    setSelectedSemester(semester);
    setEditingSubject(null);
    resetForm();
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingSubject(null);
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

  if (!stream) {
    return (
      <div className="error-state">
        <h2>Stream not found</h2>
        <button onClick={() => navigate('/Streams')} className="back-btn">
          <FaArrowLeft /> Back to Streams
        </button>
      </div>
    );
  }

  const totalSemesters = parseInt(stream.totalSemesters) || 8;
  const semesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  return (
    <div className="semester-management">
      {/* Header */}
      <div className="semester-header">
        <button onClick={() => navigate('/Streams')} className="back-button">
          <FaArrowLeft /> Back to Streams
        </button>
        <div className="stream-info">
          <h1>{stream.name} ({stream.code})</h1>
          <p>Manage subjects for each semester</p>
        </div>
      </div>

      {/* Semester Grid */}
      <div className="semesters-container">
        <div className="semesters-grid">
          {semesters.map(semester => {
            const semesterSubjects = subjects[`semester${semester}`] || {};
            const subjectsList = Object.values(semesterSubjects);
            
            return (
              <div key={semester} className="semester-card">
                <div className="semester-card-header">
                  <h3>Semester {semester}</h3>
                  <button
                    onClick={() => openModal(semester)}
                    className="add-subject-btn"
                    title="Add Subject"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <div className="subjects-list">
                  {subjectsList.length > 0 ? (
                    subjectsList.map(subject => (
                      <div key={subject.id} className="subject-item">
                        <div className="subject-info">
                          <h4>{subject.name}</h4>
                          <p className="subject-code">{subject.code}</p>
                          <div className="subject-meta">
                            <span className={`subject-type ${subject.type?.toLowerCase()}`}>
                              {subject.type}
                            </span>
                            <span className="subject-credits">
                              {subject.credits} Credits
                            </span>
                          </div>
                        </div>
                        <div className="subject-actions">
                          <button
                            onClick={() => handleEdit(subject, semester)}
                            className="edit-subject-btn"
                            title="Edit Subject"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id, semester)}
                            className="delete-subject-btn"
                            title="Delete Subject"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-semester">
                      <FaBook className="empty-icon" />
                      <p>No subjects added yet</p>
                      <button
                        onClick={() => openModal(semester)}
                        className="add-first-subject"
                      >
                        Add First Subject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="subject-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>
            {editingSubject ? 'Edit Subject' : `Add Subject to Semester ${selectedSemester}`}
          </h2>
          <button onClick={closeModal} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="subject-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Subject Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Data Structures and Algorithms"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Subject Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS201"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Credits *</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                placeholder="e.g., 4"
                min="1"
                max="10"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Subject Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the subject..."
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SemesterManagement;
