import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Leaderboard.css';
import { FaTrophy, FaBullseye, FaCrown, FaSearch, FaPuzzlePiece, FaLightbulb, FaRocket, FaStar, FaTheaterMasks, FaPalette, FaUser } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.getLeaderboard();
      setTeams(response);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const getAvatar = (team) => {
    // Use avatar_seed if available, fallback to team name
    return <Avatar seed={team.avatar_seed || team.team_name} size={35} />;
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading jersey-15-regular">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <button onClick={() => navigate('/hunt')} className="back-button">
          ← Back to Hunt
        </button>
      </header>
      
      <div className="rankings-list">
        {teams.length === 0 ? (
          <div className="team-card">
            <div className="team-info">
              <h3 className="jersey-15-regular">No teams found</h3>
              <p className="jersey-15-regular">Be the first to start the adventure!</p>
            </div>
          </div>
        ) : (
          teams.map((team, index) => (
            <div
              key={index}
              className={`team-card ${team.score >= 3 ? 'winner' : ''}`}
            >
              <div className="rank-avatar">
                <span className="rank">#{index + 1}</span>
                <div className="avatar">
                  {getAvatar(team)}
                </div>
              </div>
              <div className="team-info">
                <h3 className="jersey-15-regular">{team.team_name}</h3>
                <div className="team-details">
                  <span className="question-info jersey-15-regular">Question {team.score}/15</span>
                  {team.score > 0 && (
                    <span className="time-info jersey-15-regular">Solved at {new Date().toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
