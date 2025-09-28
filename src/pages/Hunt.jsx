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
  const [teamName, setTeamName] = useState('');
  const [currentHint, setCurrentHint] = useState(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [showPuzzleInput, setShowPuzzleInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [teamAvatar, setTeamAvatar] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchProgress = useCallback(async () => {
    try {
      const progressData = await api.getProgress();
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, []);

  const fetchHint = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getHint();
      setCurrentHint(response);
      setShowPuzzleInput(false);
      setCurrentQuestion('');
      setPuzzleAnswer('');
      setErrors({});
      setSuccessMessage('');
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
    setTeamName(user.teamName);
    // Initialize avatar with saved preference or team name as seed
    const savedAvatar = localStorage.getItem('teamAvatar');
    setTeamAvatar(savedAvatar || user.teamName);
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
      const response = await api.submitCode(code.trim());
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
          <span className="team-name jersey-15-regular">Team: {teamName}</span>
        </div>
        <div className="header-right">
          <div className="profile-dropdown">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
              className="profile-button"
            >
              <Avatar 
                seed={teamAvatar || teamName} 
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
            <h2 className="jersey-15-regular"><FaStar /> Adventure Status</h2>
            <div className="puzzle-text" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}>
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
                  <h2 className="jersey-15-regular">Location Hint #{progress.completed + 1}</h2>
                  <div className="puzzle-text">
                    {currentHint?.hint || 'Loading puzzle...'}
                  </div>
                </section>

                {/* QR Scanner Section */}
                <section className="submit-section">
                  <h2 className="jersey-15-regular"><FaQrcode /> Scan QR Code</h2>
                  <p className="jersey-15-regular">Scan the QR code at the location to unlock the puzzle</p>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <QrScannerComponent
                      isScannerOpen={isScannerOpen}
                      setIsScannerOpen={setIsScannerOpen}
                      onScanned={handleQrScanned}
                    />
                  </div>
                </section>
              </>
            )}

            {/* Puzzle Answer Section - Only shows after correct code submission */}
            {showPuzzleInput && (
              <section className="answer-section">
                <form onSubmit={handlePuzzleAnswerSubmit} className="answer-form">
                  <h2 className="jersey-15-regular"><FaLightbulb /> Answer the Puzzle</h2>
                  <div className="question-image-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    {currentQuestion && (
                      <img 
                        src={`/${currentQuestion}`} 
                        alt="Puzzle Question" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', currentQuestion);
                          e.target.style.display = 'none';
                        }}
                      />
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
          currentSeed={teamAvatar || teamName}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  );
};

export default Hunt;
