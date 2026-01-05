/**
 * Focus Timer Pro - Timer Module
 * Core countdown logic with rotation support
 */

const Timer = (() => {
    // Timer state
    let state = {
        isRunning: false,
        isPaused: false,
        currentTaskId: null,
        currentTaskIndex: 0,
        remainingSeconds: 0,
        totalSeconds: 0,
        sessionStartTime: null,
        pausedAt: null,
        queue: [],
        completedInSession: 0,
        totalFocusTime: 0,
        // ML Data Collection tracking
        pauseCount: 0,
        interruptionCount: 0, // Tab switches while timer running
        longestStreak: 0,     // Longest uninterrupted focus (seconds)
        currentStreak: 0,     // Current streak (seconds)
        lastFocusStart: null  // Track when current focus period began
    };

    // Timer interval
    let timerInterval = null;

    // Callbacks
    let onTick = null;
    let onComplete = null;
    let onTaskChange = null;
    let onStateChange = null;

    /**
     * Initialize timer with queue
     */
    function init(taskQueue, callbacks = {}) {
        state.queue = taskQueue || [];
        state.currentTaskIndex = 0;

        onTick = callbacks.onTick || (() => { });
        onComplete = callbacks.onComplete || (() => { });
        onTaskChange = callbacks.onTaskChange || (() => { });
        onStateChange = callbacks.onStateChange || (() => { });

        if (state.queue.length > 0) {
            setCurrentTask(state.queue[0]);
        }

        notifyStateChange();
    }

    /**
     * Set current task
     */
    function setCurrentTask(task) {
        if (!task) return;

        state.currentTaskId = task.id;
        state.totalSeconds = task.duration * 60;
        state.remainingSeconds = state.totalSeconds;

        onTaskChange(task);
        notifyStateChange();
    }

    /**
     * Start the timer
     */
    function start() {
        if (state.isRunning && !state.isPaused) return;

        if (state.queue.length === 0) {
            console.warn('No tasks in queue');
            return false;
        }

        // If paused, resume from where we left off
        if (state.isPaused) {
            state.isPaused = false;
            // ML Tracking: Restart focus streak timer
            state.lastFocusStart = Date.now();
        } else {
            // Fresh start - reset ML tracking
            state.sessionStartTime = Date.now();
            state.pauseCount = 0;
            state.interruptionCount = 0;
            state.longestStreak = 0;
            state.currentStreak = 0;
            state.lastFocusStart = Date.now();

            const currentTask = state.queue[state.currentTaskIndex];
            if (currentTask) {
                setCurrentTask(currentTask);
            }
        }

        state.isRunning = true;
        startInterval();
        notifyStateChange();

        return true;
    }

    /**
     * Pause the timer
     */
    function pause() {
        if (!state.isRunning || state.isPaused) return;

        // ML Tracking: Increment pause count
        state.pauseCount++;

        // ML Tracking: Calculate current focus streak and update longest
        if (state.lastFocusStart) {
            state.currentStreak = Math.floor((Date.now() - state.lastFocusStart) / 1000);
            if (state.currentStreak > state.longestStreak) {
                state.longestStreak = state.currentStreak;
            }
        }

        state.isPaused = true;
        state.pausedAt = Date.now();
        stopInterval();
        notifyStateChange();
    }

    /**
     * Resume from pause
     */
    function resume() {
        if (!state.isPaused) return;

        state.isPaused = false;
        state.pausedAt = null;
        // ML Tracking: Restart focus streak timer
        state.lastFocusStart = Date.now();
        startInterval();
        notifyStateChange();
    }

    /**
     * Toggle play/pause
     */
    function togglePlayPause() {
        if (!state.isRunning) {
            return start();
        } else if (state.isPaused) {
            resume();
        } else {
            pause();
        }
        return true;
    }

    /**
     * Stop the timer completely
     */
    function stop() {
        stopInterval();

        // Calculate focus time for this session
        if (state.sessionStartTime) {
            const sessionDuration = state.totalSeconds - state.remainingSeconds;
            state.totalFocusTime += sessionDuration;
        }

        state.isRunning = false;
        state.isPaused = false;
        state.sessionStartTime = null;
        state.pausedAt = null;

        // Reset to first task
        if (state.queue.length > 0) {
            state.currentTaskIndex = 0;
            setCurrentTask(state.queue[0]);
        }

        notifyStateChange();
    }

    /**
     * Skip to next task
     */
    function skipNext() {
        const wasRunning = state.isRunning;
        stopInterval();

        // Record skip if running
        if (wasRunning && state.remainingSeconds < state.totalSeconds) {
            recordSession(false);
        }

        // Move to next task
        if (state.queue.length > 0) {
            state.currentTaskIndex = (state.currentTaskIndex + 1) % state.queue.length;
            setCurrentTask(state.queue[state.currentTaskIndex]);
        }

        // Continue if was running
        if (wasRunning) {
            state.isRunning = true;
            state.isPaused = false;
            state.sessionStartTime = Date.now();
            startInterval();
        }

        notifyStateChange();
    }

    /**
     * Skip to previous task
     */
    function skipPrev() {
        const wasRunning = state.isRunning;
        stopInterval();

        // Move to previous task
        if (state.queue.length > 0) {
            state.currentTaskIndex = (state.currentTaskIndex - 1 + state.queue.length) % state.queue.length;
            setCurrentTask(state.queue[state.currentTaskIndex]);
        }

        // Continue if was running
        if (wasRunning) {
            state.isRunning = true;
            state.isPaused = false;
            state.sessionStartTime = Date.now();
            startInterval();
        }

        notifyStateChange();
    }

    /**
     * Complete current task and move to next
     */
    async function complete() {
        stopInterval();

        // Record completed session
        await recordSession(true);
        state.completedInSession++;

        // Trigger completion callback
        const currentTask = getCurrentTask();
        onComplete(currentTask);

        // Move to next task
        if (state.queue.length > 1) {
            state.currentTaskIndex = (state.currentTaskIndex + 1) % state.queue.length;
            setCurrentTask(state.queue[state.currentTaskIndex]);

            // Auto-start next task after short delay
            state.isRunning = true;
            state.isPaused = false;
            state.sessionStartTime = Date.now();
            startInterval();
        } else {
            // All tasks completed
            state.isRunning = false;
            state.isPaused = false;
        }

        notifyStateChange();
    }

    /**
     * Record session to storage
     */
    async function recordSession(wasCompleted) {
        const currentTask = getCurrentTask();
        if (!currentTask) return;

        const actualDuration = state.totalSeconds - state.remainingSeconds;

        const session = {
            taskId: currentTask.id,
            plannedDuration: state.totalSeconds,
            actualDuration: actualDuration,
            completedAt: Date.now(),
            wasCompleted: wasCompleted,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay()
        };

        try {
            await Storage.Sessions.add(session);

            if (wasCompleted) {
                await Storage.DailyStats.incrementCompleted();
            }

            // Increment task's session count
            if (wasCompleted) {
                await Tasks.incrementSessions(currentTask.id);
            }

            await Storage.DailyStats.addFocusTime(actualDuration);
        } catch (err) {
            console.error('Failed to record session:', err);
        }
    }

    /**
     * Start the interval timer
     */
    function startInterval() {
        stopInterval();

        timerInterval = setInterval(() => {
            if (state.remainingSeconds > 0) {
                state.remainingSeconds--;
                state.totalFocusTime++;

                onTick({
                    remaining: state.remainingSeconds,
                    total: state.totalSeconds,
                    progress: 1 - (state.remainingSeconds / state.totalSeconds),
                    formatted: formatTime(state.remainingSeconds)
                });
            } else {
                // Timer completed
                complete();
            }
        }, 1000);
    }

    /**
     * Stop the interval timer
     */
    function stopInterval() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /**
     * Format seconds as MM:SS
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Format seconds as Xh Xm
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
     * Get current task
     */
    function getCurrentTask() {
        if (state.queue.length === 0) return null;
        return state.queue[state.currentTaskIndex];
    }

    /**
     * Get timer state
     */
    function getState() {
        return {
            ...state,
            formattedTime: formatTime(state.remainingSeconds),
            formattedFocusTime: formatDuration(state.totalFocusTime),
            progress: state.totalSeconds > 0
                ? 1 - (state.remainingSeconds / state.totalSeconds)
                : 0,
            currentTask: getCurrentTask()
        };
    }

    /**
     * Update queue
     */
    function setQueue(tasks) {
        state.queue = tasks;

        // Reset to first task if not running
        if (!state.isRunning && tasks.length > 0) {
            state.currentTaskIndex = 0;
            setCurrentTask(tasks[0]);
        }

        notifyStateChange();
    }

    /**
     * Add task to queue
     */
    function addToQueue(task) {
        state.queue.push(task);

        // If first task, set it as current
        if (state.queue.length === 1) {
            setCurrentTask(task);
        }

        notifyStateChange();
    }

    /**
     * Remove task from queue
     */
    function removeFromQueue(taskId) {
        const index = state.queue.findIndex(t => t.id === taskId);
        if (index === -1) return;

        state.queue.splice(index, 1);

        // Adjust current index if needed
        if (index < state.currentTaskIndex) {
            state.currentTaskIndex--;
        } else if (index === state.currentTaskIndex) {
            // Current task removed, move to next
            if (state.queue.length > 0) {
                state.currentTaskIndex = state.currentTaskIndex % state.queue.length;
                setCurrentTask(state.queue[state.currentTaskIndex]);
            }
        }

        notifyStateChange();
    }

    /**
     * Notify state change
     */
    function notifyStateChange() {
        if (onStateChange) {
            onStateChange(getState());
        }
    }

    /**
     * Reset session stats
     */
    function resetSession() {
        state.completedInSession = 0;
        state.totalFocusTime = 0;
        notifyStateChange();
    }

    /**
     * ML Tracking: Increment interruption count (called on tab switch)
     */
    function incrementInterruption() {
        if (state.isRunning && !state.isPaused) {
            state.interruptionCount++;
        }
    }

    return {
        init,
        start,
        pause,
        resume,
        stop,
        togglePlayPause,
        skipNext,
        skipPrev,
        complete,
        setQueue,
        addToQueue,
        removeFromQueue,
        getState,
        getCurrentTask,
        formatTime,
        formatDuration,
        resetSession,
        incrementInterruption  // ML Data Collection
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
}

// ML Data Collection: Track tab switches as interruptions
document.addEventListener('visibilitychange', () => {
    if (typeof Timer !== 'undefined' && document.hidden) {
        Timer.incrementInterruption();
    }
});
