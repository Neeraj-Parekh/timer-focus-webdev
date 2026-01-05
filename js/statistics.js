/**
 * Focus Timer Pro - Statistics Module
 * Data aggregation and visualization helpers
 */

const Statistics = (() => {
    /**
     * Get today's statistics
     */
    async function getToday() {
        const stats = await Storage.DailyStats.getOrCreate();
        return {
            focusTime: formatDuration(stats.totalFocusSeconds),
            focusSeconds: stats.totalFocusSeconds,
            tasksCompleted: stats.completedTasks,
            sessionCount: stats.sessionCount
        };
    }

    /**
     * Get current streak
     */
    async function getStreak() {
        return Storage.DailyStats.getStreak();
    }

    /**
     * Get last 7 days data
     */
    async function getLast7Days() {
        return Storage.DailyStats.getLast7Days();
    }

    /**
     * Get weekly summary
     */
    async function getWeeklySummary() {
        const days = await getLast7Days();

        const totalSeconds = days.reduce((sum, d) => sum + d.totalFocusSeconds, 0);
        const totalTasks = days.reduce((sum, d) => sum + d.completedTasks, 0);
        const avgSecondsPerDay = totalSeconds / 7;

        // Find best day
        let bestDay = days[0];
        days.forEach(d => {
            if (d.totalFocusSeconds > bestDay.totalFocusSeconds) {
                bestDay = d;
            }
        });

        return {
            totalFocusTime: formatDuration(totalSeconds),
            totalTasks: totalTasks,
            avgDailyTime: formatDuration(avgSecondsPerDay),
            bestDay: {
                name: bestDay.dayName,
                time: formatDuration(bestDay.totalFocusSeconds)
            },
            chartData: days.map(d => ({
                label: d.dayName,
                value: Math.round(d.totalFocusSeconds / 60), // minutes
                tasks: d.completedTasks
            }))
        };
    }

    /**
     * Get folder statistics
     */
    async function getFolderStats() {
        const sessions = await Storage.Sessions.getAll();
        const tasks = await Storage.Tasks.getAll();

        const folderTime = {};

        sessions.forEach(session => {
            const task = tasks.find(t => t.id === session.taskId);
            if (task) {
                const folderId = task.folderId || 'inbox';
                folderTime[folderId] = (folderTime[folderId] || 0) + (session.actualDuration || 0);
            }
        });

        return Object.entries(folderTime).map(([folderId, seconds]) => ({
            folderId,
            focusTime: formatDuration(seconds),
            focusSeconds: seconds
        }));
    }

    /**
     * Get productivity by hour
     */
    async function getProductivityByHour() {
        const sessions = await Storage.Sessions.getAll();

        const hourlyData = Array(24).fill(0).map((_, hour) => ({
            hour,
            label: `${hour}:00`,
            sessions: 0,
            focusSeconds: 0,
            completedTasks: 0
        }));

        sessions.forEach(session => {
            const hour = session.timeOfDay || 0;
            hourlyData[hour].sessions++;
            hourlyData[hour].focusSeconds += session.actualDuration || 0;
            if (session.wasCompleted) {
                hourlyData[hour].completedTasks++;
            }
        });

        // Find peak hours
        const peakHours = [...hourlyData]
            .sort((a, b) => b.focusSeconds - a.focusSeconds)
            .slice(0, 3)
            .map(h => h.hour);

        return {
            data: hourlyData,
            peakHours
        };
    }

    /**
     * Calculate focus quality score
     */
    function calculateFocusQuality(session) {
        const plannedDuration = session.plannedDuration || 1;
        const actualDuration = session.actualDuration || 0;
        const completionRatio = actualDuration / plannedDuration;

        // Penalize for not completing
        if (!session.wasCompleted) {
            return Math.min(completionRatio * 0.7, 0.7);
        }

        // Perfect completion is 1.0
        if (completionRatio >= 0.95 && completionRatio <= 1.1) {
            return 1.0;
        }

        // Slight penalty for going over or under
        return Math.max(0.5, 1 - Math.abs(1 - completionRatio) * 0.3);
    }

    /**
     * Get focus quality trends over time
     */
    async function getFocusQualityTrends() {
        const sessions = await Storage.Sessions.getAll();

        // Group by day
        const dailyQuality = {};
        sessions.forEach(session => {
            const date = new Date(session.completedAt).toISOString().split('T')[0];
            if (!dailyQuality[date]) {
                dailyQuality[date] = { scores: [], count: 0 };
            }
            dailyQuality[date].scores.push(calculateFocusQuality(session));
            dailyQuality[date].count++;
        });

        // Calculate averages
        const trends = Object.entries(dailyQuality)
            .map(([date, data]) => ({
                date,
                avgQuality: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100),
                sessionCount: data.count
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14); // Last 14 days

        // Calculate trend direction
        const recentAvg = trends.slice(-7).reduce((sum, d) => sum + d.avgQuality, 0) / 7;
        const olderAvg = trends.slice(0, 7).reduce((sum, d) => sum + d.avgQuality, 0) / 7;

        return {
            data: trends,
            currentAvg: Math.round(recentAvg),
            trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
            trendPercent: Math.round(((recentAvg - olderAvg) / (olderAvg || 1)) * 100)
        };
    }

    /**
     * Get task completion statistics
     */
    async function getTaskCompletionStats() {
        const tasks = await Storage.Tasks.getAll();
        const sessions = await Storage.Sessions.getAll();

        const completed = tasks.filter(t => t.isCompleted).length;
        const total = tasks.length;
        const active = tasks.filter(t => !t.isCompleted && !t.isArchived).length;

        // Sessions analysis
        const completedSessions = sessions.filter(s => s.wasCompleted).length;
        const abandonedSessions = sessions.filter(s => !s.wasCompleted).length;

        return {
            tasks: {
                total,
                completed,
                active,
                archived: tasks.filter(t => t.isArchived).length,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            },
            sessions: {
                total: sessions.length,
                completed: completedSessions,
                abandoned: abandonedSessions,
                completionRate: sessions.length > 0
                    ? Math.round((completedSessions / sessions.length) * 100)
                    : 0
            }
        };
    }

    /**
     * Get category/folder breakdown with stats
     */
    async function getCategoryStats() {
        const sessions = await Storage.Sessions.getAll();
        const tasks = await Storage.Tasks.getAll();
        const folders = await Storage.Folders.getAll();

        const categoryData = {};

        // Initialize categories
        folders.forEach(folder => {
            categoryData[folder.id] = {
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                sessions: 0,
                focusTime: 0,
                tasksCompleted: 0,
                totalTasks: 0
            };
        });

        // Add inbox
        categoryData['inbox'] = {
            name: 'Inbox',
            icon: '📥',
            color: '#6B7280',
            sessions: 0,
            focusTime: 0,
            tasksCompleted: 0,
            totalTasks: 0
        };

        // Aggregate task data
        tasks.forEach(task => {
            const folderId = task.folderId || 'inbox';
            if (categoryData[folderId]) {
                categoryData[folderId].totalTasks++;
                if (task.isCompleted) {
                    categoryData[folderId].tasksCompleted++;
                }
            }
        });

        // Aggregate session data
        sessions.forEach(session => {
            const task = tasks.find(t => t.id === session.taskId);
            const folderId = task?.folderId || 'inbox';
            if (categoryData[folderId]) {
                categoryData[folderId].sessions++;
                categoryData[folderId].focusTime += session.actualDuration || 0;
            }
        });

        return Object.entries(categoryData)
            .map(([id, data]) => ({
                id,
                ...data,
                focusTimeFormatted: formatDuration(data.focusTime),
                completionRate: data.totalTasks > 0
                    ? Math.round((data.tasksCompleted / data.totalTasks) * 100)
                    : 0
            }))
            .sort((a, b) => b.focusTime - a.focusTime);
    }

    /**
     * Get Eisenhower Matrix quadrant statistics
     */
    async function getQuadrantStats() {
        const sessions = await Storage.Sessions.getAll();
        const tasks = await Storage.Tasks.getAll();

        const quadrants = {
            1: { name: 'Urgent & Important', emoji: '🔴', tasks: 0, sessions: 0, focusTime: 0 },
            2: { name: 'Important', emoji: '🟠', tasks: 0, sessions: 0, focusTime: 0 },
            3: { name: 'Urgent', emoji: '🔵', tasks: 0, sessions: 0, focusTime: 0 },
            4: { name: 'Normal', emoji: '⚪', tasks: 0, sessions: 0, focusTime: 0 }
        };

        // Count tasks by priority
        tasks.forEach(task => {
            const q = task.priority || 4;
            if (quadrants[q]) {
                quadrants[q].tasks++;
            }
        });

        // Aggregate session data
        sessions.forEach(session => {
            const task = tasks.find(t => t.id === session.taskId);
            const q = task?.priority || 4;
            if (quadrants[q]) {
                quadrants[q].sessions++;
                quadrants[q].focusTime += session.actualDuration || 0;
            }
        });

        return Object.entries(quadrants).map(([priority, data]) => ({
            priority: parseInt(priority),
            ...data,
            focusTimeFormatted: formatDuration(data.focusTime)
        }));
    }

    /**
     * Export statistics as CSV
     */
    async function exportCSV() {
        const days = await getLast7Days();
        const sessions = await Storage.Sessions.getAll();
        const tasks = await Storage.Tasks.getAll();

        // Daily stats CSV
        let csv = 'Date,Focus Time (min),Tasks Completed,Sessions\n';
        days.forEach(d => {
            csv += `${d.date},${Math.round(d.totalFocusSeconds / 60)},${d.completedTasks},${d.sessionCount || 0}\n`;
        });

        csv += '\n\nSession Details\n';
        csv += 'Date,Task,Planned (min),Actual (min),Completed\n';

        sessions.forEach(s => {
            const task = tasks.find(t => t.id === s.taskId);
            const date = new Date(s.completedAt).toLocaleDateString();
            csv += `${date},"${task?.name || 'Unknown'}",${Math.round(s.plannedDuration / 60)},${Math.round(s.actualDuration / 60)},${s.wasCompleted ? 'Yes' : 'No'}\n`;
        });

        return csv;
    }

    /**
     * Download CSV file
     */
    async function downloadCSV() {
        const csv = await exportCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `focus-timer-stats-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Format seconds to human readable
     */
    function formatDuration(seconds) {
        if (seconds < 60) return '< 1m';

        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    /**
     * Render bar chart
     */
    function renderBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value), 1);

        container.innerHTML = data.map((d, i) => {
            const height = Math.max(4, (d.value / maxValue) * 100);
            return `
                <div class="chart-bar" 
                     style="height: ${height}%;" 
                     data-label="${d.label}"
                     data-value="${d.value}"
                     title="${d.label}: ${d.value} min">
                </div>
            `;
        }).join('');
    }

    return {
        getToday,
        getStreak,
        getLast7Days,
        getWeeklySummary,
        getFolderStats,
        getProductivityByHour,
        calculateFocusQuality,
        getFocusQualityTrends,
        getTaskCompletionStats,
        getCategoryStats,
        getQuadrantStats,
        exportCSV,
        downloadCSV,
        formatDuration,
        renderBarChart
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Statistics;
}
