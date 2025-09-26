import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const navigate = useNavigate();

  // Form state for new/editing question
  const [questionForm, setQuestionForm] = useState({
    hint: '',
    code: '',
    question: '',
    answer: ''
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
      const [questionsData, teamsData] = await Promise.all([
        api.getAdminQuestions(),
        api.getAdminTeams()
      ]);
      setQuestions(questionsData);
      setTeams(teamsData);
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
    if (!questionForm.hint || !questionForm.code || !questionForm.question || !questionForm.answer) {
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
      setQuestionForm({ hint: '', code: '', question: '', answer: '' });
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
                onChange={(e) => setQuestionForm({...questionForm, hint: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Location Code"
                value={questionForm.code}
                onChange={(e) => setQuestionForm({...questionForm, code: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Answer"
                value={questionForm.answer}
                onChange={(e) => setQuestionForm({...questionForm, answer: e.target.value})}
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
                  <h3>Location {q.id}</h3>
                  <p><strong>Hint:</strong> {q.hint}</p>
                  <p><strong>Code:</strong> {q.code}</p>
                  <p><strong>Question:</strong> {q.question}</p>
                  <p><strong>Answer:</strong> {q.answer}</p>
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
                        answer: q.answer
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
    </div>
  );
};

export default AdminDashboard;
