import { useState, useEffect } from 'react';
import api from '../services/api';
import './CountdownPage.css';

const CountdownPage = ({ isLoggedIn = false }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [huntStartTime, setHuntStartTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch hunt status from API
  useEffect(() => {
    const fetchHuntStatus = async () => {
      try {
        const response = await api.getMainHuntStatus();
        setHuntStartTime(new Date(response.startTime));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hunt status:', error);
        setLoading(false);
      }
    };

    fetchHuntStatus();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!huntStartTime) return;

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

  if (loading) {
    return (
      <div className="countdown-container">
        <div className="countdown-content">
          <div className="loading">Loading hunt timing...</div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="countdown-container">
        <div className="countdown-content">
          <h1 className="countdown-title">🎉 The Hunt Begins!</h1>
          <p className="countdown-subtitle">
            Get ready for the ultimate treasure hunt adventure!
          </p>
          <button
            className="start-hunt-button"
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
        <h1 className="countdown-title">🎪 FE Carnival Treasure Hunt</h1>
        <p className="countdown-subtitle">
          {isLoggedIn ? 'The hunt begins in:' : 'The adventure begins in:'}
        </p>

        <div className="countdown-timer">
          <div className="time-unit">
            <div className="time-value">{timeLeft.days}</div>
            <div className="time-label">Days</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value">{timeLeft.hours}</div>
            <div className="time-label">Hours</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value">{timeLeft.minutes}</div>
            <div className="time-label">Minutes</div>
          </div>
          <div className="time-separator">:</div>
          <div className="time-unit">
            <div className="time-value">{timeLeft.seconds}</div>
            <div className="time-label">Seconds</div>
          </div>
        </div>

        <div className="countdown-info">
          <h3 className="info-title">🎯 {isLoggedIn ? 'Get Ready!' : 'Hunt Instructions'}</h3>
          <ul className="info-list">
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
          <p className="footer-text">
            Make sure you're registered and ready to go!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountdownPage;
