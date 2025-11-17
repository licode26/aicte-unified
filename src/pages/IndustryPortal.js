import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaPlus, FaBriefcase, FaTrophy, FaUsers, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../firebase/init-firebase";
import { toast } from "react-toastify";
import "../styles/IndustryPortal.css";

const IndustryPortal = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('internships');
  const [showCreateInternship, setShowCreateInternship] = useState(false);
  const [showCreateHackathon, setShowCreateHackathon] = useState(false);
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [internshipForm, setInternshipForm] = useState({
    title: '',
    description: '',
    requirements: '',
    duration: '',
    stipend: '',
    location: '',
    collaboration: false,
    universityPartners: []
  });

  const [hackathonForm, setHackathonForm] = useState({
    title: '',
    description: '',
    problemStatement: '',
    startDate: '',
    endDate: '',
    maxTeams: '',
    teamSize: '',
    prizes: '',
    instructions: ''
  });

  useEffect(() => {
    fetchInternships();
    fetchHackathons();
  }, []);

  const fetchInternships = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/internships/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const internshipsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setInternships(internshipsArray);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    }
  };

  const fetchHackathons = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/hackathons/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const hackathonsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setHackathons(hackathonsArray);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInternshipSubmit = async (e) => {
    e.preventDefault();

    if (!internshipForm.title || !internshipForm.description || !internshipForm.duration || !internshipForm.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const internshipId = push(dbref(database, '/internships/')).key;

      const internshipData = {
        ...internshipForm,
        id: internshipId,
        companyId: user?.user?.companyId,
        companyName: user?.user?.displayName,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await update(dbref(database, `/internships/${internshipId}`), internshipData);

      toast.success('Internship created successfully!');
      setShowCreateInternship(false);
      // Reset form
      setInternshipForm({
        title: '',
        description: '',
        requirements: '',
        duration: '',
        stipend: '',
        location: '',
        collaboration: false,
        universityPartners: []
      });
      fetchInternships();
    } catch (error) {
      console.error('Error creating internship:', error);
      toast.error('Failed to create internship');
    }
  };

  const handleHackathonSubmit = async (e) => {
    e.preventDefault();

    if (!hackathonForm.title || !hackathonForm.description || !hackathonForm.problemStatement || !hackathonForm.startDate || !hackathonForm.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const hackathonId = push(dbref(database, '/hackathons/')).key;

      const hackathonData = {
        ...hackathonForm,
        id: hackathonId,
        companyId: user?.user?.companyId,
        companyName: user?.user?.displayName,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await update(dbref(database, `/hackathons/${hackathonId}`), hackathonData);

      toast.success('Hackathon created successfully!');
      setShowCreateHackathon(false);
      // Reset form
      setHackathonForm({
        title: '',
        description: '',
        problemStatement: '',
        startDate: '',
        endDate: '',
        maxTeams: '',
        teamSize: '',
        prizes: '',
        instructions: ''
      });
      fetchHackathons();
    } catch (error) {
      console.error('Error creating hackathon:', error);
      toast.error('Failed to create hackathon');
    }
  };

  return (
    <div className="industry-portal">
      <div className="industry-header">
        <button onClick={onBack} className="back-button">
          <FaArrowLeft /> Back to Role Selection
        </button>
        <button
          onClick={() => window.location.href = 'mailto:prithwi.vibecode26@gmail.com'}
          className="support-btn"
        >
          <FaEnvelope /> Support
        </button>
        <h1>Industry Portal</h1>
        <p>Welcome, {user?.user?.displayName || user?.user?.email || 'Industry Partner'}</p>
      </div>

      <div className="industry-content">
        <div className="industry-tabs">
          <button
            className={`tab-button ${activeTab === 'internships' ? 'active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <FaBriefcase /> Create Internship
          </button>
          <button
            className={`tab-button ${activeTab === 'hackathons' ? 'active' : ''}`}
            onClick={() => setActiveTab('hackathons')}
          >
            <FaTrophy /> Create Hackathon
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'internships' && (
            <div className="internship-section">
              <div className="section-header">
                <h2>Internship Opportunities</h2>
                <button
                  className="create-button"
                  onClick={() => setShowCreateInternship(true)}
                >
                  <FaPlus /> Create New Internship
                </button>
              </div>

              <div className="internship-list">
                {internships.length > 0 ? (
                  internships.map((internship) => (
                    <div key={internship.id} className="internship-card">
                      <div className="internship-header">
                        <h4>{internship.title}</h4>
                        <span className="company-name">{internship.companyName}</span>
                      </div>
                      <div className="internship-details">
                        <p><strong>Duration:</strong> {internship.duration}</p>
                        <p><strong>Location:</strong> {internship.location}</p>
                        {internship.stipend && <p><strong>Stipend:</strong> {internship.stipend}</p>}
                        <p><strong>Description:</strong> {internship.description}</p>
                        {internship.requirements && <p><strong>Requirements:</strong> {internship.requirements}</p>}
                        {internship.collaboration && internship.universityName && <p><strong>University:</strong> {internship.universityName}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaBriefcase size={48} />
                    <h3>No internships created yet</h3>
                    <p>Create your first internship opportunity to attract talented students</p>
                  </div>
                )}
              </div>

              {showCreateInternship && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Create New Internship</h3>
                      <button
                        className="close-button"
                        onClick={() => setShowCreateInternship(false)}
                      >
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleInternshipSubmit} className="internship-form">
                      <div className="form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={internshipForm.title}
                          onChange={(e) => setInternshipForm({...internshipForm, title: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          value={internshipForm.description}
                          onChange={(e) => setInternshipForm({...internshipForm, description: e.target.value})}
                          rows={4}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Duration *</label>
                          <input
                            type="text"
                            value={internshipForm.duration}
                            onChange={(e) => setInternshipForm({...internshipForm, duration: e.target.value})}
                            placeholder="e.g., 3 months"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Stipend</label>
                          <input
                            type="text"
                            value={internshipForm.stipend}
                            onChange={(e) => setInternshipForm({...internshipForm, stipend: e.target.value})}
                            placeholder="e.g., ₹5000/month"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={internshipForm.location}
                          onChange={(e) => setInternshipForm({...internshipForm, location: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Requirements</label>
                        <textarea
                          value={internshipForm.requirements}
                          onChange={(e) => setInternshipForm({...internshipForm, requirements: e.target.value})}
                          rows={3}
                          placeholder="Skills, qualifications, etc."
                        />
                      </div>

                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={internshipForm.collaboration}
                            onChange={(e) => setInternshipForm({...internshipForm, collaboration: e.target.checked})}
                          />
                          Collaborate with universities
                        </label>
                      </div>

                      {internshipForm.collaboration && (
                        <div className="form-group">
                          <label>University Name *</label>
                          <input
                            type="text"
                            value={internshipForm.universityName || ''}
                            onChange={(e) => setInternshipForm({...internshipForm, universityName: e.target.value})}
                            placeholder="Enter university name"
                            required={internshipForm.collaboration}
                          />
                        </div>
                      )}

                      <div className="form-actions">
                        <button type="button" onClick={() => setShowCreateInternship(false)}>Cancel</button>
                        <button type="submit">Create Internship</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hackathons' && (
            <div className="hackathon-section">
              <div className="section-header">
                <h2>Hackathon Events</h2>
                <button
                  className="create-button"
                  onClick={() => setShowCreateHackathon(true)}
                >
                  <FaPlus /> Create New Hackathon
                </button>
              </div>

              <div className="hackathon-list">
                {hackathons.length > 0 ? (
                  hackathons.map((hackathon) => (
                    <div key={hackathon.id} className="hackathon-card">
                      <div className="hackathon-header">
                        <h4>{hackathon.title}</h4>
                        <span className="company-name">{hackathon.companyName}</span>
                      </div>
                      <div className="hackathon-details">
                        <p><strong>Start:</strong> {new Date(hackathon.startDate).toLocaleDateString()}</p>
                        <p><strong>End:</strong> {new Date(hackathon.endDate).toLocaleDateString()}</p>
                        {hackathon.maxTeams && <p><strong>Max Teams:</strong> {hackathon.maxTeams}</p>}
                        {hackathon.teamSize && <p><strong>Team Size:</strong> {hackathon.teamSize}</p>}
                        <p><strong>Description:</strong> {hackathon.description}</p>
                        <p><strong>Problem:</strong> {hackathon.problemStatement}</p>
                        {hackathon.prizes && <p><strong>Prizes:</strong> {hackathon.prizes}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaTrophy size={48} />
                    <h3>No hackathons created yet</h3>
                    <p>Organize your first hackathon to challenge students with real-world problems</p>
                  </div>
                )}
              </div>

              {showCreateHackathon && (
                <div className="modal-overlay">
                  <div className="modal-content large">
                    <div className="modal-header">
                      <h3>Create New Hackathon</h3>
                      <button
                        className="close-button"
                        onClick={() => setShowCreateHackathon(false)}
                      >
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleHackathonSubmit} className="hackathon-form">
                      <div className="form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          value={hackathonForm.title}
                          onChange={(e) => setHackathonForm({...hackathonForm, title: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          value={hackathonForm.description}
                          onChange={(e) => setHackathonForm({...hackathonForm, description: e.target.value})}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Problem Statement *</label>
                        <textarea
                          value={hackathonForm.problemStatement}
                          onChange={(e) => setHackathonForm({...hackathonForm, problemStatement: e.target.value})}
                          rows={5}
                          placeholder="Describe the problem students need to solve"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Start Date *</label>
                          <input
                            type="datetime-local"
                            value={hackathonForm.startDate}
                            onChange={(e) => setHackathonForm({...hackathonForm, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>End Date *</label>
                          <input
                            type="datetime-local"
                            value={hackathonForm.endDate}
                            onChange={(e) => setHackathonForm({...hackathonForm, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Max Teams</label>
                          <input
                            type="number"
                            value={hackathonForm.maxTeams}
                            onChange={(e) => setHackathonForm({...hackathonForm, maxTeams: e.target.value})}
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div className="form-group">
                          <label>Team Size</label>
                          <input
                            type="number"
                            value={hackathonForm.teamSize}
                            onChange={(e) => setHackathonForm({...hackathonForm, teamSize: e.target.value})}
                            placeholder="e.g., 4"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Prizes</label>
                        <textarea
                          value={hackathonForm.prizes}
                          onChange={(e) => setHackathonForm({...hackathonForm, prizes: e.target.value})}
                          rows={3}
                          placeholder="Describe prizes for winners"
                        />
                      </div>

                      <div className="form-group">
                        <label>Instructions</label>
                        <textarea
                          value={hackathonForm.instructions}
                          onChange={(e) => setHackathonForm({...hackathonForm, instructions: e.target.value})}
                          rows={4}
                          placeholder="Additional instructions for participants"
                        />
                      </div>

                      <div className="form-actions">
                        <button type="button" onClick={() => setShowCreateHackathon(false)}>Cancel</button>
                        <button type="submit">Create Hackathon</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndustryPortal;
