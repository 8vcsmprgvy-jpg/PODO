import { useState, useEffect, useRef } from 'react';
import './App.css';
import playSound from './sound';

function App() {
  const [timeLeft, setTimeLeft] = useState(16 * 60 + 15); // Default 16:15 for preview
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState(null); // '5', '10', '20'
  const [soundType, setSoundType] = useState('chime');

  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound(soundType);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, soundType]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    setIsActive(false);
    if (mode) {
      setTimeLeft(parseInt(mode) * 60);
    } else {
      setTimeLeft(16 * 60 + 15);
    }
  };

  const setPreset = (minutes) => {
    setMode(minutes.toString());
    setTimeLeft(minutes * 60);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cycleSound = () => {
    const sounds = ['chime', 'beep', 'bell'];
    const nextIndex = (sounds.indexOf(soundType) + 1) % sounds.length;
    const nextSound = sounds[nextIndex];
    setSoundType(nextSound);
    playSound(nextSound); // Preview sound
  };

  return (
    <div className="app-container">
      <div className="presets">
        <button
          className={`preset-btn ${mode === '5' ? 'active' : ''}`}
          onClick={() => setPreset(5)}
        >
          5 mins
        </button>
        <button
          className={`preset-btn ${mode === '10' ? 'active' : ''}`}
          onClick={() => setPreset(10)}
        >
          10 mins
        </button>
        <button
          className={`preset-btn ${mode === '20' ? 'active' : ''}`}
          onClick={() => setPreset(20)}
        >
          20 mins
        </button>
      </div>

      <div className="timer-card">
        <div className="time-section">
          <span className="timer-label">Timer</span>
          <div className="time">{formatTime(timeLeft)}</div>
          <button className="stop-btn" onClick={stopTimer}>Stop</button>
        </div>

        <button
          className={`play-pause-btn ${isActive ? 'active' : ''}`}
          onClick={toggleTimer}
        >
          {isActive ? (
            <svg viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" style={{ transform: 'translateX(2px)' }}>
              <path d="M8 5v14l11-7z" rx="1" />
            </svg>
          )}
        </button>
      </div>

      <div className="bottom-indicator"></div>

      <div className="sound-settings">
        <button className="sound-btn" onClick={cycleSound} title="Change alarm sound">
          <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
        </button>
      </div>
    </div>
  );
}

export default App;
