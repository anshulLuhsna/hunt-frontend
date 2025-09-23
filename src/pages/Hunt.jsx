import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Hunt.css';

const Hunt = () => {
  const [teamName, setTeamName] = useState('');
  const [currentHint, setCurrentHint] = useState(null);
  const [locationCode, setLocationCode] = useState('');
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [showPuzzleInput, setShowPuzzleInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setTeamName(user.teamName);
    fetchHint();
  }, [user, navigate]);

  const fetchHint = async () => {
    try {
      setLoading(true);
      const response = await api.getHint();
      setCurrentHint(response);
      setShowPuzzleInput(false);
      setCurrentQuestion('');
      setLocationCode('');
      setPuzzleAnswer('');
      setErrors({});
      setSuccessMessage('');
    } catch (error) {
      console.error('Error fetching hint:', error);
      if (error.message.includes('Hunt completed')) {
        setCurrentHint({ msg: 'Congratulations! You have completed the treasure hunt!' });
      } else {
        setErrors({ general: 'Failed to fetch hint. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationCodeSubmit = async (e) => {
    e.preventDefault();
    if (!locationCode.trim()) {
      setErrors({ locationCode: 'Location code is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.submitCode(locationCode);
      setCurrentQuestion(response.question);
      setShowPuzzleInput(true);
      setErrors({});
      setSuccessMessage('Code accepted! Answer the puzzle below.');
    } catch (error) {
      console.error('Error submitting code:', error);
      setErrors({ locationCode: error.message || 'Invalid location code. Please check and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePuzzleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!puzzleAnswer.trim()) {
      setErrors({ puzzleAnswer: 'Puzzle answer is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.submitAnswer(puzzleAnswer);
      setSuccessMessage(response.msg);

      // Wait a moment then fetch the next hint
      setTimeout(() => {
        fetchHint();
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setErrors({ puzzleAnswer: error.message || 'Incorrect answer. Try again!' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !currentHint) {
    return (
      <div className="hunt-container">
        <div className="loading">Loading your adventure...</div>
      </div>
    );
  }

  return (
    <div className="hunt-container">
      <header className="hunt-header">
        <div className="header-left">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#FFD700"/>
              <path d="M20 10L25 18H15L20 10Z" fill="#2C3E50"/>
              <circle cx="20" cy="25" r="5" fill="#2C3E50"/>
            </svg>
          </div>
          <span className="team-name">Team: {teamName}</span>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a.5.5 0 00-.707-.707L10 11.086 6 7.086a.5.5 0 00-.707.707L9.293 12l-4 4a.5.5 0 00.707.707L10 12.707l4 4a.5.5 0 00.707-.707L10.707 12l4-4z"/>
            </svg>
          </button>
          <button onClick={() => navigate('/leaderboard')} className="leaderboard-button">
            🏆 Leaderboard
          </button>
        </div>
      </header>

      <main className="hunt-main">
        {errors.general && (
          <div className="error-message" style={{ textAlign: 'center', marginBottom: '20px' }}>
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{
            background: 'rgba(76, 175, 80, 0.2)',
            color: '#4CAF50',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {currentHint && currentHint.msg ? (
          <section className="puzzle-section">
            <h2>🎉 Adventure Status</h2>
            <div className="puzzle-text" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}>
              {currentHint.msg}
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="submit-code-button"
              style={{ marginTop: '20px' }}
            >
              🏆 View Leaderboard
            </button>
          </section>
        ) : (
          <>
            <section className="puzzle-section">
              <h2>🗺️ Current Location</h2>
              <div className="puzzle-text">
                {currentHint?.hint || 'Loading hint...'}
              </div>
            </section>

            <section className="submit-section">
              <form onSubmit={handleLocationCodeSubmit} className="location-form">
                <h2>📍 Submit Location Code</h2>
                <p>Enter the code found at the location</p>
                <div className="form-group">
                  <input
                    type="text"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    placeholder="Location code"
                    className={errors.locationCode ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.locationCode && <span className="error-message">{errors.locationCode}</span>}
                </div>
                <button type="submit" className="submit-code-button" disabled={loading}>
                  {loading ? 'Submitting...' : '🔓 Submit Code'}
                </button>
              </form>

              {showPuzzleInput && (
                <form onSubmit={handlePuzzleAnswerSubmit} className="answer-form">
                  <h2>💡 Answer the Puzzle</h2>
                  <div className="clue-text" style={{ marginBottom: '20px' }}>
                    {currentQuestion}
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      value={puzzleAnswer}
                      onChange={(e) => setPuzzleAnswer(e.target.value)}
                      placeholder="Your answer"
                      className={errors.puzzleAnswer ? 'error' : ''}
                      disabled={loading}
                    />
                    {errors.puzzleAnswer && <span className="error-message">{errors.puzzleAnswer}</span>}
                  </div>
                  <button type="submit" className="submit-answer-button" disabled={loading}>
                    {loading ? 'Submitting...' : '✨ Submit Answer'}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Hunt;
