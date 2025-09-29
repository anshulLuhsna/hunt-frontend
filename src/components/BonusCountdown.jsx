import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import './BonusCountdown.css';

const BonusCountdown = ({ startTime, onStart }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = new Date(startTime) - now;

      // Add debugging for timezone issues
      if (difference <= 0 && !isExpired) {
        console.log('Countdown expired:');
        console.log(`  Start time: ${new Date(startTime).toISOString()}`);
        console.log(`  Current time: ${now.toISOString()}`);
        console.log(`  Difference: ${difference}ms`);
      }

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
  }, [startTime, isExpired]);

  if (isExpired) {
    return (
      <div className="bonus-countdown-container">
        <div className="bonus-countdown-content">
          <h1 className="bonus-countdown-title jersey-15-regular">🎉 Bonus Round Begins!</h1>
          <p className="bonus-countdown-subtitle jersey-15-regular">
            Get ready for the bonus challenge!
          </p>
          <button 
            className="start-bonus-button jersey-15-regular"
            onClick={onStart}
          >
            <FaStar /> Start Bonus Round
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bonus-countdown-container">
      <div className="bonus-countdown-content">
        <h1 className="bonus-countdown-title jersey-15-regular">🎪 Bonus Round</h1>
        <p className="bonus-countdown-subtitle jersey-15-regular">
          Bonus round starts in:
        </p>
        
        <div className="bonus-countdown-timer">
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.days}</div>
            <div className="time-label jersey-15-regular">Days</div>
          </div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.hours}</div>
            <div className="time-label jersey-15-regular">Hours</div>
          </div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.minutes}</div>
            <div className="time-label jersey-15-regular">Minutes</div>
          </div>
          <div className="time-unit">
            <div className="time-value jersey-15-regular">{timeLeft.seconds}</div>
            <div className="time-label jersey-15-regular">Seconds</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BonusCountdown;
