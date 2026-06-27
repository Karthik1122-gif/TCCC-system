export const playEmergencyAlarm = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  // Siren wobble effect
  osc.frequency.setValueAtTime(700, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.4);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.8);
  osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1.2);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.6);
  
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 1.6);
};
