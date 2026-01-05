/**
 * Focus Timer Pro - Eisenhower Matrix Module
 * 4-quadrant priority matrix view
 */

const EisenhowerMatrix = (() => {
    const QUADRANTS = {
        1: { name: 'Do First', description: 'Urgent & Important', color: '#DC2626', icon: '🔴' },
        2: { name: 'Schedule', description: 'Important, Not Urgent', color: '#F59E0B', icon: '🟠' },
        3: { name: 'Delegate', description: 'Urgent, Not Important', color: '#3B82F6', icon: '🔵' },
        4: { name: 'Eliminate', description: 'Not Urgent, Not Important', color: '#6B7280', icon: '⚪' }
    };

    /**
     * Render the Eisenhower Matrix view
     */
    function render(tasks) {
        const container = document.getElementById('view-matrix');
        if (!container) return;

        // Group tasks by priority/quadrant
        const quadrantTasks = {
            1: tasks.filter(t => t.priority === 1),
            2: tasks.filter(t => t.priority === 2),
            3: tasks.filter(t => t.priority === 3),
            4: tasks.filter(t => t.priority === 4)
        };

        container.innerHTML = `
            <div class="matrix-header">
                <h2>Eisenhower Matrix</h2>
                <p class="matrix-subtitle">Prioritize by urgency and importance</p>
            </div>
            <div class="matrix-grid">
                ${Object.entries(QUADRANTS).map(([q, info]) => `
                    <div class="matrix-quadrant q${q}" data-quadrant="${q}">
                        <div class="quadrant-header" style="--quadrant-color: ${info.color}">
                            <span class="quadrant-icon">${info.icon}</span>
                            <div class="quadrant-title">
                                <h3>${info.name}</h3>
                                <span class="quadrant-desc">${info.description}</span>
                            </div>
                            <span class="quadrant-count">${quadrantTasks[q].length}</span>
                        </div>
                        <div class="quadrant-tasks" data-quadrant="${q}">
                            ${quadrantTasks[q].length > 0
                ? quadrantTasks[q].map(task => renderMatrixTask(task)).join('')
                : '<div class="quadrant-empty">No tasks</div>'
            }
                        </div>
                        <button class="quadrant-add" data-quadrant="${q}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Task
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="matrix-legend">
                <div class="legend-row">
                    <span></span>
                    <span class="legend-header">Urgent</span>
                    <span class="legend-header">Not Urgent</span>
                </div>
                <div class="legend-row">
                    <span class="legend-header">Important</span>
                    <span class="legend-cell q1">Q1</span>
                    <span class="legend-cell q2">Q2</span>
                </div>
                <div class="legend-row">
                    <span class="legend-header">Not Important</span>
                    <span class="legend-cell q3">Q3</span>
                    <span class="legend-cell q4">Q4</span>
                </div>
            </div>
        `;

        // Add event listeners
        setupEventListeners(container);
    }

    /**
     * Render a single task in the matrix
     */
    function renderMatrixTask(task) {
        return `
            <div class="matrix-task" data-task-id="${task.id}" draggable="true">
                <div class="matrix-task-color" style="background: ${task.color}"></div>
                <div class="matrix-task-content">
                    <span class="matrix-task-name">${escapeHtml(task.name)}</span>
                    <span class="matrix-task-duration">${task.duration}m</span>
                </div>
                <button class="matrix-task-play" data-task-id="${task.id}" title="Start Timer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Setup event listeners for the matrix
     */
    function setupEventListeners(container) {
        // Add task buttons
        container.querySelectorAll('.quadrant-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quadrant = parseInt(e.currentTarget.dataset.quadrant);
                openAddTaskModal(quadrant);
            });
        });

        // Play buttons
        container.querySelectorAll('.matrix-task-play').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                startTaskTimer(taskId);
            });
        });

        // Task click for edit
        container.querySelectorAll('.matrix-task').forEach(task => {
            task.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                const taskData = Tasks.getById(taskId);
                if (taskData) {
                    UI.populateTaskForm(taskData);
                    UI.openModal('modal-task');
                }
            });
        });

        // Drag and drop
        setupDragAndDrop(container);
    }

    /**
     * Setup drag and drop functionality
     */
    function setupDragAndDrop(container) {
        const tasks = container.querySelectorAll('.matrix-task');
        const dropZones = container.querySelectorAll('.quadrant-tasks');

        tasks.forEach(task => {
            task.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', task.dataset.taskId);
                task.classList.add('dragging');
            });

            task.addEventListener('dragend', () => {
                task.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', async (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newPriority = parseInt(zone.dataset.quadrant);

                await Tasks.update(taskId, { priority: newPriority });
                render(Tasks.getActive());
                UI.showToast('Task priority updated', 'success');
            });
        });
    }

    /**
     * Open add task modal with pre-selected priority
     */
    function openAddTaskModal(quadrant) {
        UI.resetTaskForm();
        document.getElementById('task-priority').value = quadrant;
        UI.openModal('modal-task');
    }

    /**
     * Start timer for a specific task
     */
    function startTaskTimer(taskId) {
        const task = Tasks.getById(taskId);
        if (!task) return;

        // Move task to front of queue
        const queue = Tasks.getQueue();
        const taskIndex = queue.findIndex(t => t.id === taskId);

        if (taskIndex > 0) {
            // Reorder to put this task first
            queue.splice(taskIndex, 1);
            queue.unshift(task);
            Timer.setQueue(queue);
        }

        // Switch to home view and start
        UI.showView('home');
        Timer.start();
    }

    /**
     * Escape HTML helper
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inject CSS for matrix
     */
    function injectStyles() {
        if (document.getElementById('matrix-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'matrix-styles-css';
        styles.textContent = `
            .matrix-header {
                margin-bottom: var(--space-4);
            }
            
            .matrix-subtitle {
                color: var(--text-muted);
                font-size: var(--text-sm);
            }
            
            .matrix-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-3);
            }
            
            .matrix-quadrant {
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                overflow: hidden;
                min-height: 200px;
                display: flex;
                flex-direction: column;
            }
            
            .quadrant-header {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-3);
                background: color-mix(in srgb, var(--quadrant-color) 15%, transparent);
                border-bottom: 2px solid var(--quadrant-color);
            }
            
            .quadrant-icon {
                font-size: var(--text-lg);
            }
            
            .quadrant-title {
                flex: 1;
            }
            
            .quadrant-title h3 {
                font-size: var(--text-sm);
                font-weight: var(--font-semibold);
                margin: 0;
            }
            
            .quadrant-desc {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .quadrant-count {
                background: var(--bg-tertiary);
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-full);
                font-size: var(--text-xs);
                font-weight: var(--font-semibold);
            }
            
            .quadrant-tasks {
                flex: 1;
                padding: var(--space-2);
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
                min-height: 100px;
            }
            
            .quadrant-tasks.drag-over {
                background: rgba(59, 130, 246, 0.1);
            }
            
            .quadrant-empty {
                color: var(--text-muted);
                font-size: var(--text-sm);
                text-align: center;
                padding: var(--space-4);
            }
            
            .matrix-task {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2);
                background: var(--bg-tertiary);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .matrix-task:hover {
                background: var(--border-color);
            }
            
            .matrix-task.dragging {
                opacity: 0.5;
            }
            
            .matrix-task-color {
                width: 4px;
                height: 24px;
                border-radius: var(--radius-sm);
            }
            
            .matrix-task-content {
                flex: 1;
                min-width: 0;
            }
            
            .matrix-task-name {
                display: block;
                font-size: var(--text-sm);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .matrix-task-duration {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .matrix-task-play {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--radius-full);
                color: var(--accent-primary);
                opacity: 0;
                transition: opacity var(--transition-fast);
            }
            
            .matrix-task:hover .matrix-task-play {
                opacity: 1;
            }
            
            .matrix-task-play:hover {
                background: rgba(59, 130, 246, 0.2);
            }
            
            .quadrant-add {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-2);
                padding: var(--space-2);
                margin: var(--space-2);
                border-radius: var(--radius-md);
                color: var(--text-muted);
                font-size: var(--text-xs);
                transition: all var(--transition-fast);
            }
            
            .quadrant-add:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }
            
            .matrix-legend {
                margin-top: var(--space-4);
                display: grid;
                grid-template-columns: auto 1fr 1fr;
                gap: var(--space-1);
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .legend-header {
                font-weight: var(--font-semibold);
                padding: var(--space-1);
            }
            
            .legend-cell {
                padding: var(--space-1);
                text-align: center;
                border-radius: var(--radius-sm);
            }
            
            .legend-cell.q1 { background: rgba(220, 38, 38, 0.2); }
            .legend-cell.q2 { background: rgba(245, 158, 11, 0.2); }
            .legend-cell.q3 { background: rgba(59, 130, 246, 0.2); }
            .legend-cell.q4 { background: rgba(107, 114, 128, 0.2); }
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
        render,
        QUADRANTS
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EisenhowerMatrix;
}
