/**
 * Focus Timer Pro - Data Collection Module
 * Handles ML data collection: task metrics, surveys, daily state prompts
 */

const DataCollection = (() => {
    let currentSurveyTask = null;

    /**
     * Initialize data collection
     */
    async function init() {
        setupEventListeners();
        await checkDailyPrompts();
        console.log('DataCollection module initialized');
    }

    /**
     * Setup event listeners for surveys and prompts
     */
    function setupEventListeners() {
        // Star rating buttons
        document.querySelectorAll('.star-rating').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const value = parseInt(e.target.dataset.value);
                    selectStarRating(container, value);
                }
            });
        });

        // Emoji rating buttons
        document.querySelectorAll('.emoji-rating').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });

        // Difficulty scale buttons
        document.querySelectorAll('.difficulty-scale').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });

        // Survey modal buttons
        document.getElementById('btn-submit-survey')?.addEventListener('click', submitSurvey);
        document.getElementById('btn-skip-survey')?.addEventListener('click', skipSurvey);

        // Morning prompt
        document.getElementById('btn-save-morning')?.addEventListener('click', saveMorningEnergy);

        // Evening prompt
        document.getElementById('btn-save-evening')?.addEventListener('click', saveEveningState);

        // Modal close buttons
        document.querySelectorAll('#modal-completion-survey .modal-close, #modal-morning-prompt .modal-close, #modal-evening-prompt .modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });
    }

    /**
     * Select stars in rating widget
     */
    function selectStarRating(container, value) {
        const buttons = container.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i < value);
        });
        container.dataset.value = value;
    }

    /**
     * Check if we should show daily prompts
     */
    async function checkDailyPrompts() {
        try {
            // Check morning prompt
            const shouldShowMorning = await Storage.DailyState.shouldShowMorningPrompt();
            if (shouldShowMorning) {
                showMorningPrompt();
                return; // Show only one prompt at a time
            }

            // Check evening prompt
            const shouldShowEvening = await Storage.DailyState.shouldShowEveningPrompt();
            if (shouldShowEvening) {
                showEveningPrompt();
            }
        } catch (err) {
            console.error('Error checking daily prompts:', err);
        }
    }

    /**
     * Show morning energy prompt
     */
    function showMorningPrompt() {
        const modal = document.getElementById('modal-morning-prompt');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Show evening check-in prompt
     */
    async function showEveningPrompt() {
        const modal = document.getElementById('modal-evening-prompt');
        if (!modal) return;

        // Load today's stats
        try {
            const todayStats = await Storage.DailyStats.getOrCreate();
            const statsEl = document.getElementById('evening-stats');
            if (statsEl) {
                const hours = Math.floor((todayStats.totalFocusSeconds || 0) / 3600);
                const mins = Math.floor(((todayStats.totalFocusSeconds || 0) % 3600) / 60);
                statsEl.innerHTML = `
                    <div class="stat-value">${hours}h ${mins}m</div>
                    <div class="stat-label">focused today</div>
                    <div class="stat-value mt-2">${todayStats.completedTasks || 0}</div>
                    <div class="stat-label">tasks completed</div>
                `;
            }
        } catch (err) {
            console.error('Error loading today stats:', err);
        }

        modal.classList.add('active');
    }

    /**
     * Save morning energy data
     */
    async function saveMorningEnergy() {
        const energy = parseInt(document.getElementById('morning-energy')?.value || 3);
        const sleepHours = parseFloat(document.getElementById('morning-sleep')?.value) || null;

        try {
            await Storage.DailyState.saveMorning(energy, sleepHours);
            document.getElementById('modal-morning-prompt')?.classList.remove('active');
            showToast('Good luck today! 💪');
        } catch (err) {
            console.error('Error saving morning energy:', err);
        }
    }

    /**
     * Save evening state data
     */
    async function saveEveningState() {
        const energy = parseInt(document.getElementById('evening-energy')?.value || 3);
        const fatigue = parseInt(document.getElementById('evening-fatigue')?.value || 50) / 100;
        const restQuality = parseInt(document.getElementById('evening-rest-quality')?.dataset.value || 3);

        try {
            await Storage.DailyState.saveEvening(energy, fatigue, restQuality);
            document.getElementById('modal-evening-prompt')?.classList.remove('active');
            showToast('Great work today! 🌙');
        } catch (err) {
            console.error('Error saving evening state:', err);
        }
    }

    /**
     * Show post-completion survey for a task
     */
    function showCompletionSurvey(task) {
        currentSurveyTask = task;
        const modal = document.getElementById('modal-completion-survey');
        if (!modal) return;

        // Set task name
        const taskNameEl = document.getElementById('survey-task-name');
        if (taskNameEl) {
            taskNameEl.textContent = task.name || 'Task completed';
        }

        // Reset selections
        modal.querySelectorAll('.star-rating, .emoji-rating, .difficulty-scale').forEach(container => {
            container.querySelectorAll('button').forEach((btn, i) => {
                btn.classList.remove('active');
                // Set defaults
                if (container.id === 'survey-roi' && i < 3) btn.classList.add('active');
                if (container.id === 'survey-satisfaction' && i === 3) btn.classList.add('active');
                if (container.id === 'survey-difficulty' && i === 2) btn.classList.add('active');
            });
        });

        // Clear notes
        const notesEl = document.getElementById('survey-notes');
        if (notesEl) notesEl.value = '';

        modal.classList.add('active');
    }

    /**
     * Submit survey data
     */
    async function submitSurvey() {
        if (!currentSurveyTask) return;

        const roi = parseInt(document.getElementById('survey-roi')?.dataset.value || 3);
        const difficulty = parseInt(document.querySelector('#survey-difficulty button.active')?.dataset.value || 3);
        const satisfaction = parseInt(document.querySelector('#survey-satisfaction button.active')?.dataset.value || 4);
        const notes = document.getElementById('survey-notes')?.value || '';

        try {
            await Storage.TaskMetrics.saveCompletion(currentSurveyTask.id, {
                realizedROI: roi,
                actualCognitive: difficulty,
                satisfaction: satisfaction,
                completionNotes: notes
            });

            document.getElementById('modal-completion-survey')?.classList.remove('active');
            currentSurveyTask = null;
            showToast('Feedback saved! 📊');
        } catch (err) {
            console.error('Error saving survey:', err);
        }
    }

    /**
     * Skip survey
     */
    function skipSurvey() {
        document.getElementById('modal-completion-survey')?.classList.remove('active');
        currentSurveyTask = null;
    }

    /**
     * Save task metrics when creating/editing a task
     */
    async function saveTaskMetrics(taskId, formData) {
        const importance = (parseInt(formData.importance) || 50) / 100;
        const cognitive = (parseInt(formData.cognitive) || 50) / 100;
        const deadline = formData.deadline ? new Date(formData.deadline).getTime() : null;
        const optionality = parseInt(formData.optionality) || 0;

        // Calculate urgency from deadline
        let urgency = 0.5;
        if (deadline) {
            const daysUntilDeadline = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilDeadline <= 1) urgency = 1.0;
            else if (daysUntilDeadline <= 3) urgency = 0.8;
            else if (daysUntilDeadline <= 7) urgency = 0.6;
            else urgency = 0.3;
        }

        const now = new Date();
        try {
            await Storage.TaskMetrics.add({
                taskId: taskId,
                importance: importance,
                urgency: urgency,
                optionality: optionality / 10, // Normalize to 0-1
                estimatedTime: parseInt(formData.duration) || 25,
                estimatedCognitive: cognitive,
                createdAtHour: now.getHours(),
                createdAtDayOfWeek: now.getDay() + 1,
                deadline: deadline
            });
        } catch (err) {
            console.error('Error saving task metrics:', err);
        }
    }

    /**
     * Record session metrics when a session completes
     */
    async function recordSessionMetrics(sessionData) {
        try {
            await Storage.SessionMetrics.recordSession(sessionData);
        } catch (err) {
            console.error('Error recording session metrics:', err);
        }
    }

    /**
     * Export ML training data as CSV download
     */
    async function exportTrainingData() {
        try {
            const csv = await Storage.exportMLTrainingData();
            if (!csv) {
                showToast('No data to export');
                return;
            }

            // Create download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focus-timer-training-data-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            showToast('Training data exported! 📁');
        } catch (err) {
            console.error('Error exporting training data:', err);
            showToast('Export failed');
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message) {
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(message);
        } else {
            console.log('Toast:', message);
        }
    }

    return {
        init,
        showCompletionSurvey,
        saveTaskMetrics,
        recordSessionMetrics,
        exportTrainingData,
        checkDailyPrompts
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCollection;
}
