/**
 * Focus Timer Pro - Pomodoro Module
 * Work/break cycles with session tracking
 */

const Pomodoro = (() => {
    // Pomodoro settings
    let settings = {
        workDuration: 25,       // minutes
        shortBreakDuration: 5,  // minutes
        longBreakDuration: 15,  // minutes
        sessionsUntilLongBreak: 4,
        autoStartBreaks: true,
        autoStartWork: false,
        breakSound: 'chime',
        workSound: 'bell'
    };

    // Session state
    let state = {
        currentPhase: 'idle',   // 'work', 'shortBreak', 'longBreak', 'idle'
        sessionsCompleted: 0,
        totalWorkTime: 0,       // seconds
        totalBreakTime: 0,      // seconds
        sessionStartTime: null,
        history: []             // Array of completed sessions
    };

    // Callbacks
    let callbacks = {
        onPhaseChange: null,
        onSessionComplete: null,
        onBreakStart: null,
        onWorkStart: null
    };

    /**
     * Initialize with settings
     */
    function init(customSettings = {}, eventCallbacks = {}) {
        settings = { ...settings, ...customSettings };
        callbacks = { ...callbacks, ...eventCallbacks };
        loadState();
        return state;
    }

    /**
     * Start a work session
     */
    function startWork(taskName = null) {
        state.currentPhase = 'work';
        state.sessionStartTime = Date.now();

        if (callbacks.onWorkStart) {
            callbacks.onWorkStart({
                duration: settings.workDuration,
                taskName,
                sessionsCompleted: state.sessionsCompleted
            });
        }

        if (callbacks.onPhaseChange) {
            callbacks.onPhaseChange('work', settings.workDuration * 60);
        }

        return settings.workDuration * 60; // Return seconds
    }

    /**
     * Start a break (auto-detects short vs long)
     */
    function startBreak() {
        const isLongBreak = (state.sessionsCompleted + 1) % settings.sessionsUntilLongBreak === 0;
        const breakType = isLongBreak ? 'longBreak' : 'shortBreak';
        const duration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;

        state.currentPhase = breakType;
        state.sessionStartTime = Date.now();

        if (callbacks.onBreakStart) {
            callbacks.onBreakStart({
                type: breakType,
                duration,
                sessionsCompleted: state.sessionsCompleted
            });
        }

        if (callbacks.onPhaseChange) {
            callbacks.onPhaseChange(breakType, duration * 60);
        }

        return duration * 60; // Return seconds
    }

    /**
     * Complete current phase
     */
    function completePhase() {
        const phaseData = {
            phase: state.currentPhase,
            duration: state.currentPhase === 'work'
                ? settings.workDuration * 60
                : (state.currentPhase === 'longBreak'
                    ? settings.longBreakDuration * 60
                    : settings.shortBreakDuration * 60),
            timestamp: Date.now()
        };

        // Update totals
        if (state.currentPhase === 'work') {
            state.sessionsCompleted++;
            state.totalWorkTime += phaseData.duration;
        } else {
            state.totalBreakTime += phaseData.duration;
        }

        // Add to history
        state.history.push(phaseData);

        // Save state
        saveState();

        // Trigger callback
        if (callbacks.onSessionComplete) {
            callbacks.onSessionComplete({
                ...phaseData,
                sessionsCompleted: state.sessionsCompleted,
                totalWorkTime: state.totalWorkTime,
                totalBreakTime: state.totalBreakTime
            });
        }

        // Return next phase info
        const wasWork = state.currentPhase === 'work';
        state.currentPhase = 'idle';

        return {
            wasWork,
            shouldAutoStart: wasWork ? settings.autoStartBreaks : settings.autoStartWork,
            nextPhase: wasWork ? 'break' : 'work'
        };
    }

    /**
     * Get appropriate sound for current phase
     */
    function getPhaseSound() {
        switch (state.currentPhase) {
            case 'work':
                return settings.workSound;
            case 'shortBreak':
            case 'longBreak':
                return settings.breakSound;
            default:
                return settings.workSound;
        }
    }

    /**
     * Get session summary
     */
    function getSessionSummary() {
        const workMinutes = Math.round(state.totalWorkTime / 60);
        const breakMinutes = Math.round(state.totalBreakTime / 60);

        return {
            sessionsCompleted: state.sessionsCompleted,
            totalWorkTime: formatDuration(state.totalWorkTime),
            totalBreakTime: formatDuration(state.totalBreakTime),
            workMinutes,
            breakMinutes,
            focusRatio: state.totalWorkTime > 0
                ? Math.round((state.totalWorkTime / (state.totalWorkTime + state.totalBreakTime)) * 100)
                : 0,
            history: state.history.slice(-10), // Last 10 phases
            averageSessionLength: state.sessionsCompleted > 0
                ? formatDuration(state.totalWorkTime / state.sessionsCompleted)
                : '0m'
        };
    }

    /**
     * Generate session end summary HTML
     */
    function getSessionEndHTML() {
        const summary = getSessionSummary();

        return `
            <div class="session-summary">
                <div class="summary-header">
                    <h3>🎉 Great Focus Session!</h3>
                    <p>Here's how you did</p>
                </div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-value">${summary.sessionsCompleted}</span>
                        <span class="stat-label">Sessions</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${summary.totalWorkTime}</span>
                        <span class="stat-label">Focus Time</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${summary.focusRatio}%</span>
                        <span class="stat-label">Focus Ratio</span>
                    </div>
                </div>
                <div class="summary-breakdown">
                    <div class="breakdown-item">
                        <span>🎯 Work Time</span>
                        <span>${summary.totalWorkTime}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>☕ Break Time</span>
                        <span>${summary.totalBreakTime}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>📊 Avg Session</span>
                        <span>${summary.averageSessionLength}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Reset session
     */
    function resetSession() {
        state = {
            currentPhase: 'idle',
            sessionsCompleted: 0,
            totalWorkTime: 0,
            totalBreakTime: 0,
            sessionStartTime: null,
            history: []
        };
        saveState();
    }

    /**
     * Update settings
     */
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
    }

    /**
     * Get current state
     */
    function getState() {
        return { ...state };
    }

    /**
     * Get settings
     */
    function getSettings() {
        return { ...settings };
    }

    /**
     * Format duration helper
     */
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    /**
     * Save state to storage
     */
    function saveState() {
        try {
            localStorage.setItem('pomodoro_state', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save pomodoro state:', e);
        }
    }

    /**
     * Load state from storage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem('pomodoro_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only restore if from today
                const today = new Date().toDateString();
                const savedDate = new Date(parsed.sessionStartTime || Date.now()).toDateString();

                if (today === savedDate) {
                    state = { ...state, ...parsed };
                }
            }
        } catch (e) {
            console.warn('Failed to load pomodoro state:', e);
        }
    }

    /**
     * Inject CSS for session summary
     */
    function injectStyles() {
        if (document.getElementById('pomodoro-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'pomodoro-styles-css';
        styles.textContent = `
            .session-summary {
                padding: var(--space-4);
            }
            
            .summary-header {
                text-align: center;
                margin-bottom: var(--space-4);
            }
            
            .summary-header h3 {
                font-size: var(--text-xl);
                margin-bottom: var(--space-2);
            }
            
            .summary-header p {
                color: var(--text-muted);
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--space-3);
                margin-bottom: var(--space-4);
            }
            
            .summary-stat {
                text-align: center;
                padding: var(--space-3);
                background: var(--bg-tertiary);
                border-radius: var(--radius-lg);
            }
            
            .summary-stat .stat-value {
                display: block;
                font-size: var(--text-2xl);
                font-weight: var(--font-bold);
                color: var(--accent-primary);
            }
            
            .summary-stat .stat-label {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .summary-breakdown {
                border-top: 1px solid var(--border-color);
                padding-top: var(--space-4);
            }
            
            .breakdown-item {
                display: flex;
                justify-content: space-between;
                padding: var(--space-2) 0;
                font-size: var(--text-sm);
            }
            
            .breakdown-item span:last-child {
                font-weight: var(--font-semibold);
            }
            
            /* Break indicator */
            .break-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                padding: var(--space-2);
                background: linear-gradient(135deg, var(--accent-success) 0%, #059669 100%);
                color: white;
                text-align: center;
                font-weight: var(--font-semibold);
                z-index: 100;
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            
            .timer-display.break-mode .timer-progress {
                stroke: var(--accent-success);
            }
            
            .timer-display.break-mode .timer-glow {
                filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5));
            }
        `;
        document.head.appendChild(styles);
    }

    // Inject styles
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    return {
        init,
        startWork,
        startBreak,
        completePhase,
        getPhaseSound,
        getSessionSummary,
        getSessionEndHTML,
        resetSession,
        updateSettings,
        getState,
        getSettings,
        formatDuration
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pomodoro;
}
