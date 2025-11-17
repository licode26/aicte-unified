import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaUniversity, FaBook, FaSearch, FaUserTie, FaEnvelope, FaPhone, FaVideo, FaCalendarAlt, FaBlog, FaPlus, FaBriefcase, FaTrophy } from "react-icons/fa";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import BlogList from "../../components/Blog/BlogList";
import BlogEditor from "../../components/Blog/BlogEditor";
import "../../styles/StudentPortal.css";

const StudentPortal = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('universities');
  const [universities, setUniversities] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [experts, setExperts] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [domainFilter, setDomainFilter] = useState('');
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [savingBlog, setSavingBlog] = useState(false);

  useEffect(() => {
    fetchUniversities();
    fetchCurriculums();
    fetchExperts();
    fetchSeminars();
    fetchInternships();
    fetchHackathons();
  }, []);

  // ... existing fetch functions remain the same ...

  const fetchUniversities = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/universities/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const universitiesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUniversities(universitiesArray);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculums = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/curriculumDetails/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const curriculumsArray = [];
        Object.keys(data).forEach(refKey => {
          Object.keys(data[refKey]).forEach(currKey => {
            curriculumsArray.push({
              id: currKey,
              referenceId: refKey,
              ...data[refKey][currKey]
            });
          });
        });
        setCurriculums(curriculumsArray);
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error);
    }
  };

  const fetchExperts = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/domainExperts/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expertsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(expert => expert.status === 'Active');
        setExperts(expertsArray);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const fetchSeminars = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/seminars/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const seminarsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(seminar => {
          const seminarDate = new Date(seminar.date);
          const today = new Date();
          return seminarDate >= today && seminar.status === 'Scheduled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        setSeminars(seminarsArray);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    }
  };

  const fetchInternships = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/internships/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const internshipsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(internship => internship.status === 'Active');
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
        })).filter(hackathon => {
          const endDate = new Date(hackathon.endDate);
          const today = new Date();
          return endDate >= today && hackathon.status === 'Active';
        }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setHackathons(hackathonsArray);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    }
  };

  const handleSeminarRegistration = async (seminarId) => {
    try {
      const seminar = seminars.find(s => s.id === seminarId);
      if (!seminar) return;

      const currentRegistrations = seminar.registrations || 0;
      if (currentRegistrations >= seminar.maxParticipants) {
        toast.error('Seminar is full. Registration closed.');
        return;
      }

      await update(dbref(database, `/seminars/${seminarId}`), {
        registrations: currentRegistrations + 1
      });

      toast.success('Successfully registered for the seminar!');
      fetchSeminars(); // Refresh the seminars list
    } catch (error) {
      console.error('Error registering for seminar:', error);
      toast.error('Failed to register for seminar');
    }
  };

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setShowBlogEditor(true);
  };

  const handleSaveBlog = async (blogData) => {
    try {
      setSavingBlog(true);

      const blogId = push(dbref(database, '/blogs/')).key;
      await update(dbref(database, `/blogs/${blogId}`), {
        ...blogData,
        id: blogId,
        author: user?.user?.displayName || user?.user?.email || 'Student',
        authorRole: 'Student',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success('Blog created successfully!');
      setShowBlogEditor(false);
      setEditingBlog(null);
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to create blog');
    } finally {
      setSavingBlog(false);
    }
  };

  // ... existing filter functions remain the same ...

  const filteredUniversities = universities.filter(uni =>
    uni.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.initialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCurriculums = curriculums.filter(curr =>
    curr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curr.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curr.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = !domainFilter || expert.domain === domainFilter;

    return matchesSearch && matchesDomain;
  });

  const filteredSeminars = seminars.filter(seminar =>
    seminar.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seminar.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seminar.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seminar.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInternships = internships.filter(internship =>
    internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.problemStatement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueDomains = [...new Set(experts.map(expert => expert.domain))].filter(Boolean);

  const tabs = [
    { id: 'universities', label: 'Universities', icon: <FaUniversity /> },
    { id: 'curriculum', label: 'Curriculum', icon: <FaBook /> },
    { id: 'experts', label: 'Experts', icon: <FaUserTie /> },
    { id: 'seminars', label: 'Seminars', icon: <FaVideo /> },
    { id: 'internships', label: 'Internships', icon: <FaBriefcase /> },
    { id: 'hackathons', label: 'Hackathons', icon: <FaTrophy /> },
    { id: 'blogs', label: 'Blogs', icon: <FaBlog /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader size={50} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="student-portal">
      {/* Header */}
      <header className="portal-header">
        <div className="header-content">
          <button onClick={onBack} className="back-btn">
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="portal-title">Student Portal</h1>
          <div className="header-actions">
            {user && (
              <div className="user-welcome">
                <span>Welcome, {user.user?.displayName || user.user?.email || 'Student'}</span>
                <button onClick={onBack} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
            <button
              onClick={() => window.location.href = 'mailto:prithwi.vibecode26@gmail.com'}
              className="support-btn"
            >
              <FaEnvelope /> Support
            </button>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {activeTab === 'experts' && (
              <div className="filter-container">
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="domain-filter"
                >
                  <option value="">All Domains</option>
                  {uniqueDomains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="portal-content">
        {activeTab === 'universities' && (
          <div className="universities-section">
            <div className="section-header">
              <h2>Universities & Institutes</h2>
              <p>Explore AICTE approved universities and their institutes</p>
            </div>
            <div className="universities-grid">
              {filteredUniversities.map(university => (
                <div key={university.id} className="university-card">
                  <div className="card-header">
                    <h3>{university.initialName}</h3>
                    <span className="university-code">{university.code}</span>
                  </div>
                  <div className="card-body">
                    <h4>{university.fullName}</h4>
                    <p className="location">📍 {university.location}</p>
                    <p className="contact">📧 {university.email}</p>
                    <p className="contact">📞 {university.phone}</p>
                    {university.website && (
                      <a href={university.website} target="_blank" rel="noopener noreferrer" className="website-link">
                        🌐 Visit Website
                      </a>
                    )}
                  </div>
                  <div className="card-footer">
                    <button 
                      onClick={() => setSelectedUniversity(university)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="curriculum-section">
            <div className="section-header">
              <h2>Curriculum Repository</h2>
              <p>Browse available curriculum and learning materials</p>
            </div>
            <div className="curriculum-grid">
              {filteredCurriculums.map(curriculum => (
                <div key={curriculum.id} className="curriculum-card">
                  <div className="card-header">
                    <h3>{curriculum.title}</h3>
                    <span className={`level-badge ${curriculum.level?.toLowerCase()}`}>
                      {curriculum.level}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="curriculum-code">Code: {curriculum.code}</p>
                    <p className="semester">Semester: {curriculum.semester}</p>
                    <p className="tag">Tag: {curriculum.tag}</p>
                    <p className="total-sems">Total Semesters: {curriculum.totalSems}</p>
                  </div>
                  <div className="card-footer">
                    {curriculum.fileUrl && (
                      <a 
                        href={curriculum.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="download-btn"
                      >
                        📄 View Document
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'experts' && (
          <div className="experts-section">
            <div className="section-header">
              <h2>Domain Experts</h2>
              <p>Connect with industry experts and academic professionals</p>
            </div>
            <div className="experts-grid">
              {filteredExperts.map(expert => (
                <div key={expert.id} className="expert-card">
                  <div className="expert-header">
                    <div className="expert-avatar">
                      <FaUserTie size={24} />
                    </div>
                    <div className="expert-info">
                      <h3>{expert.name}</h3>
                      <p className="expert-designation">
                        {expert.designation} {expert.organization && `at ${expert.organization}`}
                      </p>
                      <span className="domain-badge">{expert.domain}</span>
                    </div>
                  </div>

                  <div className="expert-body">
                    <div className="expert-specialization">
                      <h4>Specialization</h4>
                      <p>{expert.specialization}</p>
                    </div>

                    {expert.experience && (
                      <div className="expert-experience">
                        <strong>Experience:</strong> {expert.experience} years
                      </div>
                    )}

                    <div className="expert-contact">
                      <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <span>{expert.email}</span>
                      </div>
                      {expert.phone && (
                        <div className="contact-item">
                          <FaPhone className="contact-icon" />
                          <span>{expert.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="expert-actions">
                    <button
                      onClick={() => setSelectedExpert(expert)}
                      className="view-profile-btn"
                    >
                      View Profile
                    </button>
                    <a
                      href={`mailto:${expert.email}`}
                      className="contact-btn"
                    >
                      <FaEnvelope /> Contact
                    </a>
                  </div>
                </div>
              ))}

              {filteredExperts.length === 0 && (
                <div className="empty-experts">
                  <FaUserTie size={48} className="empty-icon" />
                  <h3>No Experts Found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seminars' && (
          <div className="seminars-section">
            <div className="section-header">
              <h2>Upcoming Seminars</h2>
              <p>Join live seminars and webinars by expert teachers</p>
            </div>
            <div className="seminars-grid">
              {filteredSeminars.map(seminar => (
                <div key={seminar.id} className="seminar-card">
                  <div className="seminar-header">
                    <div className="seminar-date">
                      <FaCalendarAlt className="date-icon" />
                      <div className="date-info">
                        <span className="date">{new Date(seminar.date).toLocaleDateString()}</span>
                        <span className="time">{seminar.time}</span>
                      </div>
                    </div>
                    <span className="duration-badge">{seminar.duration} min</span>
                  </div>

                  <div className="seminar-body">
                    <h3>{seminar.title}</h3>
                    <p className="seminar-teacher">
                      <strong>By:</strong> {seminar.teacherName}
                    </p>
                    <p className="seminar-topic">
                      <strong>Topic:</strong> {seminar.topic}
                    </p>

                    {seminar.objective && (
                      <div className="seminar-objective">
                        <h4>Objective</h4>
                        <p>{seminar.objective}</p>
                      </div>
                    )}

                    {seminar.description && (
                      <div className="seminar-description">
                        <h4>Description</h4>
                        <p>{seminar.description}</p>
                      </div>
                    )}

                    {seminar.tags && (
                      <div className="seminar-tags">
                        {seminar.tags.split(',').map((tag, index) => (
                          <span key={index} className="tag">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="seminar-stats">
                      <span className="participants">
                        👥 {seminar.registrations || 0}/{seminar.maxParticipants} registered
                      </span>
                    </div>
                  </div>

                  <div className="seminar-actions">
                    <button
                      onClick={() => setSelectedSeminar(seminar)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleSeminarRegistration(seminar.id)}
                      className="register-btn"
                      disabled={(seminar.registrations || 0) >= seminar.maxParticipants}
                    >
                      {(seminar.registrations || 0) >= seminar.maxParticipants ? 'Full' : 'Register'}
                    </button>
                  </div>
                </div>
              ))}

              {filteredSeminars.length === 0 && (
                <div className="empty-seminars">
                  <FaVideo size={48} className="empty-icon" />
                  <h3>No Upcoming Seminars</h3>
                  <p>Check back later for new seminars and webinars</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'internships' && (
          <div className="internships-section">
            <div className="section-header">
              <h2>Internship Opportunities</h2>
              <p>Explore internship opportunities from industry partners</p>
            </div>
            <div className="internships-grid">
              {filteredInternships.map(internship => (
                <div key={internship.id} className="internship-card">
                  <div className="card-header">
                    <h3>{internship.title}</h3>
                    <span className="company-badge">{internship.companyName}</span>
                  </div>
                  <div className="card-body">
                    <p className="internship-description">{internship.description}</p>
                    <div className="internship-details">
                      <div className="detail-item">
                        <strong>Duration:</strong> {internship.duration}
                      </div>
                      {internship.stipend && (
                        <div className="detail-item">
                          <strong>Stipend:</strong> {internship.stipend}
                        </div>
                      )}
                      <div className="detail-item">
                        <strong>Location:</strong> {internship.location}
                      </div>
                    </div>
                    {internship.requirements && (
                      <div className="internship-requirements">
                        <h4>Requirements</h4>
                        <p>{internship.requirements}</p>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <button className="apply-btn">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}

              {filteredInternships.length === 0 && (
                <div className="empty-internships">
                  <FaBriefcase size={48} className="empty-icon" />
                  <h3>No Internship Opportunities</h3>
                  <p>Check back later for new internship opportunities</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hackathons' && (
          <div className="hackathons-section">
            <div className="section-header">
              <h2>Hackathon Events</h2>
              <p>Participate in exciting hackathons and showcase your skills</p>
            </div>
            <div className="hackathons-grid">
              {filteredHackathons.map(hackathon => (
                <div key={hackathon.id} className="hackathon-card">
                  <div className="card-header">
                    <h3>{hackathon.title}</h3>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="card-body">
                    <p className="hackathon-description">{hackathon.description}</p>

                    <div className="hackathon-dates">
                      <div className="date-item">
                        <strong>Start:</strong> {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                      <div className="date-item">
                        <strong>End:</strong> {new Date(hackathon.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="hackathon-details">
                      <div className="detail-item">
                        <strong>Max Teams:</strong> {hackathon.maxTeams}
                      </div>
                      <div className="detail-item">
                        <strong>Team Size:</strong> {hackathon.teamSize}
                      </div>
                    </div>

                    {hackathon.prizes && (
                      <div className="hackathon-prizes">
                        <h4>Prizes</h4>
                        <p>{hackathon.prizes}</p>
                      </div>
                    )}

                    {hackathon.problemStatement && (
                      <div className="hackathon-problem">
                        <h4>Problem Statement</h4>
                        <p>{hackathon.problemStatement}</p>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <button className="register-btn">
                      Register Team
                    </button>
                  </div>
                </div>
              ))}

              {filteredHackathons.length === 0 && (
                <div className="empty-hackathons">
                  <FaTrophy size={48} className="empty-icon" />
                  <h3>No Active Hackathons</h3>
                  <p>Stay tuned for upcoming hackathon events</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="blogs-section">
            <div className="section-header">
              <div className="header-with-action">
                <div>
                  <h2>Latest Blogs</h2>
                  <p>Stay updated with latest educational blogs and articles</p>
                </div>
                <button onClick={handleCreateBlog} className="create-blog-btn">
                  <FaPlus /> Create Blog
                </button>
              </div>
            </div>
            <div className="blogs-content">
              <BlogList userRole="student" />
            </div>
          </div>
        )}

        {/* Blog Editor Modal */}
        {showBlogEditor && (
          <BlogEditor
            blog={editingBlog}
            onSave={handleSaveBlog}
            onCancel={() => {
              setShowBlogEditor(false);
              setEditingBlog(null);
            }}
            saving={savingBlog}
          />
        )}
      </main>

      {/* University Details Modal */}
      {selectedUniversity && (
        <div className="modal-overlay" onClick={() => setSelectedUniversity(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUniversity.fullName}</h2>
              <button 
                onClick={() => setSelectedUniversity(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Code:</strong> {selectedUniversity.code}
              </div>
              <div className="detail-row">
                <strong>Short Name:</strong> {selectedUniversity.initialName}
              </div>
              <div className="detail-row">
                <strong>Location:</strong> {selectedUniversity.location}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedUniversity.email}
              </div>
              <div className="detail-row">
                <strong>Phone:</strong> {selectedUniversity.phone}
              </div>
              {selectedUniversity.website && (
                <div className="detail-row">
                  <strong>Website:</strong> 
                  <a href={selectedUniversity.website} target="_blank" rel="noopener noreferrer">
                    {selectedUniversity.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expert Profile Modal */}
      {selectedExpert && (
        <div className="modal-overlay" onClick={() => setSelectedExpert(null)}>
          <div className="modal-content expert-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedExpert.name}</h2>
              <button
                onClick={() => setSelectedExpert(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="expert-profile-header">
                <div className="expert-avatar-large">
                  <FaUserTie size={40} />
                </div>
                <div className="expert-profile-info">
                  <h3>{selectedExpert.designation}</h3>
                  {selectedExpert.organization && (
                    <p className="organization">{selectedExpert.organization}</p>
                  )}
                  <span className="domain-badge large">{selectedExpert.domain}</span>
                </div>
              </div>

              <div className="expert-profile-details">
                <div className="detail-section">
                  <h4>Specialization</h4>
                  <p>{selectedExpert.specialization}</p>
                </div>

                {selectedExpert.qualification && (
                  <div className="detail-section">
                    <h4>Qualification</h4>
                    <p>{selectedExpert.qualification}</p>
                  </div>
                )}

                {selectedExpert.experience && (
                  <div className="detail-section">
                    <h4>Experience</h4>
                    <p>{selectedExpert.experience} years</p>
                  </div>
                )}

                {selectedExpert.bio && (
                  <div className="detail-section">
                    <h4>About</h4>
                    <p>{selectedExpert.bio}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="contact-details">
                    <div className="contact-item">
                      <FaEnvelope className="contact-icon" />
                      <a href={`mailto:${selectedExpert.email}`}>{selectedExpert.email}</a>
                    </div>
                    {selectedExpert.phone && (
                      <div className="contact-item">
                        <FaPhone className="contact-icon" />
                        <span>{selectedExpert.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="expert-profile-actions">
                <a
                  href={`mailto:${selectedExpert.email}`}
                  className="contact-expert-btn"
                >
                  <FaEnvelope /> Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seminar Details Modal */}
      {selectedSeminar && (
        <div className="modal-overlay" onClick={() => setSelectedSeminar(null)}>
          <div className="modal-content seminar-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSeminar.title}</h2>
              <button
                onClick={() => setSelectedSeminar(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="seminar-details-header">
                <div className="seminar-meta">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <div>
                      <strong>Date & Time</strong>
                      <p>{new Date(selectedSeminar.date).toLocaleDateString()} at {selectedSeminar.time}</p>
                    </div>
                  </div>
                  <div className="meta-item">
                    <FaVideo className="meta-icon" />
                    <div>
                      <strong>Duration</strong>
                      <p>{selectedSeminar.duration} minutes</p>
                    </div>
                  </div>
                  <div className="meta-item">
                    <FaUserTie className="meta-icon" />
                    <div>
                      <strong>Instructor</strong>
                      <p>{selectedSeminar.teacherName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="seminar-details-content">
                <div className="detail-section">
                  <h4>Topic</h4>
                  <p>{selectedSeminar.topic}</p>
                </div>

                {selectedSeminar.objective && (
                  <div className="detail-section">
                    <h4>Learning Objective</h4>
                    <p>{selectedSeminar.objective}</p>
                  </div>
                )}

                {selectedSeminar.description && (
                  <div className="detail-section">
                    <h4>Description</h4>
                    <p>{selectedSeminar.description}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Registration Status</h4>
                  <div className="registration-info">
                    <span className="registered-count">
                      {selectedSeminar.registrations || 0} / {selectedSeminar.maxParticipants} registered
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${((selectedSeminar.registrations || 0) / selectedSeminar.maxParticipants) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {selectedSeminar.tags && (
                  <div className="detail-section">
                    <h4>Tags</h4>
                    <div className="tags-list">
                      {selectedSeminar.tags.split(',').map((tag, index) => (
                        <span key={index} className="tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="seminar-modal-actions">
                <button
                  onClick={() => handleSeminarRegistration(selectedSeminar.id)}
                  className="register-seminar-btn"
                  disabled={(selectedSeminar.registrations || 0) >= selectedSeminar.maxParticipants}
                >
                  {(selectedSeminar.registrations || 0) >= selectedSeminar.maxParticipants ?
                    'Seminar Full' : 'Register for Seminar'
                  }
                </button>
                {selectedSeminar.meetLink && (
                  <a
                    href={selectedSeminar.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="join-meeting-btn"
                  >
                    <FaVideo /> Join Meeting
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
