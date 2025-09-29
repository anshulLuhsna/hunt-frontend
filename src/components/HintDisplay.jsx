import { FaLightbulb, FaClock, FaTimes } from 'react-icons/fa';
import './HintDisplay.css';

const HintDisplay = ({ 
  hintVisible, 
  currentHint, 
  timeSpent, 
  timeUntilHint, 
  formatTime, 
  hideHint 
}) => {
  if (!hintVisible || !currentHint) {
    return null;
  }

  return (
    <div className="hint-overlay">
      <div className="hint-modal">
        <div className="hint-header">
          <div className="hint-title">
            <FaLightbulb className="hint-icon" />
            <span>Hint Available!</span>
          </div>
          <button 
            className="hint-close-btn"
            onClick={hideHint}
            aria-label="Close hint"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="hint-content">
          <div className="hint-question">
            <strong>Question:</strong> {currentHint.question}
          </div>
          
          <div className="hint-text">
            <strong>Hint:</strong> {currentHint.hint}
          </div>
          
          <div className="hint-timer">
            <FaClock className="timer-icon" />
            <span>Time spent: {formatTime(timeSpent)}</span>
          </div>
        </div>
        
        <div className="hint-footer">
          <button 
            className="hint-acknowledge-btn"
            onClick={hideHint}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintDisplay;
