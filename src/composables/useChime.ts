// Shared two-tone confirmation chime, generated in-browser via Web Audio — no asset file.
// Ported from the lumea-workplace-reset-connected.html prototype (playChime()).
export function useChime() {
  function playChime(vol: number = 0.05): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(vol, now + i * 0.09 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 1.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 1.2);
      });
    } catch {
      // Web Audio unavailable — fail silently, matches original prototype behavior.
    }
  }

  return { playChime };
}
