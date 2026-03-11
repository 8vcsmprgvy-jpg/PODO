import { useState, useEffect, useRef } from 'react';
import './App.css';
import playSound from './sound';

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25:00
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState(null); // '5', '10', '20'
  const [soundType, setSoundType] = useState('chime');

  const timerRef = useRef(null);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('pomodore-theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Listen for theme updates from settings window
    if (window.electronAPI && window.electronAPI.onThemeUpdate) {
      window.electronAPI.onThemeUpdate((newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme);
      });
    }

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
    setTimeLeft(initialTime);
  };

  const setPreset = (minutes) => {
    const total = minutes * 60;
    setMode(minutes.toString());
    setTimeLeft(total);
    setInitialTime(total);
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

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  const handleHide = () => {
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
    }
  };

  const handleOpenSettings = () => {
    if (window.electronAPI && window.electronAPI.openSettings) {
      window.electronAPI.openSettings();
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleTimeClick = () => {
    if (!isActive) {
      setEditValue(formatTime(timeLeft));
      setIsEditing(true);
    }
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditBlur = () => {
    saveEdit();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const saveEdit = () => {
    const parts = editValue.split(':');
    let totalSeconds = 0;

    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      totalSeconds = minutes * 60 + seconds;
    } else if (parts.length === 1) {
      let valStr = parts[0].replace(/\D/g, '');
      if (valStr.length >= 3 || parts[0].startsWith('0')) {
        valStr = valStr.padStart(4, '0');
        const minutes = parseInt(valStr.slice(0, valStr.length - 2)) || 0;
        const seconds = parseInt(valStr.slice(valStr.length - 2)) || 0;
        totalSeconds = minutes * 60 + seconds;
      } else {
        totalSeconds = (parseInt(valStr) || 0) * 60;
      }
    }

    if (totalSeconds >= 0) {
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
      setMode(null); // Clear preset if custom time set
    }
    setIsEditing(false);
  };

  const isResizing = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    lastMousePos.current = { x: e.screenX, y: e.screenY };
    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing.current) return;

    const deltaX = e.screenX - lastMousePos.current.x;
    const deltaY = e.screenY - lastMousePos.current.y;

    if (deltaX === 0 && deltaY === 0) return;

    if (window.electronAPI && window.electronAPI.resizeWindow) {
      window.electronAPI.resizeWindow(deltaX, deltaY);
    }

    lastMousePos.current = { x: e.screenX, y: e.screenY };
  };

  const handleResizeMouseUp = () => {
    isResizing.current = false;
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  };

  return (
    <div className="app-container">
      <div
        className="resize-handle"
        title="Resize"
        onMouseDown={handleResizeMouseDown}
      ></div>
      <div className="titlebar">
        <div style={{ paddingLeft: '24px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', opacity: 0.7 }}>POMODORE</div>
        <div className="window-controls">
          <button className="control-btn settings-btn" onClick={handleOpenSettings} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button className="control-btn hide-btn" onClick={handleHide} title="Hide (Minimize)"></button>
          <button className="control-btn close-btn" onClick={handleClose} title="Close"></button>
        </div>
      </div>

      <div className="presets" style={{ marginTop: '20px' }}>
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
          {isEditing ? (
            <input
              autoFocus
              className="time-input"
              value={editValue}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
            />
          ) : (
            <div
              className={`time ${!isActive ? 'editable' : ''}`}
              onClick={handleTimeClick}
              title={!isActive ? "Click to edit" : ""}
            >
              {formatTime(timeLeft)}
            </div>
          )}
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
