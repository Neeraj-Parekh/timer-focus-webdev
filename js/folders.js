/**
 * Focus Timer Pro - Folders Module
 * Folder management and organization view
 */

const Folders = (() => {
    /**
     * Render the folders view
     */
    function render() {
        const container = document.getElementById('view-folders');
        if (!container) return;

        const folders = Tasks.getFolders();
        const allTasks = Tasks.getAll();

        container.innerHTML = `
            <div class="folders-header">
                <h2>Folders</h2>
                <button class="btn-add" id="btn-add-folder">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Folder
                </button>
            </div>
            <div class="folders-grid">
                ${folders.map(folder => renderFolderCard(folder, allTasks)).join('')}
            </div>
            <div class="folders-stats">
                <h3>Overview</h3>
                <div class="folder-stats-grid">
                    ${renderFolderStats(folders, allTasks)}
                </div>
            </div>
        `;

        setupEventListeners(container);
    }

    /**
     * Render a single folder card
     */
    function renderFolderCard(folder, allTasks) {
        const folderTasks = allTasks.filter(t =>
            t.folderId === folder.id ||
            t.folderId === folder.name.toLowerCase()
        );
        const activeTasks = folderTasks.filter(t => !t.isCompleted && !t.isArchived);
        const completedTasks = folderTasks.filter(t => t.isCompleted);
        const totalDuration = activeTasks.reduce((sum, t) => sum + t.duration, 0);

        return `
            <div class="folder-card" data-folder-id="${folder.id}" style="--folder-color: ${folder.color}">
                <div class="folder-icon">
                    <span class="material-symbols-rounded">${folder.icon}</span>
                </div>
                <div class="folder-info">
                    <h3 class="folder-name">${escapeHtml(folder.name)}</h3>
                    <div class="folder-meta">
                        <span>${activeTasks.length} active</span>
                        <span>•</span>
                        <span>${completedTasks.length} done</span>
                    </div>
                </div>
                <div class="folder-duration">
                    <span class="duration-value">${formatDuration(totalDuration * 60)}</span>
                    <span class="duration-label">remaining</span>
                </div>
                <div class="folder-progress">
                    <div class="folder-progress-bar" style="width: ${folderTasks.length > 0
                ? (completedTasks.length / folderTasks.length) * 100
                : 0
            }%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render folder statistics
     */
    function renderFolderStats(folders, allTasks) {
        const totalActive = allTasks.filter(t => !t.isCompleted && !t.isArchived).length;
        const totalCompleted = allTasks.filter(t => t.isCompleted).length;
        const totalDuration = allTasks
            .filter(t => !t.isCompleted && !t.isArchived)
            .reduce((sum, t) => sum + t.duration, 0);

        return `
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-rounded">assignment</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${totalActive}</span>
                    <span class="stat-label">Active Tasks</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-rounded">check_circle</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${totalCompleted}</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-rounded">timer</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${formatDuration(totalDuration * 60)}</span>
                    <span class="stat-label">Total Time</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-rounded">folder</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${folders.length}</span>
                    <span class="stat-label">Folders</span>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners(container) {
        // Folder card click
        container.querySelectorAll('.folder-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const folderId = e.currentTarget.dataset.folderId;
                showFolderTasks(folderId);
            });
        });

        // Add folder button
        container.querySelector('#btn-add-folder')?.addEventListener('click', () => {
            openAddFolderModal();
        });
    }

    /**
     * Show tasks filtered by folder
     */
    function showFolderTasks(folderId) {
        const folder = Tasks.getFolders().find(f => f.id == folderId);
        if (!folder) return;

        const tasks = Tasks.getAll().filter(t =>
            t.folderId === folder.id ||
            t.folderId === folder.name.toLowerCase()
        );

        // Render in a modal or switch to tasks view with filter
        const container = document.getElementById('view-tasks');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <button class="btn-back" onclick="Folders.render()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div>
                    <h2>
                        <span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px;">${folder.icon}</span>
                        ${folder.name}
                    </h2>
                    <p class="view-subtitle">${tasks.length} tasks</p>
                </div>
            </div>
            <div class="task-list">
                ${tasks.length > 0
                ? tasks.map(task => UI.renderTaskCard(task)).join('')
                : '<div class="empty-state"><p>No tasks in this folder</p></div>'
            }
            </div>
        `;

        UI.showView('tasks');
    }

    /**
     * Open add folder modal
     */
    function openAddFolderModal() {
        const modal = document.getElementById('modal-task');
        if (!modal) return;

        // Create a simple prompt for now
        const name = prompt('Enter folder name:');
        if (!name) return;

        const icons = ['folder', 'school', 'work', 'home', 'star', 'favorite', 'palette', 'science', 'edit', 'flag'];
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

        Tasks.createFolder({
            name: name,
            icon: icons[Math.floor(Math.random() * icons.length)],
            color: colors[Math.floor(Math.random() * colors.length)]
        }).then(() => {
            render();
            UI.showToast('Folder created', 'success');
        });
    }

    /**
     * Format duration helper
     */
    function formatDuration(seconds) {
        if (seconds < 60) return '< 1m';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
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
     * Inject CSS for folders
     */
    function injectStyles() {
        if (document.getElementById('folders-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'folders-styles-css';
        styles.textContent = `
            .folders-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: var(--space-4);
            }
            
            .folders-grid {
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
            }
            
            .folder-card {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-4);
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
                position: relative;
                overflow: hidden;
            }
            
            .folder-card:hover {
                transform: translateX(4px);
                background: var(--bg-tertiary);
            }
            
            .folder-icon {
                font-size: var(--text-2xl);
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: color-mix(in srgb, var(--folder-color) 20%, transparent);
                border-radius: var(--radius-lg);
            }
            
            .folder-info {
                flex: 1;
            }
            
            .folder-name {
                font-size: var(--text-base);
                font-weight: var(--font-semibold);
                margin: 0;
            }
            
            .folder-meta {
                display: flex;
                gap: var(--space-2);
                font-size: var(--text-xs);
                color: var(--text-muted);
                margin-top: var(--space-1);
            }
            
            .folder-duration {
                text-align: right;
            }
            
            .duration-value {
                display: block;
                font-size: var(--text-sm);
                font-weight: var(--font-semibold);
                color: var(--folder-color);
            }
            
            .duration-label {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .folder-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--bg-tertiary);
            }
            
            .folder-progress-bar {
                height: 100%;
                background: var(--folder-color);
                transition: width var(--transition-slow);
            }
            
            .folders-stats {
                margin-top: var(--space-6);
            }
            
            .folders-stats h3 {
                font-size: var(--text-sm);
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: var(--space-3);
            }
            
            .folder-stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-3);
            }
            
            .stat-card {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-3);
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
            }
            
            .stat-icon {
                font-size: var(--text-xl);
            }
            
            .stat-content {
                display: flex;
                flex-direction: column;
            }
            
            .stat-content .stat-value {
                font-size: var(--text-lg);
                font-weight: var(--font-semibold);
            }
            
            .stat-content .stat-label {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .view-subtitle {
                font-size: var(--text-sm);
                color: var(--text-muted);
                margin-top: var(--space-1);
            }
            
            .btn-back {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--radius-lg);
                margin-right: var(--space-3);
                color: var(--text-secondary);
            }
            
            .btn-back:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
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
        render,
        showFolderTasks,
        openAddFolderModal
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Folders;
}
