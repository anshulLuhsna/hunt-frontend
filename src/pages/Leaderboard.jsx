import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Leaderboard.css';
import { FaTrophy, FaPuzzlePiece, FaClock, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamProgress, setTeamProgress] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [currentTeamRank, setCurrentTeamRank] = useState(null);
  const [huntStatus, setHuntStatus] = useState({ isEnded: false, endTime: null });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTeams: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaderboard(1),
        fetchHuntStatus(),
        user ? fetchCurrentTeamRank() : Promise.resolve()
      ]);
      setLoading(false);
    };
    init();
  }, [user]);

  // Refresh leaderboard when modal is closed
  useEffect(() => {
    if (!showProgress) {
      fetchLeaderboard(pagination.currentPage);
    }
  }, [showProgress]);

  const fetchHuntStatus = async () => {
    try {
      const response = await api.getMainHuntStatus();
      setHuntStatus({
        isEnded: response.isEnded,
        endTime: response.endTime
      });
    } catch (error) {
      console.error('Error fetching hunt status:', error);
    }
  };

  const fetchLeaderboard = async (page = 1) => {
    try {
      const response = await api.getLeaderboard(page, 10);

      if (response.teams && Array.isArray(response.teams)) {
        setTeams(response.teams);
      } else if (Array.isArray(response)) {
        setTeams(response);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTeams: response.length,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setTeams([]);
      }

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchTeamProgress = async (teamId) => {
    try {
      const response = await api.getTeamProgress(teamId);
      setTeamProgress(response);
      setShowProgress(true);
    } catch (error) {
      console.error('Error fetching team progress:', error);
    }
  };

  const fetchCurrentTeamRank = async () => {
    try {
      const response = await api.getCurrentTeamRank();
      setCurrentTeamRank(response);
    } catch (error) {
      console.error('Error fetching current team rank:', error);
    }
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    if (team.score > 0) {
      fetchTeamProgress(team.id);
    } else {
      setTeamProgress([]);
      setShowProgress(true);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAvatar = (team) => {
    return <Avatar seed={team.avatar_seed || team.team_name} size={35} />;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeaderboard(newPage);
    }
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
        <button onClick={() => navigate('/hunt')} className="back-button">
          ← Back to Hunt
        </button>
        <div className="header-center">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">
            Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1} • {pagination?.totalTeams || 0} teams
          </p>

          {huntStatus.isEnded && (
            <div className="hunt-ended-banner" style={{
              backgroundColor: 'rgba(255, 69, 0, 0.2)',
              border: '1px solid var(--accent-orange)',
              color: 'var(--accent-orange)',
              padding: '10px 20px',
              borderRadius: '8px',
              marginTop: '15px',
              textAlign: 'center',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              🏁 HUNT ENDED
            </div>
          )}

          {currentTeamRank && (
            <div className="current-team-rank">
              <div className="rank-main-info">
                <FaTrophy className="trophy-icon" />
                <span>Rank #{currentTeamRank.rank} of {currentTeamRank.totalTeams}</span>
              </div>
              {currentTeamRank.score > 0 && (
                <div className="rank-score-info">
                  {currentTeamRank.score}/16 solved
                </div>
              )}
            </div>
          )}
        </div>
        <div></div>
      </header>

      {!huntStatus.isEnded ? (
        <div className="game-in-progress" style={{
          textAlign: 'center',
          padding: '50px 20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '600px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <FaPuzzlePiece style={{ fontSize: '3rem', color: 'var(--accent-orange)', marginBottom: '20px', opacity: 0.8 }} />
          <h2 style={{ marginBottom: '15px' }}>Hunt in Progress</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
            The leaderboard is hidden until the portal closes.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
            Focus on your path. The final rankings will be revealed at 7:00 PM.
          </p>
        </div>
      ) : (
        <>
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
                  className={`team-card ${team.score >= 16 ? 'winner' : ''} clickable`}
                  onClick={() => handleTeamClick(team)}
                >
                  <div className="rank-avatar">
                    <span className="rank">#{team.rank || index + 1}</span>
                    <div className="avatar">
                      {getAvatar(team)}
                    </div>
                  </div>
                  <div className="team-info">
                    <h3>{team.team_name}</h3>
                    <div className="team-details">
                      <span className="question-info">Question {team.score}/16</span>
                      {team.score > 0 && team.last_solve_time && (
                        <span className="time-info">
                          <FaClock /> Last solve: {formatTime(team.last_solve_time)}
                        </span>
                      )}
                      {team.score > 0 ? (
                        <span className="view-progress">
                          <FaEye /> Click to view progress
                        </span>
                      ) : (
                        <span className="no-progress-info" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Not started yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {(pagination?.totalPages || 1) > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
                disabled={!pagination?.hasPrevPage || loading}
              >
                <FaChevronLeft /> Previous
              </button>

              <div className="pagination-info">
                <span>
                  Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
                </span>
              </div>

              <button
                className="pagination-button"
                onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
                disabled={!pagination?.hasNextPage || loading}
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {showProgress && selectedTeam && (
        <div className="progress-modal-overlay" onClick={() => setShowProgress(false)}>
          <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
            <div className="progress-modal-header">
              <h2>{selectedTeam.team_name}'s Progress</h2>
              <button
                className="close-button"
                onClick={() => setShowProgress(false)}
              >
                ×
              </button>
            </div>
            <div className="progress-content">
              {teamProgress.length === 0 ? (
                <div className="no-progress">
                  <p>No questions solved yet</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px' }}>
                    This team hasn't started the treasure hunt yet. They need to solve at least one question to see progress here.
                  </p>
                </div>
              ) : (
                <div className="progress-list">
                  {teamProgress.map((progress, index) => (
                    <div key={index} className="progress-item">
                      <div className="progress-info">
                        <span className="question-number">
                          Question #{progress.question_number}
                        </span>
                        <span className="solve-time">
                          <FaClock /> {formatTime(progress.solved_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
