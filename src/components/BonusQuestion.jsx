import { useState } from 'react';
import { FaQrcode, FaCamera, FaCheck, FaLightbulb } from 'react-icons/fa';
import QrScannerComponent from './QRScanner';
import './BonusQuestion.css';

const BonusQuestion = ({ 
  roundId, 
  locationHint, 
  questionImage, 
  onLocationScanned, 
  onAnswerSubmitted,
  onWinnerSubmitted 
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [answer, setAnswer] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [step, setStep] = useState('location'); // location, question, winner
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleQRScan = (code) => {
    setShowScanner(false);
    onLocationScanned(code);
    setStep('question');
    setSuccessMessage('Location code accepted! Now solve the puzzle below.');
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setErrors({ answer: 'Answer is required' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onAnswerSubmitted(answer);
      setStep('winner');
      setSuccessMessage('Correct answer! Please enter your details below.');
    } catch (error) {
      setErrors({ answer: error.message || 'Incorrect answer' });
    } finally {
      setLoading(false);
    }
  };

  const handleWinnerSubmit = async (e) => {
    e.preventDefault();
    if (!leaderName.trim() || !teamName.trim()) {
      setErrors({ 
        leaderName: !leaderName.trim() ? 'Leader name is required' : '',
        teamName: !teamName.trim() ? 'Team name is required' : ''
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onWinnerSubmitted(leaderName, teamName);
      setSuccessMessage('Congratulations! Your submission has been recorded.');
      // Reset form for next submission
      setTimeout(() => {
        setAnswer('');
        setLeaderName('');
        setTeamName('');
        setStep('question');
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrors({ general: error.message || 'Failed to submit winner info' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'location') {
    return (
      <div className="bonus-question-container">
        <div className="bonus-question-content">
          <h1 className="bonus-question-title jersey-15-regular">🎯 Bonus Round {roundId}</h1>
          
          {/* Location Hint Section */}
          <section className="hint-section">
            <h2 className="jersey-15-regular"><FaLightbulb /> Location Hint</h2>
            <div className="puzzle-text">
              {locationHint}
            </div>
          </section>

          {/* QR Scanner Section - Same as main hunt */}
          <section className="submit-section">
            <h2 className="jersey-15-regular"><FaQrcode /> Scan QR Code</h2>
            <p className="jersey-15-regular">Scan the QR code at the location to unlock the puzzle</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <QrScannerComponent 
                isScannerOpen={showScanner}
                setIsScannerOpen={setShowScanner}
                onScanned={handleQRScan}
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (step === 'question') {
    return (
      <div className="bonus-question-container">
        <div className="bonus-question-content">
          <h1 className="bonus-question-title jersey-15-regular">🎯 Bonus Round {roundId}</h1>
          
          {successMessage && (
            <div className="success-message jersey-15-regular">
              {successMessage}
            </div>
          )}

          <div className="question-section">
            <h2 className="question-title jersey-15-regular">Solve the Puzzle</h2>
            <img 
              src={`/${questionImage}`} 
              alt="Bonus Question" 
              className="question-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <form onSubmit={handleAnswerSubmit} className="answer-form">
            <div className="form-group">
              <label className="form-label jersey-15-regular">Your Answer:</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="form-input jersey-15-regular"
                placeholder="Enter your answer..."
                disabled={loading}
              />
              {errors.answer && (
                <div className="error-message jersey-15-regular">{errors.answer}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button jersey-15-regular"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'winner') {
    return (
      <div className="bonus-question-container">
        <div className="bonus-question-content">
          <h1 className="bonus-question-title jersey-15-regular">🎉 Congratulations!</h1>
          
          {successMessage && (
            <div className="success-message jersey-15-regular">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleWinnerSubmit} className="winner-form">
            <div className="form-group">
              <label className="form-label jersey-15-regular">Leader Name:</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="form-input jersey-15-regular"
                placeholder="Enter leader name..."
                disabled={loading}
              />
              {errors.leaderName && (
                <div className="error-message jersey-15-regular">{errors.leaderName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label jersey-15-regular">Team Name:</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="form-input jersey-15-regular"
                placeholder="Enter team name..."
                disabled={loading}
              />
              {errors.teamName && (
                <div className="error-message jersey-15-regular">{errors.teamName}</div>
              )}
            </div>

            {errors.general && (
              <div className="error-message jersey-15-regular">{errors.general}</div>
            )}
            
            <button 
              type="submit" 
              className="submit-button jersey-15-regular"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Winner Info'}
            </button>
          </form>
        </div>
      </div>
    );
  }
};

export default BonusQuestion;
