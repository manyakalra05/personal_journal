import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';

function WritingStreak({ user }) {
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    total_days: 0,
    dates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, [user.id]);

  const fetchStreak = async () => {
    try {
      const response = await api.getStreak(user.id);
      setStreakData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load streak:', err);
      setLoading(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      if (streakData.dates.includes(dateString)) {
        return 'streak-day';
      }
    }
    return null;
  };

  if (loading) {
    return <div>Loading streak...</div>;
  }

  return (
    <Card className="mb-4 streak-card">
      <Card.Body>
        <h4 className="mb-3">🔥 Writing Streak</h4>
        <div className="streak-stats">
          <div className="streak-stat">
            <div className="streak-number">{streakData.current_streak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          <div className="streak-stat">
            <div className="streak-number">{streakData.total_days}</div>
            <div className="streak-label">Total Days</div>
          </div>
        </div>
        <div className="mt-3">
          <Calendar
            tileClassName={tileClassName}
            className="streak-calendar"
          />
        </div>
        <p className="text-muted mt-3 mb-0" style={{fontSize: '0.85rem'}}>
          {streakData.current_streak > 0 
            ? `Keep it up! You've written ${streakData.current_streak} day${streakData.current_streak > 1 ? 's' : ''} in a row!`
            : 'Start writing today to begin your streak!'}
        </p>
      </Card.Body>
    </Card>
  );
}

export default WritingStreak;