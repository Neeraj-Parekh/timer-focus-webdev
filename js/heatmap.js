/**
 * Focus Timer Pro - Calendar Heatmap Module
 * Visualize focus sessions as a GitHub-style contribution graph
 */

const CalendarHeatmap = (() => {
    const COLORS = {
        empty: '#1E293B',      // No data
        level1: '#1D4ED8',     // Light blue (< 30 min)
        level2: '#2563EB',     // Medium blue (30-60 min)
        level3: '#3B82F6',     // Blue (1-2 hours)
        level4: '#60A5FA',     // Light blue (2-4 hours)
        level5: '#93C5FD'      // Brightest (4+ hours)
    };

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    /**
     * Get color based on minutes worked
     */
    function getColor(minutes) {
        if (minutes === 0) return COLORS.empty;
        if (minutes < 30) return COLORS.level1;
        if (minutes < 60) return COLORS.level2;
        if (minutes < 120) return COLORS.level3;
        if (minutes < 240) return COLORS.level4;
        return COLORS.level5;
    }

    /**
     * Generate date range for last N weeks
     */
    function getDateRange(weeks = 12) {
        const dates = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (weeks * 7) + 1);

        // Adjust to start on Sunday
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const current = new Date(startDate);
        while (current <= today) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    /**
     * Format date for storage key
     */
    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Render the heatmap
     */
    async function render(containerId, weeks = 12) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Get daily stats data
        const dates = getDateRange(weeks);
        const dataMap = {};

        try {
            // Get all daily stats from storage
            const allStats = await Storage.DailyStats.getAll();
            allStats.forEach(stat => {
                dataMap[stat.date] = stat.focusMinutes || 0;
            });
        } catch (err) {
            console.error('Failed to load stats for heatmap:', err);
        }

        // Calculate weeks for layout
        const weekCount = Math.ceil(dates.length / 7);

        // Build HTML
        let html = `
            <div class="heatmap-container">
                <div class="heatmap-wrapper">
                    <div class="heatmap-day-labels">
                        ${DAYS.filter((_, i) => i % 2 === 1).map(d => `<span>${d}</span>`).join('')}
                    </div>
                    <div class="heatmap-grid" style="grid-template-columns: repeat(${weekCount}, 1fr)">
        `;

        // Group dates by week
        for (let week = 0; week < weekCount; week++) {
            html += `<div class="heatmap-week">`;
            for (let day = 0; day < 7; day++) {
                const index = week * 7 + day;
                if (index < dates.length) {
                    const date = dates[index];
                    const dateKey = formatDateKey(date);
                    const minutes = dataMap[dateKey] || 0;
                    const color = getColor(minutes);
                    const title = `${date.toLocaleDateString()}: ${formatMinutes(minutes)}`;

                    html += `
                        <div class="heatmap-cell" 
                             style="background: ${color}" 
                             title="${title}"
                             data-date="${dateKey}"
                             data-minutes="${minutes}">
                        </div>
                    `;
                } else {
                    html += `<div class="heatmap-cell empty"></div>`;
                }
            }
            html += `</div>`;
        }

        html += `
                    </div>
                </div>
                <div class="heatmap-months">
                    ${getMonthLabels(dates)}
                </div>
                <div class="heatmap-legend">
                    <span>Less</span>
                    <div class="legend-cells">
                        <div class="legend-cell" style="background: ${COLORS.empty}" title="0 min"></div>
                        <div class="legend-cell" style="background: ${COLORS.level1}" title="< 30 min"></div>
                        <div class="legend-cell" style="background: ${COLORS.level2}" title="30-60 min"></div>
                        <div class="legend-cell" style="background: ${COLORS.level3}" title="1-2 hours"></div>
                        <div class="legend-cell" style="background: ${COLORS.level4}" title="2-4 hours"></div>
                        <div class="legend-cell" style="background: ${COLORS.level5}" title="4+ hours"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add click handlers for cells
        container.querySelectorAll('.heatmap-cell[data-date]').forEach(cell => {
            cell.addEventListener('click', () => {
                const date = cell.dataset.date;
                const minutes = parseInt(cell.dataset.minutes);
                showDayDetails(date, minutes);
            });
        });
    }

    /**
     * Get month labels for the heatmap
     */
    function getMonthLabels(dates) {
        const labels = [];
        let lastMonth = -1;
        let weekIndex = 0;

        dates.forEach((date, i) => {
            if (i % 7 === 0) {
                const month = date.getMonth();
                if (month !== lastMonth) {
                    labels.push({
                        month: MONTHS[month],
                        week: weekIndex
                    });
                    lastMonth = month;
                }
                weekIndex++;
            }
        });

        return labels.map(l =>
            `<span style="grid-column: ${l.week + 1}">${l.month}</span>`
        ).join('');
    }

    /**
     * Format minutes to human readable
     */
    function formatMinutes(minutes) {
        if (minutes === 0) return 'No focus time';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    /**
     * Show day details (could be enhanced)
     */
    function showDayDetails(date, minutes) {
        if (typeof UI !== 'undefined') {
            UI.showToast(`${date}: ${formatMinutes(minutes)}`, 'info');
        }
    }

    /**
     * Inject CSS for heatmap
     */
    function injectStyles() {
        if (document.getElementById('heatmap-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'heatmap-styles-css';
        styles.textContent = `
            .heatmap-container {
                padding: var(--space-4);
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                overflow-x: auto;
            }
            
            .heatmap-wrapper {
                display: flex;
                gap: var(--space-2);
            }
            
            .heatmap-day-labels {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                font-size: var(--text-xs);
                color: var(--text-muted);
                padding-right: var(--space-2);
            }
            
            .heatmap-grid {
                display: grid;
                gap: 3px;
            }
            
            .heatmap-week {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            
            .heatmap-cell {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .heatmap-cell:hover {
                transform: scale(1.2);
                outline: 2px solid var(--text-primary);
                outline-offset: 1px;
            }
            
            .heatmap-cell.empty {
                background: transparent !important;
            }
            
            .heatmap-months {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 3px;
                margin-top: var(--space-2);
                margin-left: 30px;
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .heatmap-legend {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                margin-top: var(--space-3);
                justify-content: flex-end;
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .legend-cells {
                display: flex;
                gap: 2px;
            }
            
            .legend-cell {
                width: 12px;
                height: 12px;
                border-radius: 2px;
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
        getColor,
        formatMinutes,
        COLORS
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarHeatmap;
}
