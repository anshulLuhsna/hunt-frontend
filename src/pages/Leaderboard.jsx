import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    activeTeams: 0,
    completed: 0,
    totalPuzzles: 3
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.getLeaderboard();
      setTeams(response);

      // Calculate stats
      const completedTeams = response.filter(team => team.score >= 3).length;
      setStats({
        activeTeams: response.length,
        completed: completedTeams,
        totalPuzzles: 3
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to fetch leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (score) => {
    if (score >= 3) return '#4CAF50'; // completed
    if (score > 0) return '#4ECDC4'; // active
    return '#B0C4DE'; // not started
  };

  const getStatusText = (score) => {
    if (score >= 3) return 'Completed';
    if (score > 0) return 'Active';
    return 'Not Started';
  };

  const getAvatar = (index) => {
    const avatars = ['👑', '🔍', '🧩', '💡', '🎯', '🚀', '⭐', '🎪', '🎨', '🎭'];
    return avatars[index % avatars.length];
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <div className="header-left">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#FFD700"/>
              <path d="M20 10L25 18H15L20 10Z" fill="#2C3E50"/>
              <circle cx="20" cy="25" r="5" fill="#2C3E50"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Live Leaderboard</h1>
            <p>Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <button onClick={() => navigate('/hunt')} className="back-button">
          ← Back to Hunt
        </button>
      </header>

      <main className="leaderboard-main">
        {error && (
          <div className="error-message" style={{ textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <span className="icon">👥</span>
            </div>
            <div className="stat-info">
              <h3>{stats.activeTeams}</h3>
              <p>Active Teams</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <span className="icon">✅</span>
            </div>
            <div className="stat-info">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <span className="icon">🎯</span>
            </div>
            <div className="stat-info">
              <h3>{stats.totalPuzzles}</h3>
              <p>Total Puzzles</p>
            </div>
          </div>
        </section>

        <section className="rankings-section">
          <h2>🏆 Team Rankings</h2>
          <div className="rankings-list">
            {teams.length === 0 ? (
              <div className="team-card">
                <div className="team-info">
                  <h3>No teams found</h3>
                  <p>Be the first to start the adventure!</p>
                </div>
              </div>
            ) : (
              teams.map((team, index) => (
                <div
                  key={index}
                  className={`team-card ${team.score >= 3 ? 'winner' : ''}`}
                >
                  <div className="team-header">
                    <div className="rank-avatar">
                      <span className="avatar">{getAvatar(index)}</span>
                      <span className="rank">#{index + 1}</span>
                    </div>
                    <div className="team-info">
                      <h3>{team.team_name}</h3>
                      <p>Score: {team.score} points</p>
                    </div>
                  </div>

                  <div className="team-progress">
                    <div className="progress-info">
                      <span>Puzzle {team.score}/{stats.totalPuzzles}</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(team.score) }}
                      >
                        {getStatusText(team.score)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(team.score / stats.totalPuzzles) * 100}%`,
                          backgroundColor: getStatusColor(team.score)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Leaderboard;
