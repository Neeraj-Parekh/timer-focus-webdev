/**
 * Focus Timer Pro - Ambient Audio Module
 * Additional ambient sounds and music for focus
 */

const AmbientAudio = (() => {
    let audioContext = null;
    let activeNodes = {};
    let settings = {
        rainVolume: 30,
        coffeeVolume: 30,
        fireVolume: 30,
        forestVolume: 30
    };

    /**
     * Initialize audio context
     */
    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    /**
     * Resume audio context (required after user interaction)
     */
    function resumeContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    /**
     * Generate rain sound using filtered noise
     */
    function createRain(volume = 0.3) {
        if (!audioContext) init();
        resumeContext();

        const bufferSize = 2 * audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise with specific pattern for rain
        for (let i = 0; i < bufferSize; i++) {
            // Varying amplitude to simulate drops
            const dropIntensity = Math.random() < 0.1 ? 1.5 : 0.8;
            data[i] = (Math.random() * 2 - 1) * dropIntensity;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Low-pass filter to smooth the sound
        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 800;
        lowpass.Q.value = 0.7;

        // High-pass to remove rumble
        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 100;

        // Gain control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume * 0.5;

        source.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();

        return { source, gainNode, stop: () => source.stop(), type: 'rain' };
    }

    /**
     * Generate coffee shop ambiance
     * Combines low chatter and clinking sounds
     */
    function createCoffeeShop(volume = 0.3) {
        if (!audioContext) init();
        resumeContext();

        const nodes = [];

        // Background chatter (filtered pink noise)
        const chatterBuffer = audioContext.createBuffer(
            1,
            4 * audioContext.sampleRate,
            audioContext.sampleRate
        );
        const chatterData = chatterBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < chatterBuffer.length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            chatterData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }

        const chatterSource = audioContext.createBufferSource();
        chatterSource.buffer = chatterBuffer;
        chatterSource.loop = true;

        // Heavy low-pass to sound like distant voices
        const chatterFilter = audioContext.createBiquadFilter();
        chatterFilter.type = 'lowpass';
        chatterFilter.frequency.value = 400;
        chatterFilter.Q.value = 1;

        const chatterGain = audioContext.createGain();
        chatterGain.gain.value = volume * 0.4;

        chatterSource.connect(chatterFilter);
        chatterFilter.connect(chatterGain);
        chatterGain.connect(audioContext.destination);
        chatterSource.start();
        nodes.push({ source: chatterSource, gain: chatterGain });

        // Occasional soft clicks/clinks
        const scheduleClick = () => {
            if (!activeNodes.coffeeShop) return;

            const clickOsc = audioContext.createOscillator();
            const clickGain = audioContext.createGain();

            clickOsc.frequency.value = 2000 + Math.random() * 2000;
            clickGain.gain.value = 0;

            clickOsc.connect(clickGain);
            clickGain.connect(audioContext.destination);

            const now = audioContext.currentTime;
            clickGain.gain.setValueAtTime(0, now);
            clickGain.gain.linearRampToValueAtTime(volume * 0.1, now + 0.01);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            clickOsc.start(now);
            clickOsc.stop(now + 0.15);

            // Schedule next click
            setTimeout(scheduleClick, 2000 + Math.random() * 5000);
        };
        setTimeout(scheduleClick, 1000);

        return {
            nodes,
            stop: () => nodes.forEach(n => n.source.stop()),
            setVolume: (v) => nodes.forEach(n => n.gain.gain.value = v * 0.4),
            type: 'coffeeShop'
        };
    }

    /**
     * Generate fireplace crackling
     */
    function createFireplace(volume = 0.3) {
        if (!audioContext) init();
        resumeContext();

        // Low rumble base
        const bufferSize = 2 * audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Brown noise for base rumble
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const baseSource = audioContext.createBufferSource();
        baseSource.buffer = buffer;
        baseSource.loop = true;

        const baseFilter = audioContext.createBiquadFilter();
        baseFilter.type = 'lowpass';
        baseFilter.frequency.value = 200;

        const baseGain = audioContext.createGain();
        baseGain.gain.value = volume * 0.5;

        baseSource.connect(baseFilter);
        baseFilter.connect(baseGain);
        baseGain.connect(audioContext.destination);
        baseSource.start();

        // Crackling overlay
        const scheduleCrackle = () => {
            if (!activeNodes.fireplace) return;

            const crackleOsc = audioContext.createOscillator();
            const crackleGain = audioContext.createGain();

            crackleOsc.type = 'sawtooth';
            crackleOsc.frequency.value = 100 + Math.random() * 300;

            const now = audioContext.currentTime;
            crackleGain.gain.setValueAtTime(0, now);
            crackleGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.01);
            crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + Math.random() * 0.05);

            crackleOsc.connect(crackleGain);
            crackleGain.connect(audioContext.destination);

            crackleOsc.start(now);
            crackleOsc.stop(now + 0.1);

            // Schedule next crackle
            setTimeout(scheduleCrackle, 100 + Math.random() * 500);
        };
        setTimeout(scheduleCrackle, 500);

        return {
            source: baseSource,
            gainNode: baseGain,
            stop: () => baseSource.stop(),
            type: 'fireplace'
        };
    }

    /**
     * Generate forest ambiance (birds, wind)
     */
    function createForest(volume = 0.3) {
        if (!audioContext) init();
        resumeContext();

        // Wind base (filtered pink noise)
        const bufferSize = 4 * audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }

        const windSource = audioContext.createBufferSource();
        windSource.buffer = buffer;
        windSource.loop = true;

        // Band-pass for wind sound
        const windFilter = audioContext.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.value = 500;
        windFilter.Q.value = 0.5;

        const windGain = audioContext.createGain();
        windGain.gain.value = volume * 0.3;

        windSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(audioContext.destination);
        windSource.start();

        // Bird chirps
        const scheduleBird = () => {
            if (!activeNodes.forest) return;

            // Simple bird chirp with FM synthesis
            const carrier = audioContext.createOscillator();
            const modulator = audioContext.createOscillator();
            const modGain = audioContext.createGain();
            const birdGain = audioContext.createGain();

            const baseFreq = 1500 + Math.random() * 2000;
            carrier.frequency.value = baseFreq;
            modulator.frequency.value = 10 + Math.random() * 20;
            modGain.gain.value = 200;

            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            carrier.connect(birdGain);
            birdGain.connect(audioContext.destination);

            const now = audioContext.currentTime;
            const duration = 0.1 + Math.random() * 0.2;

            birdGain.gain.setValueAtTime(0, now);
            birdGain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.02);
            birdGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            carrier.start(now);
            modulator.start(now);
            carrier.stop(now + duration + 0.1);
            modulator.stop(now + duration + 0.1);

            // Schedule next bird
            setTimeout(scheduleBird, 2000 + Math.random() * 8000);
        };
        setTimeout(scheduleBird, 2000);

        return {
            source: windSource,
            gainNode: windGain,
            stop: () => windSource.stop(),
            type: 'forest'
        };
    }

    /**
     * Start ambient sound
     */
    function start(type, volume = 0.3) {
        // Stop existing of same type
        stop(type);

        let node = null;
        switch (type) {
            case 'rain':
                node = createRain(volume);
                break;
            case 'coffeeShop':
                node = createCoffeeShop(volume);
                break;
            case 'fireplace':
                node = createFireplace(volume);
                break;
            case 'forest':
                node = createForest(volume);
                break;
        }

        if (node) {
            activeNodes[type] = node;
        }
        return node;
    }

    /**
     * Stop ambient sound
     */
    function stop(type) {
        if (activeNodes[type]) {
            try {
                activeNodes[type].stop();
            } catch (e) {
                // Already stopped
            }
            delete activeNodes[type];
        }
    }

    /**
     * Stop all ambient sounds
     */
    function stopAll() {
        Object.keys(activeNodes).forEach(stop);
    }

    /**
     * Set volume for a type
     */
    function setVolume(type, volume) {
        if (activeNodes[type] && activeNodes[type].gainNode) {
            activeNodes[type].gainNode.gain.value = volume;
        }
    }

    /**
     * Update settings
     */
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
    }

    /**
     * Get active sounds
     */
    function getActive() {
        return Object.keys(activeNodes);
    }

    return {
        init,
        start,
        stop,
        stopAll,
        setVolume,
        updateSettings,
        getActive
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmbientAudio;
}
