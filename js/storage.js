/**
 * Focus Timer Pro - Storage Module
 * IndexedDB wrapper for persistent data storage
 */

const Storage = (() => {
    const DB_NAME = 'FocusTimerDB';
    const DB_VERSION = 2; // Bumped for data collection stores
    let db = null;

    // Object stores
    const STORES = {
        TASKS: 'tasks',
        FOLDERS: 'folders',
        SESSIONS: 'sessions',
        SETTINGS: 'settings',
        STATS: 'dailyStats',
        // Data Collection stores (for ML training)
        TASK_METRICS: 'task_metrics',
        DAILY_STATE: 'daily_state',
        SESSION_METRICS: 'session_metrics'
    };

    /**
     * Initialize IndexedDB
     */
    async function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                db = request.result;
                console.log('Database initialized successfully');
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // Tasks store
                if (!database.objectStoreNames.contains(STORES.TASKS)) {
                    const taskStore = database.createObjectStore(STORES.TASKS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    taskStore.createIndex('folderId', 'folderId', { unique: false });
                    taskStore.createIndex('priority', 'priority', { unique: false });
                    taskStore.createIndex('createdAt', 'createdAt', { unique: false });
                    taskStore.createIndex('isArchived', 'isArchived', { unique: false });
                }

                // Folders store
                if (!database.objectStoreNames.contains(STORES.FOLDERS)) {
                    const folderStore = database.createObjectStore(STORES.FOLDERS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    folderStore.createIndex('name', 'name', { unique: false });
                }

                // Sessions store
                if (!database.objectStoreNames.contains(STORES.SESSIONS)) {
                    const sessionStore = database.createObjectStore(STORES.SESSIONS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    sessionStore.createIndex('taskId', 'taskId', { unique: false });
                    sessionStore.createIndex('completedAt', 'completedAt', { unique: false });
                }

                // Settings store (key-value)
                if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                    database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                // Daily statistics store
                if (!database.objectStoreNames.contains(STORES.STATS)) {
                    const statsStore = database.createObjectStore(STORES.STATS, {
                        keyPath: 'date'
                    });
                    statsStore.createIndex('date', 'date', { unique: true });
                }

                // === DATA COLLECTION STORES (for ML training) ===

                // Task Metrics store (per-task input features + post-completion feedback)
                if (!database.objectStoreNames.contains(STORES.TASK_METRICS)) {
                    const metricsStore = database.createObjectStore(STORES.TASK_METRICS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    metricsStore.createIndex('taskId', 'taskId', { unique: false });
                }

                // Daily State store (morning/evening energy, sleep, fatigue)
                if (!database.objectStoreNames.contains(STORES.DAILY_STATE)) {
                    database.createObjectStore(STORES.DAILY_STATE, {
                        keyPath: 'date' // YYYY-MM-DD
                    });
                }

                // Session Metrics store (auto-tracked focus quality data)
                if (!database.objectStoreNames.contains(STORES.SESSION_METRICS)) {
                    const sessionMetricsStore = database.createObjectStore(STORES.SESSION_METRICS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    sessionMetricsStore.createIndex('sessionId', 'sessionId', { unique: false });
                    sessionMetricsStore.createIndex('taskId', 'taskId', { unique: false });
                }
            };
        });
    }

    /**
     * Generic CRUD operations
     */
    function getStore(storeName, mode = 'readonly') {
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    async function add(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.add({
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function put(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.put({
                ...data,
                updatedAt: Date.now()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function get(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function getAll(storeName) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async function remove(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async function clear(storeName) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async function getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Task-specific operations
     */
    const Tasks = {
        add: (task) => add(STORES.TASKS, task),
        update: (task) => put(STORES.TASKS, task),
        get: (id) => get(STORES.TASKS, id),
        getAll: () => getAll(STORES.TASKS),
        delete: (id) => remove(STORES.TASKS, id),
        getByFolder: (folderId) => getByIndex(STORES.TASKS, 'folderId', folderId),

        async getActive() {
            const all = await getAll(STORES.TASKS);
            return all.filter(t => !t.isArchived && !t.isCompleted);
        },

        async getQueue() {
            const active = await this.getActive();
            return active.sort((a, b) => {
                // Sort by priority (1 = highest), then by order
                if (a.priority !== b.priority) return a.priority - b.priority;
                return (a.order || 0) - (b.order || 0);
            });
        },

        async reorder(taskIds) {
            const tasks = await this.getAll();
            for (let i = 0; i < taskIds.length; i++) {
                const task = tasks.find(t => t.id === taskIds[i]);
                if (task) {
                    task.order = i;
                    await put(STORES.TASKS, task);
                }
            }
        }
    };

    /**
     * Folder-specific operations
     */
    const Folders = {
        add: (folder) => add(STORES.FOLDERS, folder),
        update: (folder) => put(STORES.FOLDERS, folder),
        get: (id) => get(STORES.FOLDERS, id),
        getAll: () => getAll(STORES.FOLDERS),
        delete: (id) => remove(STORES.FOLDERS, id),

        async initDefaults() {
            const existing = await this.getAll();
            if (existing.length > 0) return;

            const defaults = [
                { name: 'Inbox', icon: 'inbox', color: '#6B7280', isSystem: true },
                { name: 'Academic', icon: 'school', color: '#3B82F6', isSystem: true },
                { name: 'Projects', icon: 'work', color: '#8B5CF6', isSystem: true },
                { name: 'Personal', icon: 'home', color: '#10B981', isSystem: true }
            ];

            for (const folder of defaults) {
                await this.add(folder);
            }
        }
    };

    /**
     * Session-specific operations
     */
    const Sessions = {
        add: (session) => add(STORES.SESSIONS, session),
        update: (session) => put(STORES.SESSIONS, session),
        get: (id) => get(STORES.SESSIONS, id),
        getAll: () => getAll(STORES.SESSIONS),
        getByTask: (taskId) => getByIndex(STORES.SESSIONS, 'taskId', taskId),

        async getToday() {
            const all = await this.getAll();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startOfDay = today.getTime();
            return all.filter(s => s.completedAt >= startOfDay);
        },

        async getTotalFocusTime(days = 1) {
            const all = await this.getAll();
            const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
            return all
                .filter(s => s.completedAt >= cutoff && s.wasCompleted)
                .reduce((total, s) => total + (s.actualDuration || 0), 0);
        }
    };

    /**
     * Settings operations
     */
    const Settings = {
        async get(key, defaultValue = null) {
            try {
                const result = await get(STORES.SETTINGS, key);
                return result ? result.value : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        async set(key, value) {
            return put(STORES.SETTINGS, { key, value });
        },

        async getAll() {
            const all = await getAll(STORES.SETTINGS);
            return all.reduce((obj, item) => {
                obj[item.key] = item.value;
                return obj;
            }, {});
        },

        defaults: {
            timerStyle: 'circular',
            defaultDuration: 25,
            keepScreenOn: true,
            alertSound: 'bell',
            volume: 80,
            vibrate: true,
            noiseType: 'none',
            noiseVolume: 30,
            autoStartBreak: true,
            breakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4
        },

        async init() {
            const settings = await this.getAll();
            const merged = { ...this.defaults, ...settings };

            // Save any missing defaults
            for (const [key, value] of Object.entries(this.defaults)) {
                if (!(key in settings)) {
                    await this.set(key, value);
                }
            }

            return merged;
        }
    };

    /**
     * Daily statistics operations
     */
    const DailyStats = {
        async getOrCreate(date = new Date()) {
            const dateStr = date.toISOString().split('T')[0];
            let stats = await get(STORES.STATS, dateStr);

            if (!stats) {
                stats = {
                    date: dateStr,
                    totalFocusSeconds: 0,
                    completedTasks: 0,
                    skippedTasks: 0,
                    sessionCount: 0,
                    averageFocusQuality: 0
                };
                await put(STORES.STATS, stats);
            }

            return stats;
        },

        async update(updates) {
            const stats = await this.getOrCreate();
            Object.assign(stats, updates);
            return put(STORES.STATS, stats);
        },

        async addFocusTime(seconds) {
            const stats = await this.getOrCreate();
            stats.totalFocusSeconds += seconds;
            stats.sessionCount += 1;
            return put(STORES.STATS, stats);
        },

        async incrementCompleted() {
            const stats = await this.getOrCreate();
            stats.completedTasks += 1;
            return put(STORES.STATS, stats);
        },

        async getLast7Days() {
            const result = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const stats = await get(STORES.STATS, dateStr);
                result.push({
                    date: dateStr,
                    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    ...(stats || { totalFocusSeconds: 0, completedTasks: 0 })
                });
            }
            return result;
        },

        async getStreak() {
            let streak = 0;
            const today = new Date();

            for (let i = 0; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const stats = await get(STORES.STATS, dateStr);

                if (stats && stats.totalFocusSeconds > 0) {
                    streak++;
                } else if (i > 0) {
                    // Allow today to not have activity yet
                    break;
                }
            }

            return streak;
        }
    };

    /**
     * Task Metrics operations (ML data collection)
     */
    const TaskMetrics = {
        add: (metrics) => add(STORES.TASK_METRICS, metrics),
        update: (metrics) => put(STORES.TASK_METRICS, metrics),
        get: (id) => get(STORES.TASK_METRICS, id),
        getAll: () => getAll(STORES.TASK_METRICS),
        getByTask: (taskId) => getByIndex(STORES.TASK_METRICS, 'taskId', taskId),
        delete: (id) => remove(STORES.TASK_METRICS, id),

        async getForTask(taskId) {
            const all = await this.getByTask(taskId);
            return all.length > 0 ? all[0] : null;
        },

        async saveCompletion(taskId, feedbackData) {
            const existing = await this.getForTask(taskId);
            if (existing) {
                return this.update({
                    ...existing,
                    ...feedbackData,
                    completedAt: Date.now(),
                    completedAtHour: new Date().getHours(),
                    completedAtDayOfWeek: new Date().getDay() + 1
                });
            } else {
                return this.add({
                    taskId,
                    ...feedbackData,
                    completedAt: Date.now(),
                    completedAtHour: new Date().getHours(),
                    completedAtDayOfWeek: new Date().getDay() + 1
                });
            }
        }
    };

    /**
     * Daily State operations (morning/evening energy tracking)
     */
    const DailyState = {
        async getToday() {
            const dateStr = new Date().toISOString().split('T')[0];
            return get(STORES.DAILY_STATE, dateStr);
        },

        async saveToday(stateData) {
            const dateStr = new Date().toISOString().split('T')[0];
            const existing = await this.getToday() || { date: dateStr };
            const now = Date.now();
            return put(STORES.DAILY_STATE, {
                ...existing,
                ...stateData,
                updatedAt: now
            });
        },

        async saveMorning(energy, sleepHours = null) {
            return this.saveToday({
                morningEnergy: energy,
                morningLoggedAt: Date.now(),
                ...(sleepHours !== null && { sleepHours })
            });
        },

        async saveEvening(energy, fatigue, restQuality) {
            return this.saveToday({
                eveningEnergy: energy,
                fatigueLevel: fatigue,
                restQuality: restQuality,
                eveningLoggedAt: Date.now()
            });
        },

        async shouldShowMorningPrompt() {
            const now = new Date();
            const hour = now.getHours();
            if (hour < 6 || hour > 12) return false; // Only 6AM-12PM

            const today = await this.getToday();
            return !today || !today.morningLoggedAt;
        },

        async shouldShowEveningPrompt() {
            const now = new Date();
            const hour = now.getHours();
            if (hour < 20) return false; // Only after 8PM

            const today = await this.getToday();
            return !today || !today.eveningLoggedAt;
        },

        getAll: () => getAll(STORES.DAILY_STATE)
    };

    /**
     * Session Metrics operations (auto-tracked focus quality)
     */
    const SessionMetrics = {
        add: (metrics) => add(STORES.SESSION_METRICS, metrics),
        update: (metrics) => put(STORES.SESSION_METRICS, metrics),
        get: (id) => get(STORES.SESSION_METRICS, id),
        getAll: () => getAll(STORES.SESSION_METRICS),
        getBySession: (sessionId) => getByIndex(STORES.SESSION_METRICS, 'sessionId', sessionId),
        getByTask: (taskId) => getByIndex(STORES.SESSION_METRICS, 'taskId', taskId),

        async recordSession(sessionData) {
            const now = new Date();
            return this.add({
                ...sessionData,
                hourOfDay: now.getHours(),
                dayOfWeek: now.getDay() + 1,
                isWeekend: now.getDay() === 0 || now.getDay() === 6
            });
        }
    };

    /**
     * Export ML Training Data as CSV
     */
    async function exportMLTrainingData(startDate = null, endDate = null) {
        const tasks = await getAll(STORES.TASKS);
        const metrics = await getAll(STORES.TASK_METRICS);
        const sessions = await getAll(STORES.SESSIONS);
        const sessionMetrics = await getAll(STORES.SESSION_METRICS);
        const dailyStates = await getAll(STORES.DAILY_STATE);

        // Filter by date if provided
        let filteredTasks = tasks;
        if (startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime() + 86400000; // Include end day
            filteredTasks = tasks.filter(t => t.createdAt >= start && t.createdAt <= end);
        }

        // Build training rows
        const rows = filteredTasks.map(task => {
            const taskMetric = metrics.find(m => m.taskId === task.id);
            const taskSessions = sessions.filter(s => s.taskId === task.id);
            const taskSessionMetrics = sessionMetrics.filter(sm => sm.taskId === task.id);
            const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
            const dailyState = dailyStates.find(ds => ds.date === createdDate);

            return {
                // Task info
                task_id: task.id,
                task_category: task.folderId,
                priority: task.priority,
                duration_planned: task.duration,
                // Task metrics (ML features)
                importance: taskMetric?.importance ?? '',
                urgency: taskMetric?.urgency ?? '',
                optionality: taskMetric?.optionality ?? '',
                estimated_cognitive: taskMetric?.estimatedCognitive ?? '',
                created_hour: taskMetric?.createdAtHour ?? new Date(task.createdAt).getHours(),
                created_day: taskMetric?.createdAtDayOfWeek ?? new Date(task.createdAt).getDay() + 1,
                // Post-completion (ML labels)
                realized_roi: taskMetric?.realizedROI ?? '',
                actual_cognitive: taskMetric?.actualCognitive ?? '',
                satisfaction: taskMetric?.satisfaction ?? '',
                // Session data
                session_count: taskSessions.length,
                total_actual_time: taskSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
                pause_count: taskSessionMetrics.reduce((sum, sm) => sum + (sm.pauseCount || 0), 0),
                interruption_count: taskSessionMetrics.reduce((sum, sm) => sum + (sm.interruptionCount || 0), 0),
                // Daily state context
                user_morning_energy: dailyState?.morningEnergy ?? '',
                user_fatigue: dailyState?.fatigueLevel ?? '',
                // Outcome
                was_completed: task.isCompleted ? 1 : 0
            };
        });

        // Convert to CSV
        if (rows.length === 0) return '';
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map(row => headers.map(h => row[h]).join(','))
        ].join('\n');

        return csv;
    }

    /**
     * Backup and Restore
     */
    async function exportData() {
        const data = {
            version: DB_VERSION,
            timestamp: Date.now(),
            tasks: await getAll(STORES.TASKS),
            folders: await getAll(STORES.FOLDERS),
            sessions: await getAll(STORES.SESSIONS),
            settings: await getAll(STORES.SETTINGS),
            stats: await getAll(STORES.STATS),
            // Include data collection stores
            taskMetrics: await getAll(STORES.TASK_METRICS),
            dailyState: await getAll(STORES.DAILY_STATE),
            sessionMetrics: await getAll(STORES.SESSION_METRICS)
        };
        return JSON.stringify(data, null, 2);
    }

    async function importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Validate basic structure
            if (!data.tasks || !data.folders || !data.sessions) {
                throw new Error('Invalid backup file format');
            }

            // Clear existing data
            await clear(STORES.TASKS);
            await clear(STORES.FOLDERS);
            await clear(STORES.SESSIONS);
            await clear(STORES.SETTINGS);
            await clear(STORES.STATS);

            // Restore data
            const stores = [
                { name: STORES.TASKS, data: data.tasks },
                { name: STORES.FOLDERS, data: data.folders },
                { name: STORES.SESSIONS, data: data.sessions },
                { name: STORES.SETTINGS, data: data.settings },
                { name: STORES.STATS, data: data.stats }
            ];

            for (const store of stores) {
                if (store.data && Array.isArray(store.data)) {
                    for (const item of store.data) {
                        await put(store.name, item);
                    }
                }
            }

            return true;
        } catch (err) {
            console.error('Import failed:', err);
            throw err;
        }
    }

    return {
        init,
        Tasks,
        Folders,
        Sessions,
        Settings,
        DailyStats,
        // Data Collection modules
        TaskMetrics,
        DailyState,
        SessionMetrics,
        STORES,
        exportData,
        importData,
        exportMLTrainingData
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
