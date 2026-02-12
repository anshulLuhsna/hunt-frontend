import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import BonusCountdown from '../components/BonusCountdown';
import BonusQuestion from '../components/BonusQuestion';
import BonusLeaderboard from '../components/BonusLeaderboard';
import './BonusRound2.css';

const BonusRound2 = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('countdown');
  const [questionData, setQuestionData] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const ROUND_ID = 2;

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.getBonusStatus(ROUND_ID);
      setStatus(response);

      if (response.isEnded) {
        setCurrentStep('leaderboard');
        fetchLeaderboard();
      } else if (response.isStarted) {
        setCurrentStep('question');
        setQuestionData({
          locationHint: response.location_hint,
          questionImage: response.question_image
        });
      } else {
        setCurrentStep('countdown');
      }
    } catch (error) {
      console.error('Error fetching bonus status:', error);
    } finally {
      setLoading(false);
    }
  }, [ROUND_ID]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getBonusLeaderboard(ROUND_ID);
      setSubmissions(response);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleStart = () => {
    // Check if the bonus round has actually started according to backend
    if (status && status.isStarted) {
      setCurrentStep('question');
    } else {
      // If not started yet, reload to get fresh timing data
      window.location.reload();
    }
  };

  const handleLocationScanned = async (code) => {
    console.log('[BonusRound2] handleLocationScanned code:', code);
    const t0 = performance.now();
    const response = await api.submitBonusLocationCode(ROUND_ID, code);
    console.log('[BonusRound2] /scan response in', (performance.now() - t0).toFixed(1), 'ms:', response);
    setQuestionData(prev => ({
      ...prev,
      questionImage: response.questionImage
    }));
    return response;
  };

  const handleAnswerSubmitted = async (answer) => {
    console.log('[BonusRound2] submit answer:', answer);
    const t0 = performance.now();
    const res = await api.submitBonusAnswer(ROUND_ID, answer);
    console.log('[BonusRound2] /answer response in', (performance.now() - t0).toFixed(1), 'ms:', res);
  };

  const handleWinnerSubmitted = async (leaderName, teamName) => {
    console.log('[BonusRound2] submit winner:', { leaderName, teamName });
    const t0 = performance.now();
    const res = await api.submitBonusWinner(ROUND_ID, leaderName, teamName);
    console.log('[BonusRound2] /winner response in', (performance.now() - t0).toFixed(1), 'ms:', res);
  };

  if (loading) {
    return (
      <div className="bonus-round2-container">
        <div className="loading-content">
          <h1 className="loading-title">Loading Bonus Round...</h1>
        </div>
      </div>
    );
  }

  if (currentStep === 'countdown') {
    return (
      <BonusCountdown
        startTime={status?.start_time}
        onStart={handleStart}
      />
    );
  }

  if (currentStep === 'leaderboard') {
    return (
      <BonusLeaderboard
        roundId={ROUND_ID}
        submissions={submissions}
      />
    );
  }

  if (currentStep === 'question' && questionData) {
    return (
      <BonusQuestion
        roundId={ROUND_ID}
        locationHint={questionData.locationHint}
        questionImage={questionData.questionImage}
        onLocationScanned={handleLocationScanned}
        onAnswerSubmitted={handleAnswerSubmitted}
        onWinnerSubmitted={handleWinnerSubmitted}
      />
    );
  }

  return (
    <div className="bonus-round2-container">
      <div className="error-content">
        <h1 className="error-title">Error</h1>
        <p className="error-text">Something went wrong. Please try again.</p>
      </div>
    </div>
  );
};

export default BonusRound2;
