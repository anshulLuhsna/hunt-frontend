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
        <h1 className="countdown-title">🌌 Xenia '26: Vault of the Multiverse</h1>
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
          {isLoggedIn ? (
            <div className="rules-container">
              <div className="rule-group">
                <h3>📜 Mission Protocols</h3>
                <div className="rule-step">
                  <strong>1. Two Question Types:</strong>
                  <p>There are <strong>Location Questions</strong> (hints to find where to go) and <strong>Main Puzzles</strong> (the actual riddles).</p>
                </div>
                <div className="rule-step">
                  <strong>2. The Location Loop:</strong>
                  <p>There are <strong>10 total locations</strong>. Solve the hint, run there, and scan the QR code.</p>
                </div>
                <div className="rule-step">
                  <strong>3. Scan & Sync:</strong>
                  <p>Once scanned, refresh your page. Progress saves automatically for your entire team (only one person needs to scan).</p>
                </div>
              </div>

              <div className="rule-group">
                <h3>🔄 The Multiverse Mechanics</h3>
                <div className="rule-step">
                  <strong>Recursive Locations:</strong>
                  <p>There are 16 questions but only 10 locations. <strong>Locations will repeat.</strong> You must go back and scan the QR again for each new step.</p>
                </div>
                <div className="rule-step">
                  <strong>Unique Paths:</strong>
                  <p>Every team has a unique sequence. Following others is futile and will waste your time.</p>
                </div>
              </div>

              <div className="rule-group">
                <h3>🏆 Mission Timeline & Victory</h3>
                <div className="rule-step">
                  <strong>Deadline:</strong>
                  <p>The portal closes deeply at <strong>7:00 PM SHARP</strong>. All activity ceases.</p>
                </div>
                <div className="rule-step">
                  <strong>Winning Condition:</strong>
                  <p>The team that solves <strong>all 16 questions first</strong> wins. If no one completes all, the team with the most solved questions at 7 PM takes the crown.</p>
                </div>
              </div>

              <div className="rule-group warning-group">
                <h3>⚠️ Survival Guide</h3>
                <ul>
                  <li>🚫 <strong>Anti-AI Designed:</strong> ChatGPT/Gemini will mislead you. Trust your brain over bots.</li>
                  <li>🔍 <strong>Google is Allowed:</strong> Search engines are your best friend.</li>
                  <li>🎵 <strong>Audio Intel:</strong> Keep <strong>Shazam</strong> ready for identifying songs.</li>
                </ul>
              </div>
            </div>
          ) : (
            <ul className="info-list">
              <li>📱 Use your phone to scan QR codes at each location</li>
              <li>🧩 Solve puzzles to unlock the next clue</li>
              <li>🏆 Race against other teams to complete the hunt first</li>
              <li>👥 Work together as a team to solve challenging riddles</li>
            </ul>
          )}
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
