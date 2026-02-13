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
  const [team_name, setteam_name] = useState('');
  const [step, setStep] = useState('location'); // location, question, winner
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleQRScan = async (code) => {
    console.log('[BonusQuestion] handleQRScan input:', code);
    setShowScanner(false);
    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      const sanitizedCode = (code || '').trim();
      console.log('[BonusQuestion] Sanitized code:', sanitizedCode);
      const startTs = performance.now();
      await onLocationScanned(sanitizedCode);
      console.log('[BonusQuestion] Scan validated OK in', (performance.now() - startTs).toFixed(1), 'ms');
      setStep('question');
      setSuccessMessage('Location code accepted! Now solve the puzzle below.');
    } catch (error) {
      console.error('[BonusQuestion] Scan validation failed:', error);
      setErrors({ location: error?.message || 'Invalid location code' });
      setStep('location');
    } finally {
      setLoading(false);
    }
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
    if (!leaderName.trim() || !team_name.trim()) {
      setErrors({
        leaderName: !leaderName.trim() ? 'Leader name is required' : '',
        team_name: !team_name.trim() ? 'Team name is required' : ''
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onWinnerSubmitted(leaderName, team_name);
      setSuccessMessage('Congratulations! Your submission has been recorded.');
      // Reset form for next submission
      setTimeout(() => {
        setAnswer('');
        setLeaderName('');
        setteam_name('');
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
          <h1 className="bonus-question-title">🎯 Bonus Round {roundId}</h1>

          {/* Location Hint Section */}
          <section className="hint-section">
            <h2 className=""><FaLightbulb /> Location Hint</h2>
            <div className="puzzle-text">
              {locationHint}
            </div>
          </section>

          {/* QR Scanner Section - Same as main hunt */}
          <section className="submit-section">
            <h2 className=""><FaQrcode /> Scan QR Code</h2>
            <p className="">Scan the QR code at the location to unlock the puzzle</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <QrScannerComponent
                isScannerOpen={showScanner}
                setIsScannerOpen={setShowScanner}
                onScanned={handleQRScan}
              />
            </div>
            {errors.location && (
              <div className="error-message" style={{ marginTop: 12 }}>
                {errors.location}
              </div>
            )}
            {loading && (
              <div className="" style={{ color: 'var(--text-muted)', marginTop: 8 }}>Validating...</div>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (step === 'question') {
    return (
      <div className="bonus-question-container">
        <div className="bonus-question-content">
          <h1 className="bonus-question-title">🎯 Bonus Round {roundId}</h1>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="question-section">
            <h2 className="question-title">Solve the Puzzle</h2>
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
              <label className="form-label">Your Answer:</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="form-input"
                placeholder="Enter your answer..."
                disabled={loading}
              />
              {errors.answer && (
                <div className="error-message">{errors.answer}</div>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
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
          <h1 className="bonus-question-title">🎉 Congratulations!</h1>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleWinnerSubmit} className="winner-form">
            <div className="form-group">
              <label className="form-label">Leader Name:</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="form-input"
                placeholder="Enter leader name..."
                disabled={loading}
              />
              {errors.leaderName && (
                <div className="error-message">{errors.leaderName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Team Name:</label>
              <input
                type="text"
                value={team_name}
                onChange={(e) => setteam_name(e.target.value)}
                className="form-input"
                placeholder="Enter team name..."
                disabled={loading}
              />
              {errors.team_name && (
                <div className="error-message">{errors.team_name}</div>
              )}
            </div>

            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}

            <button
              type="submit"
              className="submit-button"
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
