import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Hunt.css';
import QrScannerComponent from '../components/QRScanner';
import Avatar from '../components/Avatar';
import AvatarSelector from '../components/AvatarSelector';
import { FaTrophy, FaQrcode, FaLightbulb, FaStar, FaCamera, FaCheckCircle, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

const Hunt = () => {
  const [team_name, setteam_name] = useState('');
  const [currentHint, setCurrentHint] = useState(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [showPuzzleInput, setShowPuzzleInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [teamAvatar, setTeamAvatar] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchProgress = useCallback(async () => {
    try {
      const progressData = await api.getProgress();
      setProgress(progressData);

      // Also fetch current question number from leaderboard API
      try {
        const rankData = await api.getCurrentTeamRank();
        setCurrentQuestionNumber(rankData.score + 1); // Next question to solve
      } catch (error) {
        console.error('Error fetching current question number:', error);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, []);

  const fetchHint = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getHint();
      setCurrentHint(response);

      // If location is already scanned, show the question directly
      if (response.alreadyScanned) {
        setShowPuzzleInput(true);
        // Get the question for current step
        try {
          const questionResponse = await api.getQuestion();
          setCurrentQuestion(questionResponse.question);
          setSuccessMessage('Location already scanned! Answer the puzzle below.');
        } catch (questionError) {
          console.error('Error fetching question:', questionError);
        }
      } else {
        setShowPuzzleInput(false);
        setCurrentQuestion(null);
        setPuzzleAnswer('');
        setErrors({});
        setSuccessMessage('');
      }

      await fetchProgress();
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
  }, [fetchProgress]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setteam_name(user.team_name);
    // Initialize avatar with saved preference or team name as seed
    const savedAvatar = localStorage.getItem('teamAvatar');
    setTeamAvatar(savedAvatar || user.team_name);

    fetchHint();
    fetchProgress();
  }, [user, navigate, fetchHint, fetchProgress]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const submitLocationCode = async (code) => {
    if (!code || !code.trim()) {
      setErrors({ locationCode: 'Location code is required' });
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      setSuccessMessage(''); // Clear previous success messages

      const response = await api.submitCode(code.trim());

      // Close QR scanner
      setIsScannerOpen(false);

      setCurrentQuestion(response.question);
      setShowPuzzleInput(true);

      // Show different message based on whether location was already scanned
      if (response.alreadyScanned) {
        setSuccessMessage('Location already scanned! Answer the puzzle below.');
      } else {
        setSuccessMessage('Code accepted! Answer the puzzle below.');
      }
    } catch (error) {
      console.error('Error submitting code:', error);

      // Simple error message without exposing the code
      setErrors({
        locationCode: 'Wrong QR'
      });

      // Close scanner on error too
      setIsScannerOpen(false);
    } finally {
      setLoading(false);
    }
  };


  const handleQrScanned = async (scanned) => {
    await submitLocationCode(scanned);
  };

  const handleAvatarSelect = async (newAvatarSeed) => {
    try {
      setTeamAvatar(newAvatarSeed);
      localStorage.setItem('teamAvatar', newAvatarSeed);
      // Update avatar in backend database
      await api.updateAvatar(newAvatarSeed);
    } catch (error) {
      console.error('Error updating avatar:', error);
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

      // Reset puzzle input and clear form
      setShowPuzzleInput(false);
      setPuzzleAnswer('');
      setErrors({});

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
          <button onClick={() => navigate('/leaderboard')} className="leaderboard-button">
            <FaTrophy /> Leaderboard
          </button>
        </div>
        <div className="header-center">
          <span className="team-name">Team: {team_name}</span>
          {currentQuestionNumber && (
            <span className="question-number" style={{
              marginTop: '5px',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              Question #{currentQuestionNumber}
            </span>
          )}
        </div>
        <div className="header-right">
          <div className="profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="profile-button"
            >
              <Avatar
                seed={teamAvatar || team_name}
                size={35}
                className="profile-avatar"
              />
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setShowAvatarSelector(true);
                    setShowProfileDropdown(false);
                  }}
                  className="dropdown-item"
                >
                  <FaCog /> Change Avatar
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="dropdown-item"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
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
            background: 'rgba(0, 230, 118, 0.1)',
            color: 'var(--accent-green)',
            padding: '15px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(0, 230, 118, 0.2)',
            border: '1px solid var(--accent-green)'
          }}>
            {successMessage}
          </div>
        )}


        {currentHint && currentHint.msg ? (
          <section className="puzzle-section">
            <h2 className=""><FaStar /> Adventure Status</h2>
            <div className="puzzle-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              {currentHint.msg}
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="submit-code-button"
              style={{ marginTop: '20px' }}
            >
              <FaTrophy /> View Leaderboard
            </button>
          </section>
        ) : (
          <>
            {/* Show location hint and QR scanner only when puzzle input is NOT shown */}
            {!showPuzzleInput && (
              <>
                {/* Puzzle Section */}
                <section className="puzzle-section">
                  <h2>Location Hint #{progress.completed + 1}</h2>
                  <div className="puzzle-text">
                    {currentHint?.hint || 'Loading puzzle...'}
                  </div>
                </section>

                {/* QR Scanner Section */}
                <section className="submit-section">
                  <h2><FaQrcode /> Scan QR Code</h2>
                  <p>Scan the QR code at the location to unlock the puzzle</p>

                  {/* Loading indicator */}
                  {loading && (
                    <div className="loading-indicator" style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: 'var(--accent-orange)',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      <div style={{ marginBottom: '10px' }}>🔄 Processing QR code...</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Please wait while we verify your location
                      </div>
                    </div>
                  )}

                  {/* Error message for location code */}
                  {errors.locationCode && (
                    <div className="error-message" style={{
                      background: 'rgba(255, 69, 0, 0.1)',
                      color: 'var(--accent-orange)',
                      padding: '15px 20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      marginBottom: '20px',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px var(--accent-orange-glow)',
                      border: '1px solid var(--accent-orange)'
                    }}>
                      ❌ {errors.locationCode}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <QrScannerComponent
                      isScannerOpen={isScannerOpen}
                      setIsScannerOpen={setIsScannerOpen}
                      onScanned={handleQrScanned}
                    />
                  </div>

                  {/* Instructions */}
                  {!isScannerOpen && !loading && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '15px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      Click the camera icon to start scanning
                    </div>
                  )}

                </section>
              </>
            )}

            {/* Puzzle Answer Section - Only shows after correct code submission */}
            {showPuzzleInput && (
              <section className="answer-section">
                <form onSubmit={handlePuzzleAnswerSubmit} className="answer-form">
                  <h2><FaLightbulb /> Answer the Puzzle</h2>
                  <div className="question-content" style={{ marginBottom: '20px', textAlign: 'center' }}>

                    {/* 1. Question Text */}
                    {currentQuestion?.text && (
                      <div className="question-text" style={{
                        fontSize: '1.2rem',
                        marginBottom: '15px',
                        color: 'var(--text-primary)',
                        padding: '15px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        borderLeft: '4px solid var(--accent-orange)'
                      }}>
                        {currentQuestion.text}
                      </div>
                    )}

                    {/* 2. Question Image */}
                    {currentQuestion?.image ? (
                      <img
                        src={`/${currentQuestion.image}`}
                        alt="Puzzle Question"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          marginBottom: '15px'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', currentQuestion.image);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      !currentQuestion?.text && (
                        <div style={{
                          padding: '40px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          border: '2px dashed var(--border-color)',
                          color: 'var(--text-muted)'
                        }}>
                          <p>Loading question...</p>
                        </div>
                      )
                    )}

                    {/* 3. Question Link */}
                    {currentQuestion?.link && (
                      <div className="question-link" style={{ marginTop: '15px' }}>
                        <a
                          href={currentQuestion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: 'var(--accent-blue)',
                            color: 'white',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          🔗 Open Resource Link
                        </a>
                      </div>
                    )}
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
                    {loading ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </main>

      {showAvatarSelector && (
        <AvatarSelector
          currentSeed={teamAvatar || team_name}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  );
};

export default Hunt;
