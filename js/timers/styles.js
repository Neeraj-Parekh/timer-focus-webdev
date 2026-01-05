/**
 * Focus Timer Pro - Timer Styles Module
 * Multiple visual timer display styles: Circular, Analog, Linear, Digital, Flip, Nixie, Hourglass
 */

const TimerStyles = (() => {
    let currentStyle = 'circular';

    // --- INIT ---
    function init(containerId = 'timer-display') {
        const style = localStorage.getItem('timerStyle') || 'circular';
        setStyle(style);
    }

    function setStyle(style) {
        currentStyle = style;
        const container = document.querySelector('.timer-container');
        if (container) {
            // Remove all style-* classes first to be safe
            container.classList.remove('style-circular', 'style-analog', 'style-linear', 'style-digital', 'style-flip', 'style-nixie', 'style-hourglass');
            container.className = 'timer-container style-' + style;
        }
        localStorage.setItem('timerStyle', style);
    }

    // --- MAIN RENDER LOOP ---
    function render(state) {
        switch (currentStyle) {
            case 'circular':
                renderCircular(state);
                break;
            case 'analog':
                renderAnalog(state);
                break;
            case 'linear':
                renderLinear(state);
                break;
            case 'digital':
                renderDigital(state);
                break;
            case 'minimal':
                renderMinimal(state);
                break;
            case 'flip':
                renderFlip(state);
                break;
            case 'nixie':
                renderNixie(state);
                break;
            case 'hourglass':
                renderHourglass(state);
                break;
        }
    }

    // --- EXISTING STYLES ---

    function renderCircular(state) {
        const progress = document.getElementById('timer-progress');
        if (!progress) return;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - state.progress);
        progress.style.strokeDashoffset = offset;
        const percentage = state.remainingSeconds / state.totalSeconds;
        if (percentage < 0.1) progress.style.stroke = '#EF4444';
        else if (percentage < 0.25) progress.style.stroke = '#F59E0B';
        else progress.style.stroke = 'url(#timer-gradient)';
    }

    function renderAnalog(state) {
        const container = document.querySelector('.timer-ring');
        if (!container) return;
        let clockFace = container.querySelector('.analog-clock');
        if (!clockFace) {
            clockFace = document.createElement('div');
            clockFace.className = 'analog-clock';
            clockFace.innerHTML = `
                <div class="clock-face">
                    <div class="clock-markers"></div>
                    <div class="clock-hand minute-hand"></div>
                    <div class="clock-hand second-hand"></div>
                    <div class="clock-center"></div>
                </div>`;
            container.appendChild(clockFace);
            const markers = clockFace.querySelector('.clock-markers');
            for (let i = 0; i < 12; i++) {
                const marker = document.createElement('div');
                marker.className = 'clock-marker';
                marker.style.transform = `rotate(${i * 30}deg)`;
                markers.appendChild(marker);
            }
        }
        const minuteAngle = (1 - state.progress) * 360;
        const minuteHand = clockFace.querySelector('.minute-hand');
        if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        const secondAngle = (state.remainingSeconds % 60 / 60) * 360;
        const secondHand = clockFace.querySelector('.second-hand');
        if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
    }

    function renderLinear(state) {
        let linearBar = document.querySelector('.linear-progress-container');
        if (!linearBar) {
            const container = document.querySelector('.timer-container');
            if (!container) return;
            linearBar = document.createElement('div');
            linearBar.className = 'linear-progress-container';
            linearBar.innerHTML = `
                <div class="linear-progress-bg"><div class="linear-progress-fill"></div></div>
                <div class="linear-progress-labels"><span class="linear-elapsed">0:00</span><span class="linear-remaining">${state.formattedTime}</span></div>`;
            container.insertBefore(linearBar, container.firstChild);
        }
        const fill = linearBar.querySelector('.linear-progress-fill');
        if (fill) fill.style.width = `${state.progress * 100}%`;
        const elapsed = linearBar.querySelector('.linear-elapsed');
        if (elapsed) elapsed.textContent = formatTime(state.totalSeconds - state.remainingSeconds);
        const remaining = linearBar.querySelector('.linear-remaining');
        if (remaining) remaining.textContent = state.formattedTime;
    }

    function renderDigital(state) {
        const timerTime = document.getElementById('timer-time');
        if (!timerTime) return;
        timerTime.classList.add('digital-style');
        if (state.isRunning && !state.isPaused) {
            timerTime.classList.toggle('blink', state.remainingSeconds % 2 === 0);
        }
    }

    function renderMinimal(state) {
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) timerDisplay.classList.add('minimal-style');
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function injectStyles() {
        if (document.getElementById('timer-styles-css')) return;
        const styles = document.createElement('style');
        styles.id = 'timer-styles-css';
        styles.textContent = `
            /* VSISIBILITY TOGGLES */
            .style-analog .timer-svg,
            .style-analog #timer-time,
            .style-flip .timer-ring,
            .style-flip .timer-inner #timer-time,
            .style-nixie .timer-ring,
            .style-nixie .timer-inner #timer-time,
            .style-hourglass .timer-ring,
            .style-hourglass .timer-inner #timer-time,
            .style-hourglass .timer-inner {
                display: none !important;
            }

            /* ANALOG CLOCK */
            .analog-clock { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 220px; height: 220px; z-index: 10; }
            .clock-face { width: 100%; height: 100%; border-radius: 50%; background: var(--bg-secondary); border: 4px solid var(--accent-primary); position: relative; box-shadow: inset 0 0 30px rgba(0,0,0,0.3); }
            .clock-markers { position: absolute; inset: 10px; }
            .clock-marker { position: absolute; left: 50%; top: 0; width: 2px; height: 10px; background: var(--text-muted); transform-origin: center 100px; }
            .clock-marker:nth-child(3n) { height: 15px; width: 3px; background: var(--text-primary); }
            .clock-hand { position: absolute; left: 50%; bottom: 50%; transform-origin: bottom center; border-radius: 4px; }
            .minute-hand { width: 4px; height: 70px; background: var(--accent-primary); margin-left: -2px; box-shadow: 0 0 10px var(--accent-primary); z-index: 2; }
            .second-hand { width: 2px; height: 90px; background: var(--accent-error); margin-left: -1px; z-index: 3; }
            .clock-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); z-index: 4; }

            /* LINEAR STYLE */
            .linear-progress-container { width: 100%; padding: 0 var(--space-4); margin-bottom: var(--space-6); }
            .linear-progress-bg { height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
            .linear-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: var(--radius-full); transition: width 1s linear; box-shadow: 0 0 10px var(--accent-primary); }
            .linear-progress-labels { display: flex; justify-content: space-between; margin-top: var(--space-2); font-size: var(--text-sm); color: var(--text-muted); font-family: var(--font-mono); }

            /* DIGITAL STYLE */
            .timer-time.digital-style { font-family: 'JetBrains Mono', monospace; letter-spacing: 4px; text-shadow: 0 0 20px var(--accent-primary); }
            .timer-time.blink::after { content: ''; opacity: 0.3; }

            /* MINIMAL STYLE */
            .timer-display.minimal-style { background: none; }
            .timer-display.minimal-style .timer-svg { opacity: 0.1; }

            /* FLIP CLOCK */
            .flip-clock-display { display: flex; gap: 6px; justify-content: center; align-items: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; }
            .flip-group { display: flex; gap: 4px; position: relative; }
            .flip-group::after { content: ':'; position: absolute; right: -12px; top: 45%; transform: translateY(-50%); font-size: 40px; color: #fff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
            .flip-group:last-child::after { content: none; }
            .flip-unit { width: 50px; height: 75px; background: #121212; border-radius: 4px; position: relative; font-family: 'Courier New', monospace; font-size: 55px; font-weight: bold; color: #fff; box-shadow: 0 0 0 1px #222; perspective: 1000px; line-height: 75px; text-align: center; }
            .flip-unit .top, .flip-unit .bottom, .flip-unit .leaf-front, .flip-unit .leaf-back { position: absolute; left: 0; width: 100%; height: 50%; overflow: hidden; background: #121212; backface-visibility: hidden; }
            .flip-unit .top, .flip-unit .leaf-front { top: 0; border-radius: 4px 4px 0 0; transform-origin: 50% 100%; border-bottom: 1px solid #000; }
            .flip-unit .bottom, .flip-unit .leaf-back { bottom: 0; border-radius: 0 0 4px 4px; transform-origin: 50% 0%; border-top: 1px solid #000; display: flex; align-items: flex-end; justify-content: center; }
            .flip-unit .top::after, .flip-unit .leaf-front::after { content: attr(data-val); position: absolute; left: 0; top: 0; width: 100%; height: 200%; text-shadow: 0 0 5px rgba(255, 255, 255, 0.2); }
            .flip-unit .bottom::after, .flip-unit .leaf-back::after { content: attr(data-val); position: absolute; left: 0; top: -100%; width: 100%; height: 200%; text-shadow: 0 0 5px rgba(255, 255, 255, 0.2); }
            .flip-unit .leaf-front { z-index: 3; transform: rotateX(0deg); }
            .flip-unit .leaf-back { z-index: 2; transform: rotateX(180deg); }
            .flip-unit.flipping .leaf-front { animation: flipDown 0.6s ease-in-out forwards; }
            .flip-unit.flipping .leaf-back { animation: flipUp 0.6s ease-in-out forwards; }
            @keyframes flipDown { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-180deg); } }
            @keyframes flipUp { 0% { transform: rotateX(180deg); } 100% { transform: rotateX(0deg); } }

            /* NIXIE TUBE - HYPER REALISTIC */
            .nixie-display { display: flex; gap: 10px; justify-content: center; align-items: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 15px; background: #000; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 10; border: 1px solid #333; }
            .nixie-group { display: flex; gap: 8px; position: relative; padding: 10px 5px; background: transparent; }
            .nixie-group::after { content: ''; position: absolute; right: -8px; top: 50%; width: 4px; height: 4px; background: #ff9900; box-shadow: 0 0 5px #fff, 0 0 10px #ff9900; border-radius: 50%; transform: translateY(-50%); opacity: 0.8; }
            .nixie-group:last-child::after { display: none; }
            .nixie-tube { position: relative; width: 45px; height: 85px; background: linear-gradient(90deg, rgba(255,255,255,0) 5%, rgba(255,255,255,0.3) 8%, rgba(255,255,255,0) 12%), linear-gradient(90deg, rgba(255,255,255,0) 80%, rgba(255,255,255,0.08) 90%, rgba(255,255,255,0) 100%), radial-gradient(circle at 50% 10%, rgba(0,0,0,0.8) 0%, transparent 60%); background-color: rgba(10,10,10,0.3); border-radius: 30px 30px 5px 5px; box-shadow: inset 1px 0 2px rgba(255,255,255,0.15), inset -1px 0 2px rgba(255,255,255,0.1), inset 0 10px 15px rgba(0,0,0,0.9), 0 5px 10px rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
            .nixie-tube::before { content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%); width: 12px; height: 8px; background: radial-gradient(circle at 50% 100%, rgba(255,255,255,0.1), transparent); border: 1px solid rgba(255,255,255,0.15); border-bottom: none; border-radius: 50% 50% 0 0; z-index: 20; filter: blur(0.5px); }
            .nixie-tube::after { content: ''; position: absolute; bottom: 0; left: 10%; width: 80%; height: 4px; background: repeating-linear-gradient(90deg, #111 0, #111 2px, #333 3px, #111 4px); opacity: 0.6; z-index: 5; }
            .nixie-mesh { position: absolute; inset: 0; background-image: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 100%), repeating-linear-gradient(60deg, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-60deg, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px); background-size: 100% 100%, 3px 5px, 3px 5px; z-index: 15; pointer-events: none; opacity: 0.6; }
            .nixie-digit { font-family: 'Nixie One', sans-serif; font-size: 50px; font-weight: 400; color: #3d2618; position: absolute; text-align: center; line-height: 85px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform: scaleX(0.65) scaleY(1.3); -webkit-text-stroke: 1px #3d2618; -webkit-text-fill-color: transparent; }
            .nixie-digit.inactive { opacity: 0.2; filter: blur(0.5px); z-index: 1; -webkit-text-stroke: 1px #2a1510; }
            .nixie-digit.active { z-index: 10; opacity: 1; -webkit-text-stroke: 2px #fff5e6; -webkit-text-fill-color: #fff5e6; transform: scaleX(0.7) scaleY(1.35); text-shadow: 0 0 3px #fff, 0 0 5px #ff9900, 0 0 10px #ff4500, 0 0 20px #ff4500, 0 5px 12px rgba(0, 150, 255, 0.2); filter: blur(0.4px) contrast(1.2); animation: plasmaFlicker 0.1s infinite alternate; }
            @keyframes plasmaFlicker { 0% { opacity: 0.98; text-shadow: 0 0 3px #ff9900, 0 0 10px #ff4500; } 100% { opacity: 1; text-shadow: 0 0 4px #ff9900, 0 0 11px #ff4500; } }

            /* HOURGLASS */
            .hourglass-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 280px; height: 280px; display: flex; justify-content: center; align-items: center; z-index: 10; }
            .hourglass-pixel { width: 1px; height: 1px; will-change: box-shadow; }
        `;
        document.head.appendChild(styles);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyles);
    else injectStyles();

    // --- FLIP CLOCK LOGIC ---
    function renderFlip(state) {
        let container = document.querySelector('.flip-clock-display');
        if (!container) {
            // Append to .timer-display (parent of .timer-ring)
            const parent = document.querySelector('.timer-display') || document.querySelector('.timer-ring').parentNode;
            container = document.createElement('div');
            container.className = 'flip-clock-display';
            const units = ['m', 's'];
            if (state.totalSeconds >= 3600) units.unshift('h');
            units.forEach(unit => {
                const group = document.createElement('div');
                group.className = 'flip-group';
                ['tens', 'ones'].forEach(digit => {
                    const flip = document.createElement('div');
                    flip.className = 'flip-unit';
                    flip.id = `f-${unit}-${digit}`;
                    flip.innerHTML = `<div class="top" data-val="0"></div><div class="bottom" data-val="0"></div><div class="leaf-front" data-val="0"></div><div class="leaf-back" data-val="0"></div>`;
                    group.appendChild(flip);
                });
                container.appendChild(group);
            });
            parent.appendChild(container);
        }
        const h = Math.floor(state.remainingSeconds / 3600);
        const m = Math.floor((state.remainingSeconds % 3600) / 60);
        const s = state.remainingSeconds % 60;
        const hStr = h.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');
        const sStr = s.toString().padStart(2, '0');
        if (state.totalSeconds >= 3600) { updateFlipDigit(`f-h-tens`, hStr[0]); updateFlipDigit(`f-h-ones`, hStr[1]); }
        updateFlipDigit(`f-m-tens`, mStr[0]); updateFlipDigit(`f-m-ones`, mStr[1]);
        updateFlipDigit(`f-s-tens`, sStr[0]); updateFlipDigit(`f-s-ones`, sStr[1]);
    }

    function updateFlipDigit(id, newVal) {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.querySelector('.top');
        const bottom = el.querySelector('.bottom');
        const front = el.querySelector('.leaf-front');
        const back = el.querySelector('.leaf-back');
        const curVal = top.getAttribute('data-val');
        if (newVal === curVal) return;
        top.setAttribute('data-val', newVal);
        bottom.setAttribute('data-val', curVal);
        front.setAttribute('data-val', curVal);
        back.setAttribute('data-val', newVal);
        el.classList.remove('flipping');
        void el.offsetWidth;
        el.classList.add('flipping');
        setTimeout(() => {
            el.classList.remove('flipping');
            bottom.setAttribute('data-val', newVal);
            front.setAttribute('data-val', newVal);
        }, 600);
    }

    // --- NIXIE CLOCK LOGIC ---
    function renderNixie(state) {
        let container = document.querySelector('.nixie-display');
        if (!container) {
            const parent = document.querySelector('.timer-display') || document.querySelector('.timer-ring').parentNode;
            container = document.createElement('div');
            container.className = 'nixie-display';
            const units = (state.totalSeconds >= 3600) ? ['h', 'm', 's'] : ['m', 's'];
            units.forEach(unit => {
                const group = document.createElement('div');
                group.className = 'nixie-group';
                ['tens', 'ones'].forEach(digit => {
                    const tube = document.createElement('div');
                    tube.className = 'nixie-tube';
                    tube.id = `n-${unit}-${digit}`;
                    const mesh = document.createElement('div');
                    mesh.className = 'nixie-mesh';
                    tube.appendChild(mesh);
                    for (let i = 0; i <= 9; i++) {
                        const d = document.createElement('div');
                        d.className = `nixie-digit digit-${i} inactive`;
                        d.textContent = i;
                        tube.appendChild(d);
                    }
                    group.appendChild(tube);
                });
                container.appendChild(group);
            });
            parent.appendChild(container);
        }
        const h = Math.floor(state.remainingSeconds / 3600);
        const m = Math.floor((state.remainingSeconds % 3600) / 60);
        const s = state.remainingSeconds % 60;
        const hStr = h.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');
        const sStr = s.toString().padStart(2, '0');
        if (state.totalSeconds >= 3600) { updateNixieTube(`n-h-tens`, hStr[0]); updateNixieTube(`n-h-ones`, hStr[1]); }
        updateNixieTube(`n-m-tens`, mStr[0]); updateNixieTube(`n-m-ones`, mStr[1]);
        updateNixieTube(`n-s-tens`, sStr[0]); updateNixieTube(`n-s-ones`, sStr[1]);
    }

    function updateNixieTube(id, val) {
        const tube = document.getElementById(id);
        if (!tube) return;
        const active = tube.querySelector('.nixie-digit.active');
        if (active && active.textContent === val) return;
        if (active) active.className = `nixie-digit digit-${active.textContent} inactive`;
        const next = tube.querySelector(`.digit-${val}`);
        if (next) next.className = `nixie-digit digit-${val} active`;
    }

    // --- HOURGLASS LOGIC ---
    let hourglassInitialized = false;
    let hgPixelMap = [];
    let hgGrains = [];
    const HG_SAND_COLORS = ['#fdd835', '#fbc02d'];
    const HG_GLASS_COLORS = ['#e0f7fa', '#ffffff'];
    const HG_DIM_GLASS_TOP = '#1a1a1a';
    const HG_DIM_GLASS_BOTTOM = '#1a2626';
    const NOZZLE_X = 140;
    const NOZZLE_Y = 140;
    const COLOR_SAND_FALLING = '#fff9c4';

    function initHourglassData() {
        if (hourglassInitialized) return;
        hgPixelMap = [
            // ROW 1
            { x: 20, y: 20, c: '#e67e22' }, { x: 40, y: 20, c: '#e67e22' }, { x: 60, y: 20, c: '#e67e22' }, { x: 80, y: 20, c: '#e67e22' },
            { x: 100, y: 20, c: '#8d6e63' }, { x: 120, y: 20, c: '#8d6e63' }, { x: 140, y: 20, c: '#8d6e63' }, { x: 160, y: 20, c: '#8d6e63' }, { x: 180, y: 20, c: '#8d6e63' },
            { x: 200, y: 20, c: '#e67e22' }, { x: 220, y: 20, c: '#e67e22' }, { x: 240, y: 20, c: '#e67e22' }, { x: 260, y: 20, c: '#e67e22' },
            // ROW 2
            { x: 20, y: 40, c: '#5d4037' }, { x: 40, y: 40, c: '#5d4037' }, { x: 60, y: 40, c: '#5d4037' }, { x: 80, y: 40, c: '#5d4037' },
            { x: 100, y: 40, c: '#5d4037' }, { x: 120, y: 40, c: '#5d4037' }, { x: 140, y: 40, c: '#5d4037' }, { x: 160, y: 40, c: '#5d4037' },
            { x: 180, y: 40, c: '#5d4037' }, { x: 200, y: 40, c: '#5d4037' }, { x: 220, y: 40, c: '#5d4037' }, { x: 240, y: 40, c: '#5d4037' }, { x: 260, y: 40, c: '#5d4037' },
            // ROW 3
            { x: 60, y: 60, c: '#26a69a' }, { x: 80, y: 60, c: '#e0f7fa' }, { x: 100, y: 60, c: '#ffffff' }, { x: 120, y: 60, c: '#e0f7fa' },
            { x: 140, y: 60, c: '#e0f7fa' }, { x: 160, y: 60, c: '#e0f7fa' }, { x: 180, y: 60, c: '#e0f7fa' }, { x: 200, y: 60, c: '#e0f7fa' }, { x: 220, y: 60, c: '#26a69a' },
            // ROW 4
            { x: 80, y: 80, c: '#26a69a' }, { x: 100, y: 80, c: '#e0f7fa' }, { x: 120, y: 80, c: '#ffffff' }, { x: 140, y: 80, c: '#e0f7fa' },
            { x: 160, y: 80, c: '#e0f7fa' }, { x: 180, y: 80, c: '#e0f7fa' }, { x: 200, y: 80, c: '#26a69a' },
            // ROW 5
            { x: 100, y: 100, c: '#26a69a' }, { x: 120, y: 100, c: '#e0f7fa' }, { x: 140, y: 100, c: '#e0f7fa' }, { x: 160, y: 100, c: '#e0f7fa' }, { x: 180, y: 100, c: '#26a69a' },
            // ROW 6
            { x: 120, y: 120, c: '#26a69a' }, { x: 140, y: 120, c: '#e0f7fa' }, { x: 160, y: 120, c: '#26a69a' },
            // ROW 7
            { x: 120, y: 140, c: '#26a69a' }, { x: 140, y: 140, c: '#fdd835' }, { x: 160, y: 140, c: '#26a69a' },
            // ROW 8
            { x: 100, y: 160, c: '#26a69a' }, { x: 120, y: 160, c: '#e0f7fa' }, { x: 140, y: 160, c: '#fdd835' }, { x: 160, y: 160, c: '#e0f7fa' }, { x: 180, y: 160, c: '#26a69a' },
            // ROW 9
            { x: 80, y: 180, c: '#26a69a' }, { x: 100, y: 180, c: '#e0f7fa' }, { x: 120, y: 180, c: '#fdd835' }, { x: 140, y: 180, c: '#fdd835' },
            { x: 160, y: 180, c: '#fdd835' }, { x: 180, y: 180, c: '#e0f7fa' }, { x: 200, y: 180, c: '#26a69a' },
            // ROW 10
            { x: 60, y: 200, c: '#26a69a' }, { x: 80, y: 200, c: '#e0f7fa' }, { x: 100, y: 200, c: '#fdd835' }, { x: 120, y: 200, c: '#fdd835' },
            { x: 140, y: 200, c: '#fdd835' }, { x: 160, y: 200, c: '#fdd835' }, { x: 180, y: 200, c: '#fdd835' }, { x: 200, y: 200, c: '#e0f7fa' }, { x: 220, y: 200, c: '#26a69a' },
            // ROW 11
            { x: 60, y: 220, c: '#26a69a' }, { x: 80, y: 220, c: '#fdd835' }, { x: 100, y: 220, c: '#fdd835' }, { x: 120, y: 220, c: '#fbc02d' },
            { x: 140, y: 220, c: '#fbc02d' }, { x: 160, y: 220, c: '#fbc02d' }, { x: 180, y: 220, c: '#fdd835' }, { x: 200, y: 220, c: '#fdd835' }, { x: 220, y: 220, c: '#26a69a' },
            // ROW 12
            { x: 20, y: 240, c: '#5d4037' }, { x: 40, y: 240, c: '#5d4037' }, { x: 60, y: 240, c: '#5d4037' }, { x: 80, y: 240, c: '#5d4037' },
            { x: 100, y: 240, c: '#5d4037' }, { x: 120, y: 240, c: '#5d4037' }, { x: 140, y: 240, c: '#5d4037' }, { x: 160, y: 240, c: '#5d4037' },
            { x: 180, y: 240, c: '#5d4037' }, { x: 200, y: 240, c: '#5d4037' }, { x: 220, y: 240, c: '#5d4037' }, { x: 240, y: 240, c: '#5d4037' }, { x: 260, y: 240, c: '#5d4037' },
            // ROW 13
            { x: 20, y: 260, c: '#e67e22' }, { x: 40, y: 260, c: '#e67e22' }, { x: 60, y: 260, c: '#e67e22' }, { x: 80, y: 260, c: '#e67e22' },
            { x: 100, y: 260, c: '#8d6e63' }, { x: 120, y: 260, c: '#8d6e63' }, { x: 140, y: 260, c: '#8d6e63' }, { x: 160, y: 260, c: '#8d6e63' }, { x: 180, y: 260, c: '#8d6e63' },
            { x: 200, y: 260, c: '#e67e22' }, { x: 220, y: 260, c: '#e67e22' }, { x: 240, y: 260, c: '#e67e22' }, { x: 260, y: 260, c: '#e67e22' }
        ];

        hgPixelMap.forEach(p => {
            p.dimC = adjustBrightness(p.c, 0.2);
            p.activeC = adjustBrightness(p.c, 0.6);
            p.brightC = p.c;
            if (p.y < 145) p.emptyGlassC = HG_DIM_GLASS_TOP;
            else p.emptyGlassC = HG_DIM_GLASS_BOTTOM;
        });

        const allSand = [];
        const topSlots = [];
        hgPixelMap.forEach((p, i) => { if (HG_SAND_COLORS.includes(p.c)) allSand.push(i); if (p.y < 145 && HG_GLASS_COLORS.includes(p.c)) topSlots.push(i); });

        topSlots.sort((a, b) => (hgPixelMap[a].y !== hgPixelMap[b].y) ? hgPixelMap[a].y - hgPixelMap[b].y : hgPixelMap[a].x - hgPixelMap[b].x);
        allSand.sort((a, b) => (hgPixelMap[a].y !== hgPixelMap[b].y) ? hgPixelMap[b].y - hgPixelMap[a].y : Math.abs(hgPixelMap[a].x - 140) - Math.abs(hgPixelMap[b].x - 140));

        const safeCount = Math.min(allSand.length, topSlots.length);
        for (let i = 0; i < safeCount; i++) hgGrains.push({ sourceIndex: topSlots[i], targetIndex: allSand[i] });

        hgGrains.sort((a, b) => {
            let pA = hgPixelMap[a.sourceIndex], pB = hgPixelMap[b.sourceIndex];
            return (pA.y !== pB.y) ? pA.y - pB.y : pA.x - pB.x;
        });
        hourglassInitialized = true;
    }

    function adjustBrightness(hex, factor) {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
        r = Math.floor(r * factor); g = Math.floor(g * factor); b = Math.floor(b * factor);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    function lerpColor(c1, c2, t) {
        c1 = c1.replace(/^#/, '');
        c2 = c2.replace(/^#/, '');
        let r1 = parseInt(c1.substring(0, 2), 16), g1 = parseInt(c1.substring(2, 4), 16), b1 = parseInt(c1.substring(4, 6), 16);
        let r2 = parseInt(c2.substring(0, 2), 16), g2 = parseInt(c2.substring(2, 4), 16), b2 = parseInt(c2.substring(4, 6), 16);
        let r = Math.floor(r1 + (r2 - r1) * t);
        let g = Math.floor(g1 + (g2 - g1) * t);
        let b = Math.floor(b1 + (b2 - b1) * t);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    function renderHourglass(state) {
        initHourglassData();
        let container = document.querySelector('.hourglass-container');
        if (!container) {
            const parent = document.querySelector('.timer-display') || document.querySelector('.timer-ring').parentNode;
            container = document.createElement('div');
            container.className = 'hourglass-container';
            container.innerHTML = '<div class="hourglass-pixel" id="hourglass-art"></div>';
            parent.appendChild(container);
        }
        const art = container.querySelector('#hourglass-art');
        if (!art) return;

        const progress = state.progress; // 0.0 to 1.0
        const totalGrains = hgGrains.length;

        let frameColors = hgPixelMap.map(p => (HG_SAND_COLORS.includes(p.c) || HG_GLASS_COLORS.includes(p.c)) ? p.emptyGlassC : p.dimC);
        let fallingShadow = null;

        if (progress >= 1.0) {
            // FINISHED
            for (let i = 0; i < totalGrains; i++) {
                const grain = hgGrains[i];
                const targetP = hgPixelMap[grain.targetIndex];
                frameColors[grain.targetIndex] = targetP.brightC;
            }
        } else {
            // ANIMATING
            let grainIndex = Math.floor(progress * totalGrains);
            if (grainIndex >= totalGrains) grainIndex = totalGrains - 1;

            let grainDuration = state.totalSeconds / totalGrains;
            let currentElapsed = state.totalSeconds * progress;
            let grainTime = currentElapsed % grainDuration;
            // Handle edge case where grainTime might be NaN if totalSeconds is 0
            if (state.totalSeconds === 0) grainTime = 0;

            let grainProgress = Math.min(grainTime / grainDuration, 1.0);

            for (let i = 0; i < totalGrains; i++) {
                const grain = hgGrains[i];
                let sourceP = hgPixelMap[grain.sourceIndex];
                let targetP = hgPixelMap[grain.targetIndex];

                if (i > grainIndex) {
                    // WAITING
                    frameColors[grain.sourceIndex] = targetP.dimC;
                } else if (i < grainIndex) {
                    // LANDED
                    frameColors[grain.targetIndex] = targetP.brightC;
                } else if (i === grainIndex) {
                    // ACTIVE GRAIN
                    // Phase 1: Glow/Pulse (0% - 20%)
                    if (grainProgress < 0.20) {
                        let t = Math.sin((grainProgress / 0.20) * Math.PI);
                        let pulseColor = lerpColor(targetP.dimC, targetP.activeC, t);
                        frameColors[grain.sourceIndex] = pulseColor;
                    }
                    // Phase 2: Gap (20% - 25%) - Do nothing (empty)

                    // Phase 3: Falling (25% - 100%)
                    else if (grainProgress >= 0.25) {
                        let fallTime = (grainProgress - 0.25) / 0.75;
                        let curX, curY;

                        if (fallTime < 0.8) {
                            // Vertical Drop
                            let pDrop = Math.pow(fallTime / 0.8, 2);
                            curX = NOZZLE_X;
                            curY = NOZZLE_Y + (targetP.y - NOZZLE_Y) * pDrop;
                        } else {
                            // Horizontal Slide
                            let pSlide = (fallTime - 0.8) / 0.2;
                            curX = NOZZLE_X + (targetP.x - NOZZLE_X) * pSlide;
                            curY = targetP.y;
                        }
                        fallingShadow = `${curX}px ${curY}px 0 0 ${COLOR_SAND_FALLING}`;
                    }
                }
            }
        }

        let parts = frameColors.map((c, i) => `${hgPixelMap[i].x}px ${hgPixelMap[i].y}px 0 0 ${c}`);
        if (fallingShadow) parts.push(fallingShadow);
        art.style.boxShadow = parts.join(', ');
    }

    return {
        init,
        setStyle,
        render
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) module.exports = TimerStyles;
