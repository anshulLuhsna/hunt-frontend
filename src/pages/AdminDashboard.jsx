import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [bonusRounds, setBonusRounds] = useState([]);
  const [timings, setTimings] = useState([]);
  const [timingStatus, setTimingStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingTiming, setEditingTiming] = useState(null);
  const navigate = useNavigate();

  // Form state for new/editing question
  const [questionForm, setQuestionForm] = useState({
    hint: '',
    code: '',
    question: '',
    answer: '',
    question_image: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsData, teamsData, sequencesData, timingsData, timingStatusData] = await Promise.all([
        api.getAdminQuestions(),
        api.getAdminTeams(),
        api.getTeamSequences(),
        api.getAdminTimings(),
        api.getAdminTimingStatus()
      ]);
      setQuestions(questionsData);
      setTeams(teamsData);
      setSequences(sequencesData);
      setTimings(timingsData);
      setTimingStatus(timingStatusData);

      // Fetch bonus round data
      const [bonus1Data, bonus2Data] = await Promise.all([
        api.getBonusStatus(1).catch(() => null),
        api.getBonusStatus(2).catch(() => null)
      ]);
      setBonusRounds([bonus1Data, bonus2Data].filter(Boolean));
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    // Debug: Log the form data being sent
    console.log('Form data being sent:', questionForm);

    // Validate form data before sending
    if (!questionForm.hint || !questionForm.code || !questionForm.question || !questionForm.answer || !questionForm.question_image) {
      setError('All fields are required');
      return;
    }

    try {
      if (editingQuestion) {
        // Remove id from form data before sending
        const { id, ...formData } = questionForm;
        await api.updateAdminQuestion(editingQuestion.id, formData);
      } else {
        await api.addAdminQuestion(questionForm);
      }
      setQuestionForm({ hint: '', code: '', question: '', answer: '', question_image: '' });
      setEditingQuestion(null);
      setError(''); // Clear any previous errors
      fetchData();
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteAdminQuestion(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.deleteAdminTeam(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete team');
    }
  };

  const handleResetTeam = async (id) => {
    if (!window.confirm('Are you sure you want to reset this team\'s progress?')) return;
    try {
      await api.resetAdminTeamProgress(id);
      fetchData();
    } catch (err) {
      setError('Failed to reset team progress');
    }
  };

  const handleRegenerateSequences = async () => {
    if (!window.confirm('Are you sure you want to regenerate ALL team sequences? This will affect all teams.')) return;
    try {
      await api.regenerateAllSequences();
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to regenerate sequences');
    }
  };

  const handleEndBonusRound = async (roundId) => {
    if (!window.confirm(`Are you sure you want to end Bonus Round ${roundId}? This action cannot be undone.`)) return;
    try {
      await api.endBonusRound(roundId);
      setError('');
      fetchData();
    } catch (err) {
      setError(`Failed to end Bonus Round ${roundId}`);
    }
  };

  // Timing management functions
  const handleUpdateTiming = async (eventName, newStartTime) => {
    try {
      console.log('Frontend - Updating timing:', { eventName, newStartTime });
      console.log('Frontend - Event name type:', typeof eventName);
      console.log('Frontend - Start time type:', typeof newStartTime);

      await api.updateAdminTiming(eventName, newStartTime);
      setError('');
      fetchData(); // Refresh all data including timing status
    } catch (err) {
      const displayName = eventName === 'bonus1' ? 'Bonus Round 1' : eventName;
      setError(`Failed to update ${displayName} timing`);
      console.error('Timing update error:', err);
    }
  };

  const handleStartNow = async (eventName) => {
    const now = new Date();
    try {
      await handleUpdateTiming(eventName, now.toISOString());
      // Force reload the page to ensure timing updates are applied
      window.location.reload();
    } catch (error) {
      console.error('Error starting event:', error);
      // Still reload to get fresh state
      window.location.reload();
    }
  };

  const handleStartInMinutes = async (eventName, minutes) => {
    const futureTime = new Date(Date.now() + minutes * 60 * 1000);
    try {
      await handleUpdateTiming(eventName, futureTime.toISOString());
      // Force reload the page to ensure timing updates are applied
      window.location.reload();
    } catch (error) {
      console.error('Error setting timing:', error);
      // Still reload to get fresh state
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button
          className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button
          className={`tab-button ${activeTab === 'sequences' ? 'active' : ''}`}
          onClick={() => setActiveTab('sequences')}
        >
          Sequences
        </button>
        <button
          className={`tab-button ${activeTab === 'bonus' ? 'active' : ''}`}
          onClick={() => setActiveTab('bonus')}
        >
          Bonus Rounds
        </button>
        <button
          className={`tab-button ${activeTab === 'timings' ? 'active' : ''}`}
          onClick={() => setActiveTab('timings')}
        >
          Timing Control
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="questions-section">
          <form onSubmit={handleQuestionSubmit} className="question-form">
            <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Hint"
                value={questionForm.hint}
                onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Location Code"
                value={questionForm.code}
                onChange={(e) => setQuestionForm({ ...questionForm, code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Answer"
                value={questionForm.answer}
                onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Question Image (e.g., 1.png)"
                value={questionForm.question_image}
                onChange={(e) => setQuestionForm({ ...questionForm, question_image: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              {editingQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setQuestionForm({ hint: '', code: '', question: '', answer: '' });
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="questions-list">
            <h2>Questions List</h2>
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question-content">
                  <h3>Question {q.id}</h3>
                  <p><strong>Hint:</strong> {q.hint}</p>
                  <p><strong>Code:</strong> {q.code}</p>
                  <p><strong>Question:</strong> {q.question}</p>
                  <p><strong>Answer:</strong> {q.answer}</p>
                  <p><strong>Image:</strong> {q.question_image || 'None'}</p>
                </div>
                <div className="question-actions">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      // Only set the form fields, not the id
                      setQuestionForm({
                        hint: q.hint,
                        code: q.code,
                        question: q.question,
                        answer: q.answer,
                        question_image: q.question_image || ''
                      });
                    }}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="teams-section">
          <h2>Teams List</h2>
          <div className="teams-list">
            {teams.map((team) => (
              <div key={team.id} className="team-card">
                <div className="team-content">
                  <h3>{team.team_name}</h3>
                  <p><strong>Score:</strong> {team.score}</p>
                  <p><strong>Completed Locations:</strong> {team.completed_locations}</p>
                </div>
                <div className="team-actions">
                  <button
                    onClick={() => handleResetTeam(team.id)}
                    className="reset-button"
                  >
                    Reset Progress
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="delete-button"
                  >
                    Delete Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sequences' && (
        <div className="sequences-section">
          <div className="sequences-header">
            <h2>Team Sequences</h2>
            <button
              onClick={handleRegenerateSequences}
              className="regenerate-button"
            >
              Regenerate All Sequences
            </button>
          </div>
          <div className="sequences-list">
            {sequences.map((team) => (
              <div key={team.id} className="sequence-card">
                <div className="sequence-content">
                  <h3>{team.team_name}</h3>
                  <p><strong>Current Score:</strong> {team.score}/16</p>
                  <div className="sequence-display">
                    <strong>Sequence:</strong>
                    <div className="sequence-numbers">
                      {team.sequence && team.sequence.map((locationId, index) => (
                        <span
                          key={index}
                          className={`sequence-number ${index < team.score ? 'completed' :
                            index === team.score ? 'current' : 'pending'
                            }`}
                        >
                          {locationId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bonus' && (
        <div className="bonus-section">
          <h2>Bonus Rounds Management</h2>
          <div className="bonus-rounds-list">
            {bonusRounds.map((round, index) => (
              <div key={round.id || index} className="bonus-round-card">
                <div className="bonus-round-header">
                  <h3>Bonus Round {round.id || index + 1}</h3>
                  <div className="bonus-round-status">
                    <span className={`status-badge ${round.isEnded ? 'ended' : round.isStarted ? 'active' : 'pending'}`}>
                      {round.isEnded ? 'Ended' : round.isStarted ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="bonus-round-details">
                  <p><strong>Start Time:</strong> {new Date(round.start_time).toLocaleString()}</p>
                  <p><strong>Location Code:</strong> {round.location_code}</p>
                  <p><strong>Question Image:</strong> {round.question_image}</p>
                  {round.ended_at && (
                    <p><strong>Ended At:</strong> {new Date(round.ended_at).toLocaleString()}</p>
                  )}
                </div>

                <div className="bonus-round-actions">
                  {!round.isEnded && round.isStarted && (
                    <button
                      onClick={() => handleEndBonusRound(round.id || index + 1)}
                      className="end-bonus-button"
                    >
                      End Bonus Round
                    </button>
                  )}
                  {round.isEnded && (
                    <button
                      onClick={() => window.open(`/bonus${round.id || index + 1}`, '_blank')}
                      className="view-leaderboard-button"
                    >
                      View Leaderboard
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timings' && (
        <div className="timings-section">
          <h2>Timing Control Center</h2>
          <p className="timing-description">Control when each event starts. Changes take effect immediately.</p>

          <div className="timing-controls">
            {timings.map((timing) => {
              const status = timingStatus[timing.event_name];
              const isStarted = status?.isStarted || false;
              const timeUntilStart = status?.timeUntilStartFormatted || 'Unknown';

              return (
                <div key={timing.id} className="timing-card">
                  <div className="timing-header">
                    <h3>
                      {timing.event_name === 'bonus1' ? 'Bonus Round 1' :
                        timing.event_name === 'bonus2' ? 'Bonus Round 2' :
                          'Main Hunt'}
                    </h3>
                    <div className="timing-status">
                      <span className={`status-badge ${isStarted ? 'started' : 'pending'}`}>
                        {isStarted ? 'Started' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="timing-details">
                    <p><strong>Start Time (IST):</strong> {new Date(timing.start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    <p><strong>Status:</strong> {isStarted ? 'Active' : `Starts in ${timeUntilStart}`}</p>
                  </div>

                  <div className="timing-actions">
                    <div className="quick-actions">
                      <button
                        onClick={() => handleStartNow(timing.event_name)}
                        className="action-button start-now"
                        disabled={isStarted}
                      >
                        Start Now
                      </button>
                      <button
                        onClick={() => handleStartInMinutes(timing.event_name, 5)}
                        className="action-button start-5min"
                        disabled={isStarted}
                      >
                        Start in 5 min
                      </button>
                      <button
                        onClick={() => handleStartInMinutes(timing.event_name, 30)}
                        className="action-button start-30min"
                        disabled={isStarted}
                      >
                        Start in 30 min
                      </button>
                    </div>

                    <div className="custom-timing">
                      <input
                        type="datetime-local"
                        className="timing-input"
                        id={`timing-input-${timing.event_name}`}
                      />
                      <button
                        onClick={async () => {
                          const input = document.getElementById(`timing-input-${timing.event_name}`);
                          if (input && input.value) {
                            try {
                              await handleUpdateTiming(timing.event_name, new Date(input.value).toISOString());
                              // Force reload the page to ensure timing updates are applied
                              window.location.reload();
                            } catch (error) {
                              console.error('Error setting custom timing:', error);
                              // Still reload to get fresh state
                              window.location.reload();
                            }
                          }
                        }}
                        className="action-button custom-time"
                      >
                        Set Custom Time
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
