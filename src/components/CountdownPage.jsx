import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMainHuntStartTime } from '../utils/config';
import './CountdownPage.css';

const CountdownPage = ({ isLoggedIn = false }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get hunt start time from config
  const huntStartTime = getMainHuntStartTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = huntStartTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [huntStartTime]);

  const handleStartHunt = () => {
    // Refresh the page to ensure the app logic updates
    // This ensures the hunt start time is re-evaluated
    window.location.reload();
  };

  if (isExpired) {
    return (
      <div className="countdown-container">
        <div className="countdown-content">
          <h1 className="countdown-title jersey-15-regular">🎉 The Hunt Begins!</h1>
          <p className="countdown-subtitle jersey-15-regular">
            Get ready for the ultimate treasure hunt adventure!
          </p>
          <button 
            className="start-hunt-button jersey-15-regular"
            onClick={handleStartHunt}
          >
            🏃‍♂️ Start Your Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-content">
        <h1 className="countdown-title jersey-15-regular">🎪 FE Carnival Treasure Hunt</h1>
        <p className="countdown-subtitle jersey-15-regular">
          {isLoggedIn ? 'The hunt begins in:' : 'The adventure begins in:'}
        </p>
        
        <div className="countdown-timer">
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.days}</div>
            <div className="time-label jersey-15-regular">Days</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.hours}</div>
            <div className="time-label jersey-15-regular">Hours</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.minutes}</div>
            <div className="time-label jersey-15-regular">Minutes</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.seconds}</div>
            <div className="time-label jersey-15-regular">Seconds</div>
          </div>
        </div>

        <div className="countdown-info">
          <h3 className="info-title jersey-15-regular">🎯 {isLoggedIn ? 'Get Ready!' : 'Hunt Instructions'}</h3>
          <ul className="info-list jersey-15-regular">
            {isLoggedIn ? (
              <>
                <li>🎪 You're all set for the FE Carnival Treasure Hunt!</li>
                <li>📱 Make sure your team is ready with phones for QR scanning</li>
                <li>🧩 Prepare to solve challenging carnival-themed puzzles</li>
                <li>🏆 Get ready to race against other teams!</li>
              </>
            ) : (
              <>
                <li>📱 Use your phone to scan QR codes at each location</li>
                <li>🧩 Solve puzzles to unlock the next clue</li>
                <li>🏆 Race against other teams to complete the hunt first</li>
                <li>👥 Work together as a team to solve challenging riddles</li>
              </>
            )}
          </ul>
        </div>

        <div className="countdown-footer">
          <p className="footer-text jersey-15-regular">
            Make sure you're registered and ready to go!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountdownPage;
