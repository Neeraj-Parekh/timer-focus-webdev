/**
 * Focus Timer Pro - Audio Module
 * Sound generation and playback using Web Audio API
 */

const Audio = (() => {
    let audioContext = null;
    let noiseNode = null;
    let noiseGain = null;
    let isNoiseActive = false;

    // Sound settings
    let settings = {
        volume: 80,
        noiseVolume: 30,
        noiseType: 'none',
        workSound: 'bell',
        breakSound: 'chime'
    };

    /**
     * Initialize audio context
     */
    function init() {
        // Create on user interaction
        document.addEventListener('click', () => {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    /**
     * Ensure audio context exists
     */
    function ensureContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return audioContext;
    }

    /**
     * Update settings
     */
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };

        // Update noise volume if active
        if (noiseGain && isNoiseActive) {
            noiseGain.gain.value = settings.noiseVolume / 100 * 0.3;
        }
    }

    /**
     * Play alert sound
     */
    function playAlert(type = 'bell') {
        const ctx = ensureContext();
        const volume = settings.volume / 100;

        switch (type) {
            case 'bell':
                playBellSound(ctx, volume);
                break;
            case 'chime':
                playChimeSound(ctx, volume);
                break;
            case 'ding':
                playDingSound(ctx, volume);
                break;
            case 'sweep':
                playSweepSound(ctx, volume);
                break;
            default:
                playBellSound(ctx, volume);
        }
    }

    /**
     * Bell sound - pleasant notification
     */
    function playBellSound(ctx, volume) {
        const now = ctx.currentTime;

        // Main tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);

        // Harmonic
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.exponentialRampToValueAtTime(990, now + 0.25);

        gain2.gain.setValueAtTime(volume * 0.25, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now);
        osc2.stop(now + 0.6);
    }

    /**
     * Chime sound - musical
     */
    function playChimeSound(ctx, volume) {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const delay = i * 0.1;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);

            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(volume * 0.3, now + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.5);
        });
    }

    /**
     * Ding sound - simple
     */
    function playDingSound(ctx, volume) {
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    /**
     * FM Sweep sound - sci-fi style
     */
    function playSweepSound(ctx, volume) {
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.6);

        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    /**
     * Play tick sound (for timer)
     */
    function playTick() {
        const ctx = ensureContext();
        const volume = settings.volume / 100 * 0.1;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    }

    /**
     * Start background noise
     */
    function startNoise(type = 'white') {
        if (type === 'none') {
            stopNoise();
            return;
        }

        const ctx = ensureContext();

        // Stop existing noise
        if (noiseNode) {
            stopNoise();
        }

        // Create noise buffer
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate noise based on type
        switch (type) {
            case 'white':
                generateWhiteNoise(output);
                break;
            case 'pink':
                generatePinkNoise(output);
                break;
            case 'brown':
                generateBrownNoise(output);
                break;
        }

        // Create buffer source
        noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        // Create gain node
        noiseGain = ctx.createGain();
        noiseGain.gain.value = settings.noiseVolume / 100 * 0.3;

        // Connect
        noiseNode.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        // Start
        noiseNode.start();
        isNoiseActive = true;
    }

    /**
     * Stop background noise
     */
    function stopNoise() {
        if (noiseNode) {
            try {
                noiseNode.stop();
            } catch (e) {
                // Already stopped
            }
            noiseNode.disconnect();
            noiseNode = null;
        }
        if (noiseGain) {
            noiseGain.disconnect();
            noiseGain = null;
        }
        isNoiseActive = false;
    }

    /**
     * Generate white noise
     */
    function generateWhiteNoise(output) {
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Generate pink noise (using Paul Kellet's method)
     */
    function generatePinkNoise(output) {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < output.length; i++) {
            const white = Math.random() * 2 - 1;

            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    }

    /**
     * Generate brown noise (random walk)
     */
    function generateBrownNoise(output) {
        let lastOut = 0;

        for (let i = 0; i < output.length; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Amplify
        }
    }

    /**
     * Trigger vibration
     */
    function vibrate(pattern = [200, 100, 200]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Play completion fanfare
     */
    function playComplete() {
        playAlert(settings.alertSound || 'bell');
        vibrate([200, 100, 200, 100, 300]);
    }

    /**
     * Play work session complete sound
     */
    function playWorkComplete() {
        playAlert(settings.workSound || 'bell');
        vibrate([200, 100, 200, 100, 300]);
    }

    /**
     * Play break complete sound
     */
    function playBreakComplete() {
        playAlert(settings.breakSound || 'chime');
        vibrate([100, 50, 100]);
    }

    /**
     * Get current settings
     */
    function getSettings() {
        return { ...settings };
    }

    return {
        init,
        updateSettings,
        getSettings,
        playAlert,
        playTick,
        playComplete,
        playWorkComplete,
        playBreakComplete,
        startNoise,
        stopNoise,
        vibrate,
        isNoiseActive: () => isNoiseActive
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Audio;
}
