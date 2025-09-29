import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Leaderboard.css';
import { FaTrophy, FaBullseye, FaCrown, FaSearch, FaPuzzlePiece, FaLightbulb, FaRocket, FaStar, FaTheaterMasks, FaPalette, FaUser, FaClock, FaEye, FaSync, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamProgress, setTeamProgress] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTeams: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard(pagination.currentPage);
  }, []);

  // Refresh leaderboard when modal is closed to get latest avatar updates
  useEffect(() => {
    if (!showProgress) {
      fetchLeaderboard(pagination.currentPage);
    }
  }, [showProgress]);

  const fetchLeaderboard = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getLeaderboard(page, 10);
      console.log('Leaderboard API response:', response);
      console.log('Teams:', response.teams);
      console.log('Pagination:', response.pagination);
      
      // Handle both new pagination format and old array format
      if (response.teams && Array.isArray(response.teams)) {
        setTeams(response.teams);
      } else if (Array.isArray(response)) {
        // Fallback for old format (direct array)
        console.log('Using fallback format (direct array)');
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
        console.error('Invalid response format:', response);
        setTeams([]);
      }
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
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
    // Use avatar_seed if available, fallback to team name
    return <Avatar seed={team.avatar_seed || team.team_name} size={35} />;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeaderboard(newPage);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard(pagination.currentPage);
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
        <div className="header-center">
          <h1 className="leaderboard-title jersey-15-regular">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle jersey-15-regular">
            Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1} • {pagination?.totalTeams || 0} teams
          </p>
        </div>
        <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
          <FaSync /> {loading ? 'Loading...' : 'Refresh'}
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
              className={`team-card ${team.score >= 15 ? 'winner' : ''} clickable`}
              onClick={() => handleTeamClick(team)}
            >
              <div className="rank-avatar">
                <span className="rank">#{team.rank || index + 1}</span>
                <div className="avatar">
                  {getAvatar(team)}
                </div>
              </div>
              <div className="team-info">
                <h3 className="jersey-15-regular">{team.team_name}</h3>
                <div className="team-details">
                  <span className="question-info jersey-15-regular">Question {team.score}/15</span>
                  {team.score > 0 && team.last_solve_time && (
                    <span className="time-info jersey-15-regular">
                      <FaClock /> Last solve: {formatTime(team.last_solve_time)}
                    </span>
                  )}
                  {team.score > 0 ? (
                    <span className="view-progress jersey-15-regular">
                      <FaEye /> Click to view progress
                    </span>
                  ) : (
                    <span className="no-progress-info jersey-15-regular" style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                      Not started yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
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
            <span className="jersey-15-regular">
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

      {/* Team Progress Modal */}
      {showProgress && selectedTeam && (
        <div className="progress-modal-overlay" onClick={() => setShowProgress(false)}>
          <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
            <div className="progress-modal-header">
              <h2 className="jersey-15-regular">{selectedTeam.team_name}'s Progress</h2>
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
                  <p className="jersey-15-regular">No questions solved yet</p>
                  <p className="jersey-15-regular" style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '10px' }}>
                    This team hasn't started the treasure hunt yet. They need to solve at least one question to see progress here.
                  </p>
                </div>
              ) : (
                <div className="progress-list">
                  {teamProgress.map((progress, index) => (
                    <div key={index} className="progress-item">
                      <div className="progress-info">
                        <span className="question-number jersey-15-regular">
                          Question #{progress.question_number}
                        </span>
                        <span className="solve-time jersey-15-regular">
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
