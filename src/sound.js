// Simple Web Audio API Synthesizer for Alarm Sounds
const playSound = (type = 'chime') => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();

  const playOscillator = (freq, type, startTime, duration, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;

  if (type === 'chime') {
    // A pleasant two-tone chime
    playOscillator(523.25, 'sine', now, 1.5, 0.5); // C5
    playOscillator(659.25, 'sine', now + 0.2, 2.0, 0.5); // E5
  } else if (type === 'beep') {
    // Standard digital beep x3
    for (let i = 0; i < 3; i++) {
      playOscillator(880, 'square', now + i * 0.4, 0.2, 0.1);
    }
  } else if (type === 'bell') {
    // Richer bell sound using multiple frequencies
    playOscillator(440, 'sine', now, 3.0, 0.6); // A4
    playOscillator(880, 'sine', now, 2.0, 0.2); // A5
    playOscillator(1320, 'sine', now, 1.5, 0.1); // E6
  }
};

export default playSound;
