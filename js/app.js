/**
 * Focus Timer Pro - Main Application
 * Entry point and event handling
 */

const App = (() => {
    // App state
    let isInitialized = false;
    let deferredInstallPrompt = null;
    let settings = {};
    let screenWakeLock = null;

    /**
     * Initialize the application
     */
    async function init() {
        console.log('Focus Timer Pro - Initializing...');

        try {
            // Initialize storage first
            await Storage.init();
            console.log('✓ Storage initialized');

            // Load settings
            settings = await Storage.Settings.init();
            console.log('✓ Settings loaded');

            // Initialize UI
            UI.init();
            console.log('✓ UI initialized');

            // Initialize audio
            Audio.init();
            Audio.updateSettings(settings);
            console.log('✓ Audio initialized');

            // Initialize notifications
            await Notifications.init();
            console.log('✓ Notifications initialized');

            // Initialize timer first (with empty queue) so callbacks are ready
            Timer.init([], {
                onTick: handleTimerTick,
                onComplete: handleTimerComplete,
                onTaskChange: handleTaskChange,
                onStateChange: handleTimerStateChange
            });
            console.log('✓ Timer callbacks initialized');

            // Initialize tasks and load data
            const { tasks, folders } = await Tasks.init((data) => {
                // Callback when tasks update
                const queue = Tasks.getQueue();
                UI.renderTaskQueue(queue, Timer.getState().currentTaskId);
                Timer.setQueue(queue);
            });
            console.log('✓ Tasks loaded:', tasks.length);

            // Initialize integrations
            if (typeof TickTick !== 'undefined') TickTick.init();

            // Initialize data collection (surveys, prompts, ML metrics)
            if (typeof DataCollection !== 'undefined') DataCollection.init();

            // Set initial queue
            const queue = Tasks.getQueue();
            Timer.setQueue(queue);
            console.log('✓ Timer initialized');

            // Render initial UI
            UI.renderTaskQueue(queue, Timer.getState().currentTaskId);
            UI.updateSessionInfo(Timer.getState());
            await UI.updateStats();

            // Set up event listeners
            setupEventListeners();
            console.log('✓ Event listeners attached');

            // Set up PWA install prompt
            setupInstallPrompt();

            // Initialize theme selector
            if (typeof Themes !== 'undefined') {
                Themes.renderSelector('theme-selector');
                console.log('✓ Theme selector initialized');
            }

            // Initialize rotation templates
            if (typeof RotationTemplates !== 'undefined') {
                RotationTemplates.renderSelector('template-selector', (template) => {
                    if (template) {
                        const queue = RotationTemplates.apply(template.id, Tasks.getAll());
                        Timer.setQueue(queue);
                        UI.renderTaskQueue(queue, Timer.getState().currentTaskId);
                        UI.showToast(`Applied "${template.name}" template`, 'success');
                    }
                });
                console.log('✓ Rotation templates initialized');
            }

            // Initialize keyboard shortcuts
            if (typeof KeyboardShortcuts !== 'undefined') {
                KeyboardShortcuts.init(handleShortcutAction);
                console.log('✓ Keyboard shortcuts initialized');
            }

            // Initialize timer styles
            if (typeof TimerStyles !== 'undefined') {
                TimerStyles.init();
                if (settings.timerStyle) {
                    TimerStyles.setStyle(settings.timerStyle);
                }
                console.log('✓ Timer styles initialized');
            }

            // Initialize Screen Wake Lock setting checkbox
            if (document.getElementById('setting-keep-screen-on')) {
                document.getElementById('setting-keep-screen-on').checked = settings.keepScreenOn !== false;
            }

            // Handle visibility for Wake Lock re-acquisition
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Initialize timer styles
            if (typeof TimerStyles !== 'undefined') {
                TimerStyles.init();
                if (settings.timerStyle) {
                    TimerStyles.setStyle(settings.timerStyle);
                }
                console.log('✓ Timer styles initialized');
            }

            isInitialized = true;
            console.log('✓ App ready!');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            UI.showToast('Failed to initialize app. Please refresh.', 'error');
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Timer controls
        document.getElementById('btn-play-pause')?.addEventListener('click', () => {
            Timer.togglePlayPause();
        });

        document.getElementById('btn-stop')?.addEventListener('click', () => {
            if (Timer.getState().isRunning) {
                UI.confirm('Stop the timer? Progress will be saved.', () => {
                    Timer.stop();
                    UI.showToast('Timer stopped', 'info');
                });
            }
        });

        document.getElementById('btn-skip-next')?.addEventListener('click', () => {
            Timer.skipNext();
        });

        document.getElementById('btn-skip-prev')?.addEventListener('click', () => {
            Timer.skipPrev();
        });

        // Add task button
        document.getElementById('btn-add-task')?.addEventListener('click', () => {
            UI.resetTaskForm();
            UI.openModal('modal-task');
        });

        // Task form submission
        document.getElementById('form-task')?.addEventListener('submit', handleTaskFormSubmit);

        // Brain dump FAB
        document.getElementById('fab-braindump')?.addEventListener('click', () => {
            UI.openModal('modal-braindump');
        });

        // Brain dump form submission
        document.getElementById('form-braindump')?.addEventListener('submit', handleBraindumpSubmit);

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    UI.closeModal(modal.id);
                }
            });
        });

        // Modal backdrop click to close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    UI.closeModal(modal.id);
                }
            });
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('task-color').value = e.target.dataset.color;
            });
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (view) {
                    UI.showView(view);
                }
            });
        });

        // Task queue click handling (event delegation)
        document.getElementById('task-queue')?.addEventListener('click', handleTaskQueueClick);
        document.getElementById('task-list')?.addEventListener('click', handleTaskQueueClick);

        // Settings changes
        document.getElementById('setting-timer-style')?.addEventListener('change', (e) => {
            Storage.Settings.set('timerStyle', e.target.value);
            settings.timerStyle = e.target.value;
            if (typeof TimerStyles !== 'undefined') {
                TimerStyles.setStyle(e.target.value);
                // Trigger update to render new style immediately
                UI.updateTimer(Timer.getState());
            }
        });

        document.getElementById('setting-default-duration')?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value) || 25;
            Storage.Settings.set('defaultDuration', value);
            settings.defaultDuration = value;
        });

        document.getElementById('setting-keep-screen-on')?.addEventListener('change', (e) => {
            Storage.Settings.set('keepScreenOn', e.target.checked);
            settings.keepScreenOn = e.target.checked;

            // Toggle lock immediately based on timer state
            if (e.target.checked) {
                if (Timer.getState().isRunning && !Timer.getState().isPaused) {
                    requestWakeLock();
                }
            } else {
                releaseWakeLock();
            }
        });

        // Data Backup/Restore
        document.getElementById('btn-backup-data')?.addEventListener('click', async () => {
            try {
                const json = await Storage.exportData();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focus-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                UI.showToast('Backup successful!', 'success');
            } catch (err) {
                console.error('Backup failed:', err);
                UI.showToast('Backup failed: ' + err.message, 'error');
            }
        });

        // Export ML Training Data (CSV)
        document.getElementById('btn-export-ml-data')?.addEventListener('click', async () => {
            if (typeof DataCollection !== 'undefined') {
                await DataCollection.exportTrainingData();
            } else {
                UI.showToast('DataCollection module not loaded', 'error');
            }
        });

        document.getElementById('btn-restore-data')?.addEventListener('click', () => {
            // Trigger hidden file input
            document.getElementById('file-restore-data')?.click();
        });

        document.getElementById('file-restore-data')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                // Confirm before overwriting
                if (!confirm('This will overwrite all existing data. Are you sure you want to restore?')) {
                    e.target.value = ''; // Reset input
                    return;
                }

                await Storage.importData(text);
                UI.showToast('Data restored successfully! reloading...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                console.error('Restore failed:', err);
                UI.showToast('Restore failed: ' + err.message, 'error');
                e.target.value = '';
            }
        });

        document.getElementById('setting-alert-sound')?.addEventListener('change', (e) => {
            Storage.Settings.set('alertSound', e.target.value);
            settings.alertSound = e.target.value;
            Audio.updateSettings(settings);
            // Preview sound
            Audio.playAlert(e.target.value);
        });

        document.getElementById('setting-work-sound')?.addEventListener('change', (e) => {
            Storage.Settings.set('workSound', e.target.value);
            settings.workSound = e.target.value;
            Audio.updateSettings(settings);
            Audio.playWorkComplete();
        });

        document.getElementById('setting-break-sound')?.addEventListener('change', (e) => {
            Storage.Settings.set('breakSound', e.target.value);
            settings.breakSound = e.target.value;
            Audio.updateSettings(settings);
            Audio.playBreakComplete();
        });

        document.getElementById('setting-volume')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            Storage.Settings.set('volume', value);
            settings.volume = value;
            Audio.updateSettings(settings);
        });

        document.getElementById('setting-vibrate')?.addEventListener('change', (e) => {
            Storage.Settings.set('vibrate', e.target.checked);
            settings.vibrate = e.target.checked;
        });

        document.getElementById('setting-noise-type')?.addEventListener('change', (e) => {
            Storage.Settings.set('noiseType', e.target.value);
            settings.noiseType = e.target.value;
            Audio.updateSettings(settings);

            // Start/stop noise
            if (e.target.value !== 'none') {
                Audio.startNoise(e.target.value);
            } else {
                Audio.stopNoise();
            }
        });

        document.getElementById('setting-noise-volume')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            Storage.Settings.set('noiseVolume', value);
            settings.noiseVolume = value;
            Audio.updateSettings(settings);
        });

        // Ambient sound sliders
        document.querySelectorAll('[data-ambient]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const type = e.target.dataset.ambient;
                const volume = parseInt(e.target.value) / 100;

                if (volume > 0) {
                    if (typeof AmbientAudio !== 'undefined') {
                        AmbientAudio.start(type, volume);
                    }
                } else {
                    if (typeof AmbientAudio !== 'undefined') {
                        AmbientAudio.stop(type);
                    }
                }
            });
        });

        // Export CSV button
        document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
            try {
                await Statistics.downloadCSV();
                UI.showToast('Statistics exported!', 'success');
            } catch (err) {
                console.error('Export failed:', err);
                UI.showToast('Export failed', 'error');
            }
        });

        // Session Summary button
        document.getElementById('btn-session-summary')?.addEventListener('click', () => {
            if (typeof Pomodoro !== 'undefined') {
                const summary = Pomodoro.getSessionSummary();
                UI.showSessionSummary(summary);
            } else {
                UI.showToast('Pomodoro module not loaded', 'error');
            }
        });

        // Header buttons
        document.getElementById('stats-btn')?.addEventListener('click', () => {
            UI.showView('stats');
            UI.renderAdvancedStats('advanced-stats-container');
        });

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            UI.showView('settings');
        });

        // Install prompt buttons
        document.getElementById('install-btn')?.addEventListener('click', handleInstall);
        document.getElementById('install-dismiss')?.addEventListener('click', () => {
            UI.hideInstallPrompt();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // Visibility change (pause when hidden)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Before unload warning
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    /**
     * Handle timer state change
     */
    function handleTimerStateChange(state) {
        UI.updateTimer(state);

        // Handle Wake Lock
        if (state.isRunning && !state.isPaused) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }
    }

    /**
     * Handle timer tick
     */
    function handleTimerTick(data) {
        UI.updateTimer({
            ...Timer.getState(),
            ...data
        });

        // One minute warning
        if (data.remaining === 60) {
            const task = Timer.getCurrentTask();
            if (task) {
                Notifications.showTimerNotification(60, task);
            }
        }
    }

    /**
     * Handle timer completion
     */
    function handleTimerComplete(task) {
        // Visual feedback
        UI.flashScreen('#10B981', 800);

        // Audio feedback
        Audio.playComplete();

        // Notification
        if (task) {
            Notifications.showTaskComplete(task);
        }

        // Update UI
        UI.updateSessionInfo(Timer.getState());
        UI.updateStats();

        // Record session metrics for ML (if DataCollection module is available)
        if (typeof DataCollection !== 'undefined' && task) {
            const timerState = Timer.getState();
            DataCollection.recordSessionMetrics({
                taskId: task.id,
                sessionId: timerState.sessionId || Date.now(),
                plannedDuration: task.duration * 60, // seconds
                actualDuration: timerState.elapsed || task.duration * 60,
                pauseCount: timerState.pauseCount || 0,
                interruptionCount: timerState.interruptionCount || 0,
                longestFocusStreak: timerState.longestStreak || 0,
                completedAt: Date.now()
            });
        }

        // Check for goal completion
        if (task) {
            // Fetch fresh task to get updated session count
            const updatedTask = Tasks.getById(task.id);
            if (updatedTask && updatedTask.targetSessions > 0 && updatedTask.completedPomodoros >= updatedTask.targetSessions) {
                UI.showToast(`🎯 Goal reached! ${updatedTask.completedPomodoros}/${updatedTask.targetSessions} sessions.`, 'success');
                // Show completion survey if available
                if (typeof DataCollection !== 'undefined') {
                    setTimeout(() => DataCollection.showCompletionSurvey(updatedTask), 1000);
                }
            } else {
                UI.showToast(`"${task.name}" session completed! 🎉`, 'success');
            }
        } else {
            UI.showToast('Session completed! 🎉', 'success');
        }
    }

    /**
     * Handle task change
     */
    function handleTaskChange(task) {
        const queue = Tasks.getQueue();
        UI.renderTaskQueue(queue, task?.id);
    }

    /**
     * Handle timer state change
     */
    function handleTimerStateChange(state) {
        UI.updateTimer(state);
        UI.updateSessionInfo(state);
    }

    /**
     * Handle task form submission
     */
    async function handleTaskFormSubmit(e) {
        e.preventDefault();

        const taskId = document.getElementById('task-id').value;
        const taskData = {
            name: document.getElementById('task-name').value.trim(),
            duration: parseInt(document.getElementById('task-duration').value) || 25,
            priority: parseInt(document.getElementById('task-priority').value) || 4,
            folderId: document.getElementById('task-folder').value || 'inbox',
            color: document.getElementById('task-color').value || '#3B82F6',
            targetSessions: parseInt(document.getElementById('task-target-sessions').value) || 0
        };

        // ML Data Collection metrics
        const mlMetrics = {
            importance: document.getElementById('task-importance')?.value || 50,
            cognitive: document.getElementById('task-cognitive')?.value || 50,
            deadline: document.getElementById('task-deadline')?.value || '',
            optionality: document.getElementById('task-optionality')?.value || 0,
            duration: taskData.duration
        };

        if (!taskData.name) {
            UI.showToast('Please enter a task name', 'error');
            return;
        }

        try {
            if (taskId) {
                // Update existing task
                await Tasks.update(parseInt(taskId), taskData);
                UI.showToast('Task updated', 'success');
            } else {
                // Create new task
                const newTask = await Tasks.create(taskData);
                UI.showToast('Task created', 'success');

                // Save ML metrics for new task (if DataCollection module is available)
                if (typeof DataCollection !== 'undefined' && newTask && newTask.id) {
                    DataCollection.saveTaskMetrics(newTask.id, mlMetrics);
                }
            }

            UI.closeModal('modal-task');
            UI.resetTaskForm();

        } catch (error) {
            console.error('Failed to save task:', error);
            UI.showToast('Failed to save task', 'error');
        }
    }

    /**
     * Handle brain dump submission
     */
    async function handleBraindumpSubmit(e) {
        e.preventDefault();

        const text = document.getElementById('braindump-text').value.trim();
        if (!text) {
            UI.showToast('Please enter something', 'error');
            return;
        }

        try {
            await Tasks.quickCapture(text);
            UI.showToast('Saved to Inbox', 'success');
            UI.closeModal('modal-braindump');
            document.getElementById('braindump-text').value = '';
        } catch (error) {
            console.error('Failed to save:', error);
            UI.showToast('Failed to save', 'error');
        }
    }

    /**
     * Handle task queue click (event delegation)
     */
    async function handleTaskQueueClick(e) {
        const actionBtn = e.target.closest('[data-action]');
        const taskCard = e.target.closest('.task-card');

        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const taskId = parseInt(actionBtn.dataset.taskId);

            if (action === 'edit') {
                const task = Tasks.getById(taskId);
                if (task) {
                    UI.populateTaskForm(task);
                    UI.openModal('modal-task');
                }
            } else if (action === 'delete') {
                UI.confirm('Delete this task?', async () => {
                    await Tasks.remove(taskId);
                    Timer.removeFromQueue(taskId);
                    UI.showToast('Task deleted', 'info');
                });
            } else if (action === 'snooze') {
                await Tasks.snooze(taskId, 60); // Default 1 hour
                const queue = Tasks.getQueue();
                Timer.setQueue(queue);
                UI.renderTaskQueue(queue, Timer.getState().currentTaskId);
                UI.showToast('Task snoozed for 1 hour', 'info');
            }
        } else if (taskCard) {
            // Select task
            const taskId = parseInt(taskCard.dataset.taskId);
            const task = Tasks.getById(taskId);
            if (task) {
                // Find task index in queue
                const queue = Tasks.getQueue();
                const index = queue.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    const state = Timer.getState();
                    if (!state.isRunning) {
                        // Can change task when not running
                        Timer.getState().currentTaskIndex = index;
                        Timer.init(queue, {
                            onTick: handleTimerTick,
                            onComplete: handleTimerComplete,
                            onTaskChange: handleTaskChange,
                            onStateChange: handleTimerStateChange
                        });
                        Timer.getState().currentTaskIndex = index;
                        handleTaskChange(queue[index]);
                    }
                }
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Don't handle if typing in input
        if (e.target.matches('input, textarea, select')) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                Timer.togglePlayPause();
                break;
            case 'Escape':
                UI.closeAllModals();
                break;
            case 'KeyN':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    UI.resetTaskForm();
                    UI.openModal('modal-task');
                }
                break;
            case 'ArrowRight':
                if (e.altKey) {
                    Timer.skipNext();
                }
                break;
            case 'ArrowLeft':
                if (e.altKey) {
                    Timer.skipPrev();
                }
                break;
        }
    }

    /**
     * Handle shortcut actions from KeyboardShortcuts module
     */
    function handleShortcutAction(action) {
        switch (action) {
            case 'playPause':
                Timer.togglePlayPause();
                break;
            case 'closeModal':
                UI.closeAllModals();
                break;
            case 'newTask':
                UI.resetTaskForm();
                UI.openModal('modal-task');
                break;
            case 'brainDump':
                UI.openModal('modal-braindump');
                break;
            case 'toggleSound':
                const currentVol = settings.volume;
                if (currentVol > 0) {
                    settings.volume = 0;
                    UI.showToast('Sound muted', 'info');
                } else {
                    settings.volume = 80;
                    UI.showToast('Sound unmuted', 'info');
                }
                Audio.updateSettings(settings);
                break;
            case 'showHelp':
                if (typeof KeyboardShortcuts !== 'undefined') {
                    KeyboardShortcuts.showHelp();
                }
                break;
            case 'viewHome':
                UI.showView('home');
                break;
            case 'viewTasks':
                UI.showView('tasks');
                break;
            case 'viewMatrix':
                UI.showView('matrix');
                break;
            case 'viewFolders':
                UI.showView('folders');
                break;
            case 'viewStats':
                UI.showView('stats');
                UI.renderAdvancedStats('advanced-stats-container');
                break;
            case 'viewSettings':
                UI.showView('settings');
                break;
            case 'skipNext':
                Timer.skipNext();
                break;
            case 'skipPrev':
                Timer.skipPrev();
                break;
            case 'resetTimer':
                Timer.stop();
                UI.showToast('Timer reset', 'info');
                break;
        }
    }

    /**
     * Handle visibility change
     */
    async function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Re-acquire lock if timer is running and setting is enabled
            if (settings.keepScreenOn && Timer.getState().isRunning && !Timer.getState().isPaused) {
                requestWakeLock();
            }
        }
    }

    /**
     * Request Screen Wake Lock
     */
    async function requestWakeLock() {
        if (!settings.keepScreenOn) return;
        if (!('wakeLock' in navigator)) return;

        try {
            if (!screenWakeLock) {
                screenWakeLock = await navigator.wakeLock.request('screen');
                screenWakeLock.addEventListener('release', () => {
                    screenWakeLock = null;
                    console.log('Wake Lock released');
                });
                console.log('Wake Lock active');
            }
        } catch (err) {
            console.error('Wake Lock failed:', err);
        }
    }

    /**
     * Release Screen Wake Lock
     */
    async function releaseWakeLock() {
        if (screenWakeLock) {
            await screenWakeLock.release();
            screenWakeLock = null;
        }
    }

    /**
     * Handle before unload
     */
    function handleBeforeUnload(e) {
        const state = Timer.getState();
        if (state.isRunning) {
            e.preventDefault();
            e.returnValue = 'Timer is running. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Setup PWA install prompt
     */
    function setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;

            // Show install prompt after a delay
            setTimeout(() => {
                UI.showInstallPrompt();
            }, 5000);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            deferredInstallPrompt = null;
            UI.hideInstallPrompt();
            UI.showToast('App installed! 🎉', 'success');
        });
    }

    /**
     * Handle PWA install
     */
    async function handleInstall() {
        if (!deferredInstallPrompt) return;

        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
        }

        deferredInstallPrompt = null;
        UI.hideInstallPrompt();
    }

    /**
     * Get app settings
     */
    function getSettings() {
        return settings;
    }

    return {
        init,
        getSettings
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
