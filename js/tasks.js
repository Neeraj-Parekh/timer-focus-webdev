/**
 * Focus Timer Pro - Tasks Module
 * Task management and folder operations
 */

const Tasks = (() => {
    // In-memory cache
    let tasksCache = [];
    let foldersCache = [];
    let onUpdate = null;

    /**
     * Initialize tasks module
     */
    async function init(callback) {
        onUpdate = callback;

        // Initialize default folders
        await Storage.Folders.initDefaults();

        // Load data
        await refresh();

        return { tasks: tasksCache, folders: foldersCache };
    }

    /**
     * Refresh cache from storage
     */
    async function refresh() {
        tasksCache = await Storage.Tasks.getAll();
        foldersCache = await Storage.Folders.getAll();

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }
    }

    /**
     * Create a new task
     */
    async function create(taskData) {
        const task = {
            name: taskData.name || 'Untitled Task',
            duration: taskData.duration || 25,
            color: taskData.color || '#3B82F6',
            priority: taskData.priority || 4,
            folderId: taskData.folderId || 'inbox',
            description: taskData.description || '',
            order: tasksCache.length,
            isCompleted: false,
            isArchived: false,
            estimatedPomodoros: Math.ceil((taskData.duration || 25) / 25),
            completedPomodoros: 0
        };

        const id = await Storage.Tasks.add(task);
        task.id = id;

        tasksCache.push(task);

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }

        return task;
    }

    /**
     * Update an existing task
     */
    async function update(id, updates) {
        const task = tasksCache.find(t => t.id === id);
        if (!task) return null;

        Object.assign(task, updates);
        await Storage.Tasks.update(task);

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }

        return task;
    }

    /**
     * Increment completed sessions for a task
     */
    async function incrementSessions(id) {
        const task = tasksCache.find(t => t.id === id);
        if (!task) return null;

        task.completedPomodoros = (task.completedPomodoros || 0) + 1;
        await Storage.Tasks.update(task);

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }

        return task;
    }

    /**
     * Delete a task
     */
    async function remove(id) {
        await Storage.Tasks.delete(id);
        tasksCache = tasksCache.filter(t => t.id !== id);

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }

        return true;
    }

    /**
     * Mark task as complete
     */
    async function complete(id) {
        return update(id, {
            isCompleted: true,
            completedAt: Date.now()
        });
    }

    /**
     * Archive a task
     */
    async function archive(id) {
        return update(id, { isArchived: true });
    }

    /**
     * Get active tasks (not archived, not completed)
     */
    function getActive() {
        return tasksCache.filter(t => !t.isArchived && !t.isCompleted);
    }

    /**
     * Get tasks sorted for queue
     */
    function getQueue() {
        return getActive().sort((a, b) => {
            // Sort by priority first (1 = highest)
            if (a.priority !== b.priority) return a.priority - b.priority;
            // Then by order
            return (a.order || 0) - (b.order || 0);
        });
    }

    /**
     * Get tasks by folder
     */
    function getByFolder(folderId) {
        return tasksCache.filter(t => t.folderId === folderId && !t.isArchived);
    }

    /**
     * Get tasks by priority
     */
    function getByPriority(priority) {
        return getActive().filter(t => t.priority === priority);
    }

    /**
     * Get task by ID
     */
    function getById(id) {
        return tasksCache.find(t => t.id === id);
    }

    /**
     * Reorder tasks
     */
    async function reorder(taskIds) {
        for (let i = 0; i < taskIds.length; i++) {
            const task = tasksCache.find(t => t.id === taskIds[i]);
            if (task) {
                task.order = i;
                await Storage.Tasks.update(task);
            }
        }

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }
    }

    /**
     * Move task to folder
     */
    async function moveToFolder(taskId, folderId) {
        return update(taskId, { folderId });
    }

    /**
     * Quick capture (brain dump)
     */
    async function quickCapture(text) {
        const inbox = foldersCache.find(f => f.name === 'Inbox' || f.isSystem);

        return create({
            name: text.substring(0, 100),
            description: text.length > 100 ? text : '',
            duration: 25,
            priority: 4,
            folderId: inbox ? inbox.id : 'inbox'
        });
    }

    /**
     * Get all folders
     */
    function getFolders() {
        return foldersCache;
    }

    /**
     * Create a folder
     */
    async function createFolder(folderData) {
        const folder = {
            name: folderData.name,
            icon: folderData.icon || '📁',
            color: folderData.color || '#6B7280',
            isSystem: false
        };

        const id = await Storage.Folders.add(folder);
        folder.id = id;

        foldersCache.push(folder);

        if (onUpdate) {
            onUpdate({ tasks: tasksCache, folders: foldersCache });
        }

        return folder;
    }

    /**
     * Get priority info
     */
    function getPriorityInfo(priority) {
        const priorities = {
            1: { label: 'Urgent & Important', color: '#DC2626', emoji: '🔴' },
            2: { label: 'Important', color: '#F59E0B', emoji: '🟠' },
            3: { label: 'Urgent', color: '#3B82F6', emoji: '🔵' },
            4: { label: 'Normal', color: '#6B7280', emoji: '⚪' }
        };
        return priorities[priority] || priorities[4];
    }

    /**
     * Get folder info
     */
    function getFolderInfo(folderId) {
        const folder = foldersCache.find(f => f.id === folderId);
        if (folder) return folder;

        // Default folders by name
        const defaults = {
            'inbox': { name: 'Inbox', icon: '📥', color: '#6B7280' },
            'academic': { name: 'Academic', icon: '📚', color: '#3B82F6' },
            'projects': { name: 'Projects', icon: '💻', color: '#8B5CF6' },
            'personal': { name: 'Personal', icon: '🏠', color: '#10B981' }
        };

        return defaults[folderId] || defaults.inbox;
    }

    /**
     * Snooze a task (hide for specified time)
     */
    async function snooze(id, durationMinutes) {
        const snoozeUntil = Date.now() + (durationMinutes * 60 * 1000);
        return update(id, {
            snoozedUntil: snoozeUntil,
            isSnoozed: true
        });
    }

    /**
     * Unsnooze a task
     */
    async function unsnooze(id) {
        return update(id, {
            snoozedUntil: null,
            isSnoozed: false
        });
    }

    /**
     * Get inbox items (unsnoozed only)
     */
    function getInboxItems() {
        const now = Date.now();
        return tasksCache.filter(t =>
            t.folderId === 'inbox' &&
            !t.isCompleted &&
            !t.isArchived &&
            (!t.snoozedUntil || t.snoozedUntil <= now)
        );
    }

    /**
     * Get snoozed items
     */
    function getSnoozedItems() {
        const now = Date.now();
        return tasksCache.filter(t =>
            t.snoozedUntil && t.snoozedUntil > now
        );
    }

    /**
     * Check and unsnooze expired items
     */
    async function checkSnoozedItems() {
        const now = Date.now();
        const expired = tasksCache.filter(t =>
            t.snoozedUntil && t.snoozedUntil <= now
        );

        for (const task of expired) {
            await unsnooze(task.id);
        }

        return expired.length;
    }

    /**
     * Get completion rate statistics
     */
    function getCompletionRate() {
        const all = tasksCache.length;
        const completed = tasksCache.filter(t => t.isCompleted).length;
        const active = tasksCache.filter(t => !t.isCompleted && !t.isArchived).length;
        const archived = tasksCache.filter(t => t.isArchived).length;

        return {
            total: all,
            completed,
            active,
            archived,
            completionRate: all > 0 ? Math.round((completed / all) * 100) : 0
        };
    }

    /**
     * Get category/folder breakdown
     */
    function getCategoryBreakdown() {
        const breakdown = {};

        tasksCache.forEach(task => {
            const folderId = task.folderId || 'inbox';
            if (!breakdown[folderId]) {
                breakdown[folderId] = {
                    total: 0,
                    completed: 0,
                    active: 0,
                    totalDuration: 0
                };
            }

            breakdown[folderId].total++;
            breakdown[folderId].totalDuration += task.duration || 25;

            if (task.isCompleted) {
                breakdown[folderId].completed++;
            } else if (!task.isArchived) {
                breakdown[folderId].active++;
            }
        });

        return Object.entries(breakdown).map(([folderId, stats]) => ({
            folderId,
            folder: getFolderInfo(folderId),
            ...stats,
            completionRate: stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0
        }));
    }

    return {
        init,
        refresh,
        create,
        update,
        remove,
        incrementSessions,
        complete,
        archive,
        getActive,
        getQueue,
        getByFolder,
        getByPriority,
        getById,
        reorder,
        moveToFolder,
        quickCapture,
        getFolders,
        createFolder,
        getPriorityInfo,
        getFolderInfo,
        snooze,
        unsnooze,
        getInboxItems,
        getSnoozedItems,
        checkSnoozedItems,
        getCompletionRate,
        getCategoryBreakdown,
        getAll: () => tasksCache
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tasks;
}
