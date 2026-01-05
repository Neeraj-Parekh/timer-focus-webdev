/**
 * Focus Timer Pro - UI Module
 * DOM manipulation and component rendering
 */

const UI = (() => {
    // DOM element cache
    const elements = {};

    /**
     * Initialize UI references
     */
    function init() {
        // Cache commonly used elements
        elements.app = document.getElementById('app');
        elements.mainContent = document.getElementById('main-content');

        // Timer elements
        elements.timerTime = document.getElementById('timer-time');
        elements.timerTask = document.getElementById('timer-task');
        elements.timerProgress = document.getElementById('timer-progress');
        elements.iconPlay = document.getElementById('icon-play');
        elements.iconPause = document.getElementById('icon-pause');

        // Session info
        elements.sessionCompleted = document.getElementById('session-completed');
        elements.sessionTime = document.getElementById('session-time');
        elements.sessionRemaining = document.getElementById('session-remaining');

        // Task queue
        elements.taskQueue = document.getElementById('task-queue');

        // Stats
        elements.statTodayTime = document.getElementById('stat-today-time');
        elements.statTodayTasks = document.getElementById('stat-today-tasks');
        elements.statStreak = document.getElementById('stat-streak');
        elements.chartWeekly = document.getElementById('chart-weekly');

        // Modals
        elements.modalTask = document.getElementById('modal-task');
        elements.modalBraindump = document.getElementById('modal-braindump');
        elements.formTask = document.getElementById('form-task');
        elements.formBraindump = document.getElementById('form-braindump');

        // Toast
        elements.toastContainer = document.getElementById('toast-container');

        // Install prompt
        elements.installPrompt = document.getElementById('install-prompt');

        return elements;
    }

    /**
     * Update timer display
     */
    function updateTimer(state) {
        if (typeof TimerStyles !== 'undefined') {
            TimerStyles.render(state);
            // Still update text content if supported by style, but TimerStyles usually handles it
            // For safety, we keep basic updates if not handled by TimerStyles completely or for fallback
        }

        // Basic updates that might be needed regardless of style
        if (elements.timerTime) {
            elements.timerTime.textContent = state.formattedTime;
        }

        if (elements.timerTask && state.currentTask) {
            elements.timerTask.textContent = state.currentTask.name;
        }

        // Default circular progress if TimerStyles is not managing it (or strict fallback)
        if (typeof TimerStyles === 'undefined' && elements.timerProgress) {
            const circumference = 2 * Math.PI * 90; // radius = 90
            const offset = circumference * (1 - state.progress);
            elements.timerProgress.style.strokeDashoffset = offset;
        }

        // Update play/pause icon
        if (elements.iconPlay && elements.iconPause) {
            if (state.isRunning && !state.isPaused) {
                elements.iconPlay.style.display = 'none';
                elements.iconPause.style.display = 'block';
            } else {
                elements.iconPlay.style.display = 'block';
                elements.iconPause.style.display = 'none';
            }
        }

        // Add/remove active class for glow effect
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.classList.toggle('timer-active', state.isRunning && !state.isPaused);
        }
    }

    /**
     * Update session info
     */
    function updateSessionInfo(state) {
        if (elements.sessionCompleted) {
            elements.sessionCompleted.textContent = state.completedInSession || 0;
        }

        if (elements.sessionTime) {
            elements.sessionTime.textContent = state.formattedFocusTime || '0m';
        }

        if (elements.sessionRemaining) {
            const remaining = state.queue ? state.queue.length - (state.currentTaskIndex || 0) - 1 : 0;
            elements.sessionRemaining.textContent = Math.max(0, remaining);
        }
    }

    /**
     * Render task queue
     */
    function renderTaskQueue(tasks, currentTaskId = null) {
        if (!elements.taskQueue) return;

        if (!tasks || tasks.length === 0) {
            elements.taskQueue.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
            return;
        }

        elements.taskQueue.innerHTML = tasks.map(task => renderTaskCard(task, task.id === currentTaskId)).join('');
    }

    /**
     * Render single task card
     */
    function renderTaskCard(task, isActive = false) {
        const priorityInfo = Tasks.getPriorityInfo(task.priority);
        const folderInfo = Tasks.getFolderInfo(task.folderId);

        return `
            <div class="task-card ${isActive ? 'active' : ''} ${task.isCompleted ? 'completed' : ''}" 
                 data-task-id="${task.id}"
                 style="--task-color: ${task.color}">
                <div class="task-priority p${task.priority}" title="${priorityInfo.label}"></div>
                <div class="task-content">
                    <div class="task-name">${escapeHtml(task.name)}</div>
                    <div class="task-meta">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${task.duration}m
                        </span>
                        <span class="task-folder">
                            <span class="material-symbols-rounded" style="font-size: 16px; margin-right: 4px; vertical-align: text-bottom;">${folderInfo.icon}</span>
                            ${folderInfo.name}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" data-action="edit" data-task-id="${task.id}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ${!task.isCompleted ? `
                    <button class="task-action-btn snooze" data-action="snooze" data-task-id="${task.id}" title="Snooze">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="task-action-btn delete" data-action="delete" data-task-id="${task.id}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render full task list (Tasks view)
     */
    function renderTaskList(tasks, folders) {
        const container = document.getElementById('task-list');
        if (!container) return;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <p>All tasks completed! 🎉</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => renderTaskCard(task, false)).join('');
    }

    /**
     * Update statistics display
     */
    async function updateStats() {
        try {
            const today = await Statistics.getToday();
            const streak = await Statistics.getStreak();
            const weekly = await Statistics.getWeeklySummary();

            if (elements.statTodayTime) {
                elements.statTodayTime.textContent = today.focusTime;
            }
            if (elements.statTodayTasks) {
                elements.statTodayTasks.textContent = today.tasksCompleted;
            }
            if (elements.statStreak) {
                elements.statStreak.textContent = streak;
            }

            // Render chart
            if (elements.chartWeekly && weekly.chartData) {
                Statistics.renderBarChart('chart-weekly', weekly.chartData);
            }
        } catch (err) {
            console.error('Failed to update stats:', err);
        }
    }

    /**
     * Show/hide views
     */
    function showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const view = document.getElementById(`view-${viewName}`);
        if (view) {
            view.classList.add('active');
        }

        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Render view-specific content
        switch (viewName) {
            case 'stats':
                updateStats();
                // Render calendar heatmap
                if (typeof CalendarHeatmap !== 'undefined') {
                    CalendarHeatmap.render('calendar-heatmap', 12);
                }
                break;
            case 'matrix':
                if (typeof EisenhowerMatrix !== 'undefined') {
                    EisenhowerMatrix.render(Tasks.getActive());
                }
                break;
            case 'folders':
                if (typeof Folders !== 'undefined') {
                    Folders.render();
                }
                break;
            case 'tasks':
                renderTaskList(Tasks.getActive(), Tasks.getFolders());
                break;
        }
    }

    /**
     * Open modal
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Focus first input
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Close modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    /**
     * Close all modals
     */
    function closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
    }

    /**
     * Populate task form for editing
     */
    function populateTaskForm(task) {
        const form = elements.formTask;
        if (!form) return;

        document.getElementById('task-id').value = task.id || '';
        document.getElementById('task-name').value = task.name || '';
        document.getElementById('task-duration').value = task.duration || 25;
        document.getElementById('task-priority').value = task.priority || 4;
        document.getElementById('task-folder').value = task.folderId || 'inbox';
        document.getElementById('task-color').value = task.color || '#3B82F6';
        document.getElementById('task-target-sessions').value = task.targetSessions || 0;

        // Update color picker selection
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === task.color);
        });

        // Update modal title
        document.getElementById('modal-task-title').textContent = task.id ? 'Edit Task' : 'Add Task';
    }

    /**
     * Reset task form
     */
    function resetTaskForm() {
        const form = elements.formTask;
        if (form) {
            form.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('task-color').value = '#3B82F6';

            // Reset color selection
            document.querySelectorAll('.color-option').forEach((opt, i) => {
                opt.classList.toggle('active', i === 0);
            });
        }
        document.getElementById('modal-task-title').textContent = 'Add Task';
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info', duration = 3000) {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        elements.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    /**
     * Show confirm dialog
     */
    function confirm(message, onConfirm, onCancel) {
        const result = window.confirm(message);
        if (result && onConfirm) {
            onConfirm();
        } else if (!result && onCancel) {
            onCancel();
        }
        return result;
    }

    /**
     * Show install prompt
     */
    function showInstallPrompt() {
        if (elements.installPrompt) {
            elements.installPrompt.classList.remove('hidden');
        }
    }

    /**
     * Hide install prompt
     */
    function hideInstallPrompt() {
        if (elements.installPrompt) {
            elements.installPrompt.classList.add('hidden');
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Flash screen effect
     */
    function flashScreen(color = '#06B6D4', duration = 500) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            inset: 0;
            background: ${color};
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity ${duration / 4}ms ease;
        `;
        document.body.appendChild(flash);

        // Animate
        requestAnimationFrame(() => {
            flash.style.opacity = '0.5';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => flash.remove(), duration / 4);
            }, duration / 2);
        });
    }

    /**
     * Show session summary modal
     */
    function showSessionSummary(sessionData) {
        const modal = document.getElementById('modal-session-summary');
        const content = document.getElementById('session-summary-content');

        if (!modal || !content) return;

        const focusRatio = sessionData.totalWorkTime > 0
            ? Math.round((sessionData.totalWorkTime / (sessionData.totalWorkTime + sessionData.totalBreakTime)) * 100)
            : 0;

        content.innerHTML = `
            <div class="session-summary">
                <div class="summary-header">
                    <div class="summary-emoji">
                        <span class="material-symbols-rounded" style="font-size: 48px; color: var(--accent-primary);">emoji_events</span>
                    </div>
                    <h3>Great Focus Session!</h3>
                </div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-value">${sessionData.sessionsCompleted}</span>
                        <span class="stat-label">Sessions</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${formatDuration(sessionData.totalWorkTime)}</span>
                        <span class="stat-label">Focus Time</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${focusRatio}%</span>
                        <span class="stat-label">Focus Ratio</span>
                    </div>
                </div>
                <div class="summary-breakdown">
                    <div class="breakdown-item">
                        <span>🎯 Work Time</span>
                        <span>${formatDuration(sessionData.totalWorkTime)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>☕ Break Time</span>
                        <span>${formatDuration(sessionData.totalBreakTime)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>✅ Tasks Done</span>
                        <span>${sessionData.tasksCompleted || 0}</span>
                    </div>
                </div>
            </div>
        `;

        openModal('modal-session-summary');
    }

    /**
     * Format duration helper
     */
    function formatDuration(seconds) {
        if (!seconds || seconds < 60) return '< 1m';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    }

    /**
     * Render advanced statistics
     */
    async function renderAdvancedStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // Get weekly summary
            const weekly = await Statistics.getWeeklySummary();
            const hourly = await Statistics.getProductivityByHour();
            const folderStats = await Statistics.getFolderStats();

            container.innerHTML = `
                <div class="advanced-stats">
                    <div class="stats-section">
                        <h4>📊 Weekly Summary</h4>
                        <div class="stats-grid">
                            <div class="mini-stat">
                                <span class="value">${weekly.totalFocusTime}</span>
                                <span class="label">Total Focus</span>
                            </div>
                            <div class="mini-stat">
                                <span class="value">${weekly.totalTasks}</span>
                                <span class="label">Tasks Done</span>
                            </div>
                            <div class="mini-stat">
                                <span class="value">${weekly.avgDailyTime}</span>
                                <span class="label">Daily Avg</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-section">
                        <h4>⏰ Peak Hours</h4>
                        <div class="peak-hours">
                            ${hourly.peakHours.map(h => `
                                <span class="peak-badge">${formatHour(h)}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stats-section">
                        <h4>📁 By Folder</h4>
                        <div class="folder-stats">
                            ${folderStats.map(f => `
                                <div class="folder-stat-item">
                                    <span>${f.folderId}</span>
                                    <span>${f.focusTime}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Failed to render advanced stats:', err);
        }
    }

    /**
     * Format hour helper
     */
    function formatHour(hour) {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour < 12) return `${hour} AM`;
        return `${hour - 12} PM`;
    }

    return {
        init,
        elements,
        updateTimer,
        updateSessionInfo,
        renderTaskQueue,
        renderTaskCard,
        renderTaskList,
        updateStats,
        showView,
        openModal,
        closeModal,
        closeAllModals,
        populateTaskForm,
        resetTaskForm,
        showToast,
        confirm,
        showInstallPrompt,
        hideInstallPrompt,
        escapeHtml,
        flashScreen,
        showSessionSummary,
        renderAdvancedStats,
        formatDuration
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
