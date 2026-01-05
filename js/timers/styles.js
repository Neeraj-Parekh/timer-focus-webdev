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
            .analog-clock { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; }
            .clock-face { width: 100%; height: 100%; border-radius: 50%; background: var(--bg-secondary); border: 4px solid var(--accent-primary); position: relative; box-shadow: inset 0 0 30px rgba(0,0,0,0.3); }
            .clock-markers { position: absolute; inset: 10px; }
            .clock-marker { position: absolute; left: 50%; top: 0; width: 2px; height: 10px; background: var(--text-muted); transform-origin: center 90px; }
            .clock-marker:nth-child(3n) { height: 15px; width: 3px; background: var(--text-primary); }
            .clock-hand { position: absolute; left: 50%; bottom: 50%; transform-origin: bottom center; border-radius: 4px; }
            .minute-hand { width: 4px; height: 60px; background: var(--accent-primary); margin-left: -2px; box-shadow: 0 0 10px var(--accent-primary); }
            .second-hand { width: 2px; height: 70px; background: var(--accent-error); margin-left: -1px; }
            .clock-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
            .linear-progress-container { width: 100%; padding: 0 var(--space-4); margin-bottom: var(--space-6); }
            .linear-progress-bg { height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
            .linear-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: var(--radius-full); transition: width 1s linear; box-shadow: 0 0 10px var(--accent-primary); }
            .linear-progress-labels { display: flex; justify-content: space-between; margin-top: var(--space-2); font-size: var(--text-sm); color: var(--text-muted); font-family: var(--font-mono); }
            .timer-time.digital-style { font-family: 'JetBrains Mono', monospace; letter-spacing: 4px; text-shadow: 0 0 20px var(--accent-primary); }
            .timer-time.blink::after { content: ''; opacity: 0.3; }
            .timer-display.minimal-style { background: none; }
            .timer-display.minimal-style .timer-svg { opacity: 0.3; }
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

        const progress = state.progress;
        let frameColors = hgPixelMap.map(p => (HG_SAND_COLORS.includes(p.c) || HG_GLASS_COLORS.includes(p.c)) ? p.emptyGlassC : p.dimC);

        const totalGrains = hgGrains.length;
        let grainIndex = Math.floor(progress * totalGrains);
        if (grainIndex >= totalGrains) grainIndex = totalGrains - 1;

        for (let i = 0; i < totalGrains; i++) {
            const grain = hgGrains[i];
            const targetP = hgPixelMap[grain.targetIndex];
            if (i > grainIndex) frameColors[grain.sourceIndex] = targetP.dimC;
            else frameColors[grain.targetIndex] = targetP.brightC;
        }

        let parts = frameColors.map((c, i) => `${hgPixelMap[i].x}px ${hgPixelMap[i].y}px 0 0 ${c}`);
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
