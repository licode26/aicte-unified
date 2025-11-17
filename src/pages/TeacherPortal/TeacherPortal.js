import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaUser, FaBook, FaComments, FaCog, FaEdit, FaSave, FaTimes, FaVideo, FaCalendarPlus, FaBlog, FaPlus, FaCalendarAlt, FaThumbsUp, FaThumbsDown, FaEnvelope, FaClock, FaCheck } from "react-icons/fa";
import { ref as dbref, child, get, update, push } from "firebase/database";
import { database } from "../../firebase/init-firebase";
import { toast } from "react-toastify";
import BlogList from "../../components/Blog/BlogList";
import BlogEditor from "../../components/Blog/BlogEditor";
import "../../styles/TeacherPortal.css";

const TeacherPortal = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    institution: '',
    phone: '',
    experience: '',
    specialization: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [curriculums, setCurriculums] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [seminars, setSeminars] = useState([]);
  const [seminarForm, setSeminarForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetLink: '',
    topic: '',
    objective: '',
    tags: '',
    maxParticipants: '50'
  });
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [events, setEvents] = useState([]);
  const [curriculumVotes, setCurriculumVotes] = useState({});

  useEffect(() => {
    loadProfile();
    fetchCurriculums();
    fetchSeminars();
    fetchEvents();
    loadCurriculumVotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = () => {
    // Load from authenticated user or localStorage
    if (user && user.user) {
      // Try to get profile from database first
      const fetchUserProfile = async () => {
        try {
          const db = dbref(database);
          const snapshot = await get(child(db, `/users/${user.user.uid}`));
          if (snapshot.exists()) {
            const userProfile = snapshot.val();
            setProfile({
              name: userProfile.fullName || '',
              email: userProfile.email || '',
              position: userProfile.designation || '',
              department: userProfile.department || '',
              institution: userProfile.institution || '',
              phone: userProfile.phone || '',
              experience: userProfile.experience || '',
              specialization: userProfile.specialization || '',
              bio: userProfile.bio || ''
            });
          } else {
            // Fallback to basic user info
            setProfile({
              name: user.user.displayName || '',
              email: user.user.email || '',
              position: '',
              department: '',
              institution: '',
              phone: '',
              experience: '',
              specialization: '',
              bio: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      fetchUserProfile();
    } else {
      // Fallback to localStorage
      const savedProfile = localStorage.getItem('teacherProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
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

  const handleEditProfile = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setProfile({ ...tempProfile });
      localStorage.setItem('teacherProfile', JSON.stringify(tempProfile));

      // Also save to database if user is authenticated
      if (user && user.user) {
        await update(dbref(database, `/users/${user.user.uid}`), {
          fullName: tempProfile.name,
          designation: tempProfile.position,
          department: tempProfile.department,
          institution: tempProfile.institution,
          phone: tempProfile.phone,
          experience: tempProfile.experience,
          specialization: tempProfile.specialization,
          bio: tempProfile.bio,
          updatedAt: new Date().toISOString()
        });
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCancelEdit = () => {
    setTempProfile({});
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
        })).filter(seminar => seminar.teacherEmail === profile.email);
        setSeminars(seminarsArray);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/calendarEvents/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const eventsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(eventsArray);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const loadCurriculumVotes = () => {
    const savedVotes = localStorage.getItem('teacherCurriculumVotes');
    if (savedVotes) {
      setCurriculumVotes(JSON.parse(savedVotes));
    }
  };

  const saveCurriculumVotes = (votes) => {
    localStorage.setItem('teacherCurriculumVotes', JSON.stringify(votes));
    setCurriculumVotes(votes);
  };

  const handleCurriculumVote = async (curriculumId, vote) => {
    try {
      const currentVotes = { ...curriculumVotes };
      const previousVote = currentVotes[curriculumId];

      // Remove previous vote if exists
      if (previousVote) {
        await update(dbref(database, `/curriculumVotes/${curriculumId}/${previousVote}/${profile.email}`), null);
      }

      // Add new vote
      await update(dbref(database, `/curriculumVotes/${curriculumId}/${vote}/${profile.email}`), {
        timestamp: new Date().toISOString(),
        teacherName: profile.name,
        teacherEmail: profile.email
      });

      currentVotes[curriculumId] = vote;
      saveCurriculumVotes(currentVotes);

      toast.success(`Curriculum ${vote === 'approve' ? 'approved' : 'rejected'}!`);
    } catch (error) {
      console.error('Error voting on curriculum:', error);
      toast.error('Failed to submit vote');
    }
  };

  const handleSubmitFeedback = () => {
    if (!selectedCurriculum || !feedback.trim()) {
      toast.error('Please select a curriculum and provide feedback');
      return;
    }

    // Here you would typically save to database
    toast.success('Feedback submitted successfully!');
    setFeedback('');
    setSelectedCurriculum(null);
  };

  const handleSeminarSubmit = async (e) => {
    e.preventDefault();

    if (!seminarForm.title || !seminarForm.date || !seminarForm.time || !seminarForm.meetLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Google Meet link
    if (!seminarForm.meetLink.includes('meet.google.com')) {
      toast.error('Please provide a valid Google Meet link');
      return;
    }

    try {
      const seminarId = push(dbref(database, '/seminars/')).key;

      await update(dbref(database, `/seminars/${seminarId}`), {
        ...seminarForm,
        id: seminarId,
        teacherName: profile.name || 'Teacher',
        teacherEmail: profile.email || '',
        status: 'Scheduled',
        registrations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success('Seminar created successfully!');
      resetSeminarForm();
      fetchSeminars();
    } catch (error) {
      console.error('Error creating seminar:', error);
      toast.error('Failed to create seminar');
    }
  };

  const resetSeminarForm = () => {
    setSeminarForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      meetLink: '',
      topic: '',
      objective: '',
      tags: '',
      maxParticipants: '50'
    });
  };

  const handleSeminarInputChange = (e) => {
    const { name, value } = e.target;
    setSeminarForm(prev => ({
      ...prev,
      [name]: value
    }));
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
        author: profile.name || user?.user?.displayName || user?.user?.email || 'Teacher',
        authorRole: 'Teacher',
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

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting':
        return '#3B82F6'; // blue
      case 'workshop':
        return '#10B981'; // green
      case 'deadline':
        return '#EF4444'; // red
      case 'review':
        return '#F59E0B'; // yellow
      case 'planning':
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'resources', label: 'Resources', icon: <FaBook /> },
    { id: 'calendar', label: 'Calendar & Planning', icon: <FaCalendarAlt /> },
    { id: 'curriculum-voting', label: 'Curriculum Voting', icon: <FaComments /> },
    { id: 'seminars', label: 'Seminars', icon: <FaVideo /> },
    { id: 'blogs', label: 'Blogs', icon: <FaBlog /> },
    { id: 'feedback', label: 'Feedback', icon: <FaComments /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  return (
    <div className="teacher-portal">
      {/* Header */}
      <header className="portal-header">
        <div className="header-content">
          <button onClick={onBack} className="back-btn">
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="portal-title">Teacher Portal</h1>
          <div className="user-info">
            <span>Welcome, {profile.name || 'Teacher'}</span>
            <button
              onClick={() => window.location.href = 'mailto:prithwi.vibecode26@gmail.com'}
              className="support-btn"
            >
              <FaEnvelope /> Support
            </button>
            {user && (
              <button onClick={onBack} className="logout-btn">
                Logout
              </button>
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
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Management</h2>
              <button 
                onClick={isEditing ? handleSaveProfile : handleEditProfile}
                className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
              >
                {isEditing ? <FaSave /> : <FaEdit />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="form-value">{profile.name || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="form-value">{profile.email || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="e.g., Assistant Professor"
                    />
                  ) : (
                    <div className="form-value">{profile.position || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  ) : (
                    <div className="form-value">{profile.department || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Institution</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.institution || ''}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      placeholder="Enter your institution"
                    />
                  ) : (
                    <div className="form-value">{profile.institution || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="form-value">{profile.phone || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Experience (Years)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={tempProfile.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Years of experience"
                    />
                  ) : (
                    <div className="form-value">{profile.experience || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.specialization || ''}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="Your area of specialization"
                    />
                  ) : (
                    <div className="form-value">{profile.specialization || 'Not set'}</div>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={tempProfile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <div className="form-value">{profile.bio || 'Not set'}</div>
                )}
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button onClick={handleCancelEdit} className="cancel-btn">
                    <FaTimes /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} className="save-btn">
                    <FaSave /> Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-section">
            <div className="section-header">
              <h2>Teaching Resources</h2>
              <p>Access curriculum materials and teaching resources</p>
            </div>
            <div className="resources-grid">
              {curriculums.map(curriculum => (
                <div key={curriculum.id} className="resource-card">
                  <div className="card-header">
                    <h3>{curriculum.title}</h3>
                    <span className={`level-badge ${curriculum.level?.toLowerCase()}`}>
                      {curriculum.level}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Code:</strong> {curriculum.code}</p>
                    <p><strong>Semester:</strong> {curriculum.semester}</p>
                    <p><strong>Tag:</strong> {curriculum.tag}</p>
                  </div>
                  <div className="card-footer">
                    {curriculum.fileUrl && (
                      <a
                        href={curriculum.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        📄 View Resource
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="calendar-section">
            <div className="section-header">
              <h2>Calendar & Planning</h2>
              <p>View curriculum development events and planning sessions</p>
            </div>

            <div className="events-list">
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <div className="event-type" style={{ backgroundColor: getEventTypeColor(event.type) }}>
                        {event.type}
                      </div>
                    </div>

                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>

                      <div className="event-details">
                        <div className="event-detail">
                          <FaCalendarAlt />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="event-detail">
                          <FaClock />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                      </div>

                      {event.curriculumId && (
                        <div className="event-curriculum">
                          <strong>Related Curriculum:</strong> {curriculums.find(c => c.id === event.curriculumId)?.title || 'Unknown'}
                        </div>
                      )}

                      {event.tasks && event.tasks.length > 0 && (
                        <div className="event-tasks">
                          <h4>Tasks:</h4>
                          <ul>
                            {event.tasks.map((task, index) => (
                              <li key={index}>
                                <FaCheck className="task-check" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(event.googleMeetLink || event.googleCalendarLink) && (
                        <div className="event-links">
                          <h4>Links:</h4>
                          <div className="link-buttons">
                            {event.googleMeetLink && (
                              <a
                                href={event.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn meet-link"
                              >
                                Join Google Meet
                              </a>
                            )}
                            {event.googleCalendarLink && (
                              <a
                                href={event.googleCalendarLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn calendar-link"
                              >
                                View in Google Calendar
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-events">
                  <FaCalendarAlt size={48} className="empty-icon" />
                  <h4>No Events Scheduled</h4>
                  <p>Curriculum development events will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'curriculum-voting' && (
          <div className="voting-section">
            <div className="section-header">
              <h2>Curriculum Voting</h2>
              <p>Vote on proposed curriculum changes and new courses</p>
            </div>

            <div className="curriculum-voting-grid">
              {curriculums.filter(curriculum => curriculum.status === 'draft' || curriculum.status === 'pending').map(curriculum => (
                <div key={curriculum.id} className="voting-card">
                  <div className="voting-header">
                    <h3>{curriculum.title}</h3>
                    <span className={`status-badge ${curriculum.status}`}>
                      {curriculum.status}
                    </span>
                  </div>

                  <div className="voting-body">
                    <p><strong>Code:</strong> {curriculum.code}</p>
                    <p><strong>Department:</strong> {curriculum.department}</p>
                    <p><strong>Semester:</strong> {curriculum.semester}</p>
                    <p><strong>Credits:</strong> {curriculum.credits}</p>
                    {curriculum.description && (
                      <div className="curriculum-description">
                        <p>{curriculum.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="voting-actions">
                    <div className="vote-buttons">
                      <button
                        onClick={() => handleCurriculumVote(curriculum.id, 'approve')}
                        className={`vote-btn approve ${curriculumVotes[curriculum.id] === 'approve' ? 'active' : ''}`}
                      >
                        <FaThumbsUp /> Approve
                      </button>
                      <button
                        onClick={() => handleCurriculumVote(curriculum.id, 'reject')}
                        className={`vote-btn reject ${curriculumVotes[curriculum.id] === 'reject' ? 'active' : ''}`}
                      >
                        <FaThumbsDown /> Reject
                      </button>
                    </div>
                    {curriculumVotes[curriculum.id] && (
                      <div className="vote-status">
                        <span className={`vote-indicator ${curriculumVotes[curriculum.id]}`}>
                          You voted to {curriculumVotes[curriculum.id]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {curriculums.filter(curriculum => curriculum.status === 'draft' || curriculum.status === 'pending').length === 0 && (
                <div className="empty-voting">
                  <FaComments size={48} className="empty-icon" />
                  <h4>No Curriculums for Voting</h4>
                  <p>New curriculum proposals will appear here for voting</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seminars' && (
          <div className="seminars-section">
            <div className="section-header">
              <h2>Seminar Management</h2>
              <p>Create and manage your seminars and webinars</p>
            </div>

            {/* Create Seminar Form */}
            <div className="create-seminar-card">
              <div className="card-header">
                <h3><FaCalendarPlus /> Create New Seminar</h3>
              </div>
              <form onSubmit={handleSeminarSubmit} className="seminar-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Seminar Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={seminarForm.title}
                      onChange={handleSeminarInputChange}
                      placeholder="e.g., Introduction to Machine Learning"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Topic/Subject *</label>
                    <input
                      type="text"
                      name="topic"
                      value={seminarForm.topic}
                      onChange={handleSeminarInputChange}
                      placeholder="e.g., Artificial Intelligence"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={seminarForm.date}
                      onChange={handleSeminarInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={seminarForm.time}
                      onChange={handleSeminarInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <select
                      name="duration"
                      value={seminarForm.duration}
                      onChange={handleSeminarInputChange}
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={seminarForm.maxParticipants}
                      onChange={handleSeminarInputChange}
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Google Meet Link *</label>
                  <input
                    type="url"
                    name="meetLink"
                    value={seminarForm.meetLink}
                    onChange={handleSeminarInputChange}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Objective</label>
                  <textarea
                    name="objective"
                    value={seminarForm.objective}
                    onChange={handleSeminarInputChange}
                    placeholder="What will participants learn from this seminar?"
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={seminarForm.description}
                    onChange={handleSeminarInputChange}
                    placeholder="Detailed description of the seminar..."
                    rows={4}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={seminarForm.tags}
                    onChange={handleSeminarInputChange}
                    placeholder="e.g., AI, Machine Learning, Technology"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetSeminarForm} className="cancel-btn">
                    Clear Form
                  </button>
                  <button type="submit" className="submit-btn">
                    <FaCalendarPlus /> Create Seminar
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Seminars */}
            <div className="seminars-list">
              <h3>Your Seminars</h3>
              {seminars.length > 0 ? (
                <div className="seminars-grid">
                  {seminars.map(seminar => (
                    <div key={seminar.id} className="seminar-card">
                      <div className="seminar-header">
                        <h4>{seminar.title}</h4>
                        <span className={`status-badge ${seminar.status?.toLowerCase()}`}>
                          {seminar.status}
                        </span>
                      </div>
                      <div className="seminar-body">
                        <p><strong>Topic:</strong> {seminar.topic}</p>
                        <p><strong>Date:</strong> {new Date(seminar.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {seminar.time}</p>
                        <p><strong>Duration:</strong> {seminar.duration} minutes</p>
                        <p><strong>Registrations:</strong> {seminar.registrations || 0}/{seminar.maxParticipants}</p>
                        {seminar.objective && (
                          <p><strong>Objective:</strong> {seminar.objective}</p>
                        )}
                      </div>
                      <div className="seminar-actions">
                        <a
                          href={seminar.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-btn"
                        >
                          <FaVideo /> Join Meeting
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-seminars">
                  <FaVideo size={48} className="empty-icon" />
                  <h4>No Seminars Created</h4>
                  <p>Create your first seminar to get started</p>
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
                  <h2>Educational Blogs</h2>
                  <p>Read and share knowledge through educational blogs and articles</p>
                </div>
                <button onClick={handleCreateBlog} className="create-blog-btn">
                  <FaPlus /> Create Blog
                </button>
              </div>
            </div>
            <div className="blogs-content">
              <BlogList userRole="teacher" />
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="feedback-section">
            <div className="section-header">
              <h2>Curriculum Feedback</h2>
              <p>Provide feedback on curriculum materials</p>
            </div>
            <div className="feedback-form">
              <div className="form-group">
                <label>Select Curriculum</label>
                <select 
                  value={selectedCurriculum?.id || ''}
                  onChange={(e) => {
                    const selected = curriculums.find(c => c.id === e.target.value);
                    setSelectedCurriculum(selected);
                  }}
                >
                  <option value="">Choose a curriculum...</option>
                  {curriculums.map(curriculum => (
                    <option key={curriculum.id} value={curriculum.id}>
                      {curriculum.title} - {curriculum.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts on this curriculum..."
                  rows={6}
                />
              </div>
              <button onClick={handleSubmitFeedback} className="submit-btn">
                Submit Feedback
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Settings</h2>
              <p>Manage your preferences and account settings</p>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <h3>Notifications</h3>
                <p>Manage your notification preferences</p>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                  Email notifications
                </label>
              </div>
              <div className="setting-item">
                <h3>Privacy</h3>
                <p>Control your privacy settings</p>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                  Public profile
                </label>
              </div>
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
    </div>
  );
};

export default TeacherPortal;
