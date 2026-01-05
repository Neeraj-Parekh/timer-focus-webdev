/**
 * Focus Timer Pro - Reports Module
 * Weekly/monthly statistics and PDF export
 */

const Reports = (() => {
    /**
     * Get weekly report data
     */
    async function getWeeklyReport() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const stats = await Storage.DailyStats.getAll();
        const weekStats = stats.filter(s => {
            const statDate = new Date(s.date);
            return statDate >= startOfWeek && statDate <= today;
        });

        // Aggregate data
        let totalMinutes = 0;
        let totalTasks = 0;
        let totalSessions = 0;
        const dailyData = [];
        const hourlyData = new Array(24).fill(0);

        weekStats.forEach(day => {
            totalMinutes += day.focusMinutes || 0;
            totalTasks += day.tasksCompleted || 0;
            totalSessions += day.sessionsCompleted || 0;

            dailyData.push({
                date: day.date,
                minutes: day.focusMinutes || 0,
                tasks: day.tasksCompleted || 0
            });

            // Aggregate hourly data
            if (day.hourlyData) {
                day.hourlyData.forEach((mins, hour) => {
                    hourlyData[hour] += mins;
                });
            }
        });

        // Find peak hours
        const peakHour = hourlyData.indexOf(Math.max(...hourlyData));
        const peakHours = hourlyData
            .map((mins, hour) => ({ hour, mins }))
            .filter(h => h.mins > 0)
            .sort((a, b) => b.mins - a.mins)
            .slice(0, 3);

        return {
            period: 'week',
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            totalMinutes,
            totalHours: Math.round(totalMinutes / 60 * 10) / 10,
            totalTasks,
            totalSessions,
            averageMinutesPerDay: Math.round(totalMinutes / 7),
            averageTasksPerDay: Math.round(totalTasks / 7 * 10) / 10,
            dailyData,
            hourlyData,
            peakHour,
            peakHours,
            mostProductiveDay: dailyData.reduce((max, day) =>
                day.minutes > (max?.minutes || 0) ? day : max, null)
        };
    }

    /**
     * Get monthly report data
     */
    async function getMonthlyReport() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const stats = await Storage.DailyStats.getAll();
        const monthStats = stats.filter(s => {
            const statDate = new Date(s.date);
            return statDate >= startOfMonth && statDate <= today;
        });

        // Aggregate by week
        const weeklyTotals = [0, 0, 0, 0, 0]; // 5 possible weeks
        let totalMinutes = 0;
        let totalTasks = 0;
        let totalSessions = 0;
        let daysWithFocus = 0;
        const categoryBreakdown = {};

        monthStats.forEach(day => {
            totalMinutes += day.focusMinutes || 0;
            totalTasks += day.tasksCompleted || 0;
            totalSessions += day.sessionsCompleted || 0;

            if (day.focusMinutes > 0) daysWithFocus++;

            // Week of month
            const dayOfMonth = new Date(day.date).getDate();
            const weekIndex = Math.floor((dayOfMonth - 1) / 7);
            weeklyTotals[weekIndex] += day.focusMinutes || 0;

            // Category breakdown
            if (day.categoryData) {
                Object.entries(day.categoryData).forEach(([cat, mins]) => {
                    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + mins;
                });
            }
        });

        // Streak calculation
        let streak = 0;
        let currentStreak = 0;
        const sortedStats = [...monthStats].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        for (const day of sortedStats) {
            if (day.focusMinutes > 0) {
                currentStreak++;
            } else {
                break;
            }
        }
        streak = currentStreak;

        return {
            period: 'month',
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear(),
            startDate: startOfMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            totalMinutes,
            totalHours: Math.round(totalMinutes / 60 * 10) / 10,
            totalTasks,
            totalSessions,
            daysWithFocus,
            daysInMonth: today.getDate(),
            consistency: Math.round((daysWithFocus / today.getDate()) * 100),
            averageMinutesPerDay: Math.round(totalMinutes / today.getDate()),
            weeklyTotals,
            categoryBreakdown,
            currentStreak: streak,
            completionRate: totalTasks > 0
                ? Math.round((totalTasks / (totalSessions || 1)) * 100)
                : 0
        };
    }

    /**
     * Get productivity insights
     */
    async function getInsights() {
        const weekly = await getWeeklyReport();
        const monthly = await getMonthlyReport();

        const insights = [];

        // Peak productivity insight
        if (weekly.peakHour >= 0) {
            const hour = weekly.peakHour;
            const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
            insights.push({
                type: 'peak',
                icon: '⏰',
                title: 'Peak Productivity',
                message: `You're most productive in the ${period} (${formatHour(hour)})`
            });
        }

        // Streak insight
        if (monthly.currentStreak >= 3) {
            insights.push({
                type: 'streak',
                icon: '🔥',
                title: 'Great Streak!',
                message: `${monthly.currentStreak} days in a row! Keep it up.`
            });
        }

        // Consistency insight
        if (monthly.consistency >= 70) {
            insights.push({
                type: 'consistency',
                icon: '📈',
                title: 'Strong Consistency',
                message: `You've focused ${monthly.consistency}% of days this month!`
            });
        } else if (monthly.consistency < 30) {
            insights.push({
                type: 'consistency',
                icon: '💪',
                title: 'Room for Growth',
                message: `Try to focus a little each day. Small steps count!`
            });
        }

        // Weekly comparison
        if (weekly.averageMinutesPerDay > monthly.averageMinutesPerDay) {
            const improvement = Math.round(
                ((weekly.averageMinutesPerDay - monthly.averageMinutesPerDay) /
                    monthly.averageMinutesPerDay) * 100
            );
            if (improvement > 10) {
                insights.push({
                    type: 'improvement',
                    icon: '🚀',
                    title: 'Improving!',
                    message: `This week is ${improvement}% better than your monthly average!`
                });
            }
        }

        return insights;
    }

    /**
     * Generate PDF report content (HTML format for printing)
     */
    async function generatePDFContent() {
        const weekly = await getWeeklyReport();
        const monthly = await getMonthlyReport();
        const insights = await getInsights();

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Focus Timer Pro - Report</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: 'Inter', sans-serif; color: #1E293B; padding: 20px; }
        h1 { color: #3B82F6; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
        h2 { color: #475569; margin-top: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat-box { background: #F1F5F9; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .stat-label { font-size: 12px; color: #64748B; }
        .insight { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 10px 15px; margin: 10px 0; }
        .chart { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .bar-container { display: flex; align-items: flex-end; height: 150px; gap: 5px; }
        .bar { background: linear-gradient(to top, #3B82F6, #8B5CF6); border-radius: 4px 4px 0 0; }
        .bar-label { text-align: center; font-size: 10px; margin-top: 5px; }
        footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; }
    </style>
</head>
<body>
    <h1>📊 Focus Timer Pro Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>

    <h2>📅 This Week</h2>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-value">${weekly.totalHours}h</div>
            <div class="stat-label">Focus Time</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${weekly.totalTasks}</div>
            <div class="stat-label">Tasks Completed</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${weekly.totalSessions}</div>
            <div class="stat-label">Focus Sessions</div>
        </div>
    </div>

    <h2>📈 This Month (${monthly.month})</h2>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-value">${monthly.totalHours}h</div>
            <div class="stat-label">Total Focus Time</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${monthly.consistency}%</div>
            <div class="stat-label">Consistency</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${monthly.currentStreak}</div>
            <div class="stat-label">Current Streak</div>
        </div>
    </div>

    <h2>💡 Insights</h2>
    ${insights.map(i => `
        <div class="insight">
            <strong>${i.icon} ${i.title}</strong><br>
            ${i.message}
        </div>
    `).join('')}

    <footer>
        Focus Timer Pro • Your Productivity Partner<br>
        Keep up the great work! 🎉
    </footer>
</body>
</html>
        `;
    }

    /**
     * Open print dialog for PDF export
     */
    async function printReport() {
        const content = await generatePDFContent();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
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

    /**
     * Render weekly chart
     */
    function renderWeeklyChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || !data.dailyData) return;

        const maxMinutes = Math.max(...data.dailyData.map(d => d.minutes), 1);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        container.innerHTML = `
            <div class="weekly-chart">
                <div class="chart-bars">
                    ${data.dailyData.map((day, i) => `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" 
                                 style="height: ${(day.minutes / maxMinutes) * 100}%"
                                 title="${day.minutes} min">
                            </div>
                            <span class="chart-label">${days[i]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Inject CSS
     */
    function injectStyles() {
        if (document.getElementById('reports-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'reports-styles-css';
        styles.textContent = `
            .weekly-chart {
                padding: var(--space-3);
            }
            
            .chart-bars {
                display: flex;
                align-items: flex-end;
                height: 120px;
                gap: var(--space-2);
            }
            
            .chart-bar-wrapper {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .chart-bar {
                width: 100%;
                min-height: 4px;
                background: linear-gradient(to top, var(--accent-primary), var(--accent-secondary));
                border-radius: var(--radius-sm) var(--radius-sm) 0 0;
                transition: height 0.3s ease;
            }
            
            .chart-label {
                font-size: var(--text-xs);
                color: var(--text-muted);
                margin-top: var(--space-1);
            }
            
            .insight-card {
                display: flex;
                gap: var(--space-3);
                padding: var(--space-3);
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                margin-bottom: var(--space-2);
            }
            
            .insight-icon {
                font-size: var(--text-2xl);
            }
            
            .insight-content h4 {
                font-size: var(--text-sm);
                font-weight: var(--font-semibold);
                margin-bottom: var(--space-1);
            }
            
            .insight-content p {
                font-size: var(--text-xs);
                color: var(--text-muted);
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
        getWeeklyReport,
        getMonthlyReport,
        getInsights,
        generatePDFContent,
        printReport,
        renderWeeklyChart,
        formatHour
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Reports;
}
