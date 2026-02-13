
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaClock } from 'react-icons/fa';

const HuntTimer = () => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isEnded, setIsEnded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await api.getMainHuntStatus();
                if (status.endTime) {
                    setEndTime(new Date(status.endTime));
                    setIsEnded(status.isEnded);
                }
            } catch (error) {
                console.error('Error fetching hunt status for timer:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    useEffect(() => {
        if (!endTime || isEnded) return;

        const timer = setInterval(() => {
            const now = new Date();
            const difference = endTime - now;

            if (difference <= 0) {
                setIsEnded(true);
                setTimeLeft(null);
                clearInterval(timer);
            } else {
                setTimeLeft(difference);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, isEnded]);

    const formatTime = (ms) => {
        if (!ms) return '00:00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading || !endTime) return null;

    return (
        <div className="hunt-timer" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--accent-orange)',
            color: 'var(--accent-orange)',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 0 10px rgba(255, 69, 0, 0.2)',
            marginLeft: '15px'
        }}>
            <FaClock />
            <span>{isEnded ? 'HUNT ENDED' : formatTime(timeLeft)}</span>
        </div>
    );
};

export default HuntTimer;
