import { useState } from 'react';
import './App.css';

const themes = [
    { id: 'default', name: 'Indigo Night', primary: '#6366f1', gradient: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)' },
    { id: 'emerald', name: 'Emerald Garden', primary: '#10b981', gradient: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)' },
    { id: 'sunset', name: 'Sunset Glow', primary: '#f59e0b', gradient: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)' },
    { id: 'rose', name: 'Rose Petal', primary: '#f43f5e', gradient: 'linear-gradient(135deg, #fecdd3 0%, #f43f5e 100%)' },
    { id: 'midnight', name: 'Midnight', primary: '#334155', gradient: 'linear-gradient(135deg, #94a3b8 0%, #334155 100%)' },
];

function Settings() {
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('pomodore-theme') || 'default');

    const handleThemeChange = (themeId) => {
        localStorage.setItem('pomodore-theme', themeId);
        setCurrentTheme(themeId);
        // Notify main process to notify main window
        if (window.electronAPI && window.electronAPI.updateTheme) {
            window.electronAPI.updateTheme(themeId);
        }
    };

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    return (
        <div className="app-container settings-container" style={{ padding: '20px' }}>
            <div className="titlebar">
                <div style={{ paddingLeft: '24px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', opacity: 0.7 }}>SETTINGS</div>
                <div className="window-controls">
                    <button className="control-btn close-btn" onClick={handleClose}></button>
                </div>
            </div>

            <h2 style={{ color: 'white', marginTop: '40px', fontSize: '1.2rem' }}>Color Themes</h2>

            <div className="theme-list" style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        className={`theme-item ${currentTheme === theme.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(theme.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '12px',
                            borderRadius: '12px',
                            border: currentTheme === theme.id ? '2px solid white' : '2px solid transparent',
                            background: 'rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.gradient }}></div>
                        <span style={{ color: 'white', fontWeight: 500 }}>{theme.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Settings;
