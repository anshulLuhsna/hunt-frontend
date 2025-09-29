import { useState, useEffect, useRef } from 'react';
import hintsData from '../config/hints.json';

export const useHintTimer = (currentQuestion, showPuzzleInput) => {
  const [hintVisible, setHintVisible] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Reset timer when question changes or puzzle input is hidden
  useEffect(() => {
    if (showPuzzleInput && currentQuestion) {
      // Start timer when puzzle is shown
      startTimer();
    } else {
      // Stop timer when puzzle is hidden or question changes
      stopTimer();
      setHintVisible(false);
      setTimeSpent(0);
      setCurrentHint(null);
    }
  }, [currentQuestion, showPuzzleInput]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    startTimeRef.current = Date.now();
    setTimeSpent(0);
    setHintVisible(false);
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(elapsed);
      
      // Show hint after 7 minutes (420 seconds)
      if (elapsed >= 420 && !hintVisible) {
        showHint();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  };

  const showHint = () => {
    if (currentQuestion) {
      // Extract question number from currentQuestion (e.g., "1.png" -> "1")
      const questionNumber = currentQuestion.replace('.png', '');
      const hintData = hintsData[questionNumber];
      
      if (hintData) {
        setCurrentHint(hintData);
        setHintVisible(true);
      }
    }
  };

  const hideHint = () => {
    setHintVisible(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timeUntilHint = Math.max(0, 420 - timeSpent);

  return {
    hintVisible,
    currentHint,
    timeSpent,
    timeUntilHint,
    formatTime,
    hideHint
  };
};
