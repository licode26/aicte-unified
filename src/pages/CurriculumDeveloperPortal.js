import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaBook, FaCalendarAlt, FaTasks, FaClock, FaPlus, FaEdit, FaTrash, FaCheck, FaEnvelope } from "react-icons/fa";
import { ref as dbref, child, get, update, push, remove } from "firebase/database";
import { database } from "../firebase/init-firebase";
import { toast } from "react-toastify";
import "../styles/CurriculumDeveloperPortal.css";

const CurriculumDeveloperPortal = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('curriculum');
  const [curriculums, setCurriculums] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [curriculumForm, setCurriculumForm] = useState({
    title: '',
    code: '',
    description: '',
    department: '',
    semester: '',
    credits: '',
    objectives: '',
    outcomes: '',
    syllabus: '',
    duration: '4'
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'planning',
    curriculumId: '',
    tasks: [],
    googleMeetLink: '',
    googleCalendarLink: ''
  });

  const tabs = [
    { id: 'curriculum', label: 'Curriculum Management', icon: <FaBook /> },
    { id: 'calendar', label: 'Calendar & Planning', icon: <FaCalendarAlt /> },
    { id: 'tasks', label: 'Task Management', icon: <FaTasks /> }
  ];

  useEffect(() => {
    fetchCurriculums();
    fetchEvents();
  }, []);

  const fetchCurriculums = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/curriculumDetails/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const curriculumsArray = [];
        Object.keys(data).forEach(refKey => {
          if (typeof data[refKey] === 'object' && data[refKey] !== null) {
            Object.keys(data[refKey]).forEach(currKey => {
              if (typeof data[refKey][currKey] === 'object' && data[refKey][currKey] !== null) {
                curriculumsArray.push({
                  id: currKey,
                  referenceId: refKey,
                  ...data[refKey][currKey]
                });
              }
            });
          }
        });
        setCurriculums(curriculumsArray);
        console.log('Fetched curriculums:', curriculumsArray);
      } else {
        setCurriculums([]);
        console.log('No curriculum data found');
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error);
      toast.error('Failed to fetch curriculums');
      setCurriculums([]);
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurriculum = async () => {
    try {
      if (editingCurriculum) {
        // Update existing curriculum
        await update(dbref(database, `/curriculumDetails/${editingCurriculum.referenceId}/${editingCurriculum.id}`), {
          ...curriculumForm,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.user?.uid || 'curriculum-developer'
        });
        toast.success('Curriculum updated successfully!');
      } else {
        // Create new curriculum
        const curriculumId = push(dbref(database, '/curriculumDetails/temp')).key;
        await update(dbref(database, `/curriculumDetails/temp/${curriculumId}`), {
          ...curriculumForm,
          id: curriculumId,
          createdAt: new Date().toISOString(),
          createdBy: user?.user?.uid || 'curriculum-developer',
          status: 'draft'
        });
        toast.success('Curriculum created successfully!');
      }

      setShowCurriculumForm(false);
      setEditingCurriculum(null);
      resetCurriculumForm();
      fetchCurriculums();
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error('Failed to save curriculum');
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        // Update existing event
        await update(dbref(database, `/calendarEvents/${editingEvent.id}`), {
          ...eventForm,
          updatedAt: new Date().toISOString()
        });
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        const eventId = push(dbref(database, '/calendarEvents/')).key;
        await update(dbref(database, `/calendarEvents/${eventId}`), {
          ...eventForm,
          id: eventId,
          createdAt: new Date().toISOString(),
          createdBy: user?.user?.uid || 'curriculum-developer'
        });
        toast.success('Event created successfully!');
      }

      setShowEventForm(false);
      setEditingEvent(null);
      resetEventForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDeleteCurriculum = async (curriculum) => {
    if (window.confirm('Are you sure you want to delete this curriculum?')) {
      try {
        await remove(dbref(database, `/curriculumDetails/${curriculum.referenceId}/${curriculum.id}`));
        toast.success('Curriculum deleted successfully!');
        fetchCurriculums();
      } catch (error) {
        console.error('Error deleting curriculum:', error);
        toast.error('Failed to delete curriculum');
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await remove(dbref(database, `/calendarEvents/${eventId}`));
        toast.success('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const resetCurriculumForm = () => {
    setCurriculumForm({
      title: '',
      code: '',
      description: '',
      department: '',
      semester: '',
      credits: '',
      objectives: '',
      outcomes: '',
      syllabus: '',
      duration: '4'
    });
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'planning',
      curriculumId: '',
      tasks: [],
      googleMeetLink: '',
      googleCalendarLink: ''
    });
  };

  const handleEditCurriculum = (curriculum) => {
    setEditingCurriculum(curriculum);
    setCurriculumForm({
      title: curriculum.title || '',
      code: curriculum.code || '',
      description: curriculum.description || '',
      department: curriculum.department || '',
      semester: curriculum.semester || '',
      credits: curriculum.credits || '',
      objectives: curriculum.objectives || '',
      outcomes: curriculum.outcomes || '',
      syllabus: curriculum.syllabus || '',
      duration: curriculum.duration || '4'
    });
    setShowCurriculumForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      type: event.type || 'planning',
      curriculumId: event.curriculumId || '',
      tasks: event.tasks || [],
      googleMeetLink: event.googleMeetLink || '',
      googleCalendarLink: event.googleCalendarLink || ''
    });
    setShowEventForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'planning': return '#3B82F6';
      case 'development': return '#10B981';
      case 'review': return '#F59E0B';
      case 'deadline': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="curriculum-developer-loading">
        <div className="loading-spinner"></div>
        <p>Loading Curriculum Developer Portal...</p>
      </div>
    );
  }

  return (
    <div className="curriculum-developer-portal">
      {/* Header */}
      <div className="portal-header">
        <button onClick={onBack} className="back-button">
          <FaArrowLeft /> Back to Role Selection
        </button>
        <button
          onClick={() => window.location.href = 'mailto:prithwi.vibecode26@gmail.com'}
          className="support-btn"
        >
          <FaEnvelope /> Support
        </button>
        <h1>Curriculum Developer Portal</h1>
        <p>Design and manage curriculum courses with integrated planning</p>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="portal-content">
        {activeTab === 'curriculum' && (
          <div className="curriculum-section">
            <div className="section-header">
              <h2>Curriculum Management</h2>
              <button
                onClick={() => {
                  setEditingCurriculum(null);
                  resetCurriculumForm();
                  setShowCurriculumForm(true);
                }}
                className="add-button"
              >
                <FaPlus /> Add New Curriculum
              </button>
            </div>

            <div className="curriculum-grid">
              {curriculums.length === 0 ? (
                <div className="no-data-message">
                  <p>No curriculums found. Click "Add New Curriculum" to get started.</p>
                </div>
              ) : (
                curriculums.map(curriculum => (
                  <div key={curriculum.id} className="curriculum-card">
                    <div className="curriculum-header">
                      <h3>{curriculum.title}</h3>
                      <div className="curriculum-actions">
                        <button onClick={() => handleEditCurriculum(curriculum)} className="edit-btn">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteCurriculum(curriculum)} className="delete-btn">
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="curriculum-details">
                      <p><strong>Code:</strong> {curriculum.code}</p>
                      <p><strong>Department:</strong> {curriculum.department}</p>
                      <p><strong>Semester:</strong> {curriculum.semester}</p>
                      <p><strong>Credits:</strong> {curriculum.credits}</p>
                      <p><strong>Duration:</strong> {curriculum.duration} years</p>
                    </div>

                    {curriculum.description && (
                      <div className="curriculum-description">
                        <p>{curriculum.description}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="calendar-section">
            <div className="section-header">
              <h2>Calendar & Planning</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  resetEventForm();
                  setShowEventForm(true);
                }}
                className="add-button"
              >
                <FaPlus /> Schedule Event
              </button>
            </div>

            <div className="events-list">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-type" style={{ backgroundColor: getEventTypeColor(event.type) }}>
                      {event.type}
                    </div>
                    <div className="event-actions">
                      <button onClick={() => handleEditEvent(event)} className="edit-btn">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>

                    <div className="event-details">
                      <div className="event-detail">
                        <FaCalendarAlt />
                        <span>{formatDate(event.date)}</span>
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
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>Task Management</h2>
              <p>Manage curriculum development tasks and timelines</p>
            </div>

            <div className="tasks-overview">
              <div className="task-stats">
                <div className="stat-card">
                  <h3>{curriculums.length}</h3>
                  <p>Total Curriculums</p>
                </div>
                <div className="stat-card">
                  <h3>{events.length}</h3>
                  <p>Scheduled Events</p>
                </div>
                <div className="stat-card">
                  <h3>{events.filter(e => new Date(e.date) > new Date()).length}</h3>
                  <p>Upcoming Events</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Form Modal */}
      {showCurriculumForm && (
        <div className="modal-overlay">
          <div className="modal-content curriculum-modal">
            <div className="modal-header">
              <h2>{editingCurriculum ? 'Edit Curriculum' : 'Add New Curriculum'}</h2>
              <button onClick={() => setShowCurriculumForm(false)} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveCurriculum(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={curriculumForm.title}
                      onChange={(e) => setCurriculumForm({...curriculumForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Code *</label>
                    <input
                      type="text"
                      value={curriculumForm.code}
                      onChange={(e) => setCurriculumForm({...curriculumForm, code: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={curriculumForm.description}
                    onChange={(e) => setCurriculumForm({...curriculumForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={curriculumForm.department}
                      onChange={(e) => setCurriculumForm({...curriculumForm, department: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input
                      type="text"
                      value={curriculumForm.semester}
                      onChange={(e) => setCurriculumForm({...curriculumForm, semester: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Credits</label>
                    <input
                      type="number"
                      value={curriculumForm.credits}
                      onChange={(e) => setCurriculumForm({...curriculumForm, credits: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Years)</label>
                    <select
                      value={curriculumForm.duration}
                      onChange={(e) => setCurriculumForm({...curriculumForm, duration: e.target.value})}
                    >
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="4">4 Years</option>
                      <option value="5">5 Years</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Learning Objectives</label>
                  <textarea
                    value={curriculumForm.objectives}
                    onChange={(e) => setCurriculumForm({...curriculumForm, objectives: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Learning Outcomes</label>
                  <textarea
                    value={curriculumForm.outcomes}
                    onChange={(e) => setCurriculumForm({...curriculumForm, outcomes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Syllabus Overview</label>
                  <textarea
                    value={curriculumForm.syllabus}
                    onChange={(e) => setCurriculumForm({...curriculumForm, syllabus: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCurriculumForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingCurriculum ? 'Update' : 'Create'} Curriculum
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content event-modal">
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Schedule New Event'}</h2>
              <button onClick={() => setShowEventForm(false)} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                    >
                      <option value="planning">Planning</option>
                      <option value="development">Development</option>
                      <option value="review">Review</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Related Curriculum</label>
                  <select
                    value={eventForm.curriculumId}
                    onChange={(e) => setEventForm({...eventForm, curriculumId: e.target.value})}
                  >
                    <option value="">Select Curriculum</option>
                    {curriculums.map(curriculum => (
                      <option key={curriculum.id} value={curriculum.id}>
                        {curriculum.title} ({curriculum.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Google Meet Link</label>
                  <input
                    type="url"
                    value={eventForm.googleMeetLink}
                    onChange={(e) => setEventForm({...eventForm, googleMeetLink: e.target.value})}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="form-group">
                  <label>Google Calendar Link</label>
                  <input
                    type="url"
                    value={eventForm.googleCalendarLink}
                    onChange={(e) => setEventForm({...eventForm, googleCalendarLink: e.target.value})}
                    placeholder="https://calendar.google.com/..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEventForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingEvent ? 'Update' : 'Schedule'} Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumDeveloperPortal;
