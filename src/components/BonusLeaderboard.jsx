import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaUser, FaUsers } from 'react-icons/fa';
import './BonusLeaderboard.css';

const BonusLeaderboard = ({ roundId, submissions = [] }) => {
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="rank-icon gold" />;
    if (index === 1) return <FaTrophy className="rank-icon silver" />;
    if (index === 2) return <FaTrophy className="rank-icon bronze" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  const getRankColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#94A3B8';
  };

  if (submissions.length === 0) {
    return (
      <div className="bonus-leaderboard-container">
        <div className="bonus-leaderboard-content">
          <h1 className="bonus-leaderboard-title jersey-15-regular">
            🏆 Bonus Round {roundId} - Winners
          </h1>
          <div className="no-submissions jersey-15-regular">
            No submissions yet. Be the first to solve it!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bonus-leaderboard-container">
      <div className="bonus-leaderboard-content">
        <h1 className="bonus-leaderboard-title jersey-15-regular">
          🏆 Bonus Round {roundId} - Winners
        </h1>
        
        <div className="submissions-stats">
          <div className="stat-item">
            <FaUsers className="stat-icon" />
            <span className="stat-text jersey-15-regular">
              {submissions.length} Winner{submissions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="submissions-list">
          {submissions.map((submission, index) => (
            <div 
              key={submission.id} 
              className="submission-item"
              style={{ borderColor: getRankColor(index) }}
            >
              <div className="submission-rank">
                {getRankIcon(index)}
              </div>
              
              <div className="submission-info">
                <div className="submission-names">
                  <div className="leader-name jersey-15-regular">
                    <FaUser className="name-icon" />
                    {submission.leader_name}
                  </div>
                  <div className="team-name jersey-15-regular">
                    <FaUsers className="name-icon" />
                    {submission.team_name}
                  </div>
                </div>
                
                <div className="submission-time">
                  <FaClock className="time-icon" />
                  <span className="time-text jersey-15-regular">
                    {formatTime(submission.submitted_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="leaderboard-footer">
          <p className="footer-text jersey-15-regular">
            Congratulations to all winners! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default BonusLeaderboard;
