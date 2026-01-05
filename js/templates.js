/**
 * Focus Timer Pro - Rotation Templates Module
 * Save, load, and manage task rotation patterns
 */

const RotationTemplates = (() => {
    const STORAGE_KEY = 'rotation_templates';

    // Default templates
    const DEFAULT_TEMPLATES = [
        {
            id: 'deep-work',
            name: 'Deep Work',
            icon: '🎯',
            description: '50 min focus, 10 min break',
            pattern: [
                { type: 'work', duration: 50 },
                { type: 'break', duration: 10 }
            ],
            loops: 4
        },
        {
            id: 'pomodoro',
            name: 'Classic Pomodoro',
            icon: '🍅',
            description: '25/5 with long break every 4',
            pattern: [
                { type: 'work', duration: 25 },
                { type: 'break', duration: 5 },
                { type: 'work', duration: 25 },
                { type: 'break', duration: 5 },
                { type: 'work', duration: 25 },
                { type: 'break', duration: 5 },
                { type: 'work', duration: 25 },
                { type: 'longBreak', duration: 15 }
            ],
            loops: 1
        },
        {
            id: 'sprint',
            name: 'Sprint Session',
            icon: '⚡',
            description: '15 min intense bursts',
            pattern: [
                { type: 'work', duration: 15 },
                { type: 'break', duration: 3 }
            ],
            loops: 6
        },
        {
            id: 'study',
            name: 'Study Session',
            icon: '📚',
            description: '45 min study, 15 min review',
            pattern: [
                { type: 'work', duration: 45, label: 'Study' },
                { type: 'break', duration: 5, label: 'Quick Break' },
                { type: 'work', duration: 15, label: 'Review' },
                { type: 'break', duration: 10 }
            ],
            loops: 3
        },
        {
            id: 'creative',
            name: 'Creative Flow',
            icon: '🎨',
            description: 'Variable timing for creativity',
            pattern: [
                { type: 'work', duration: 30, label: 'Explore' },
                { type: 'break', duration: 5 },
                { type: 'work', duration: 45, label: 'Create' },
                { type: 'break', duration: 10 },
                { type: 'work', duration: 20, label: 'Refine' }
            ],
            loops: 2
        }
    ];

    let templates = [];

    /**
     * Initialize templates
     */
    function init() {
        loadTemplates();
        return templates;
    }

    /**
     * Load templates from storage
     */
    function loadTemplates() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const custom = saved ? JSON.parse(saved) : [];
            templates = [...DEFAULT_TEMPLATES, ...custom];
        } catch (e) {
            templates = [...DEFAULT_TEMPLATES];
        }
    }

    /**
     * Save templates to storage
     */
    function saveTemplates() {
        try {
            const custom = templates.filter(t => !DEFAULT_TEMPLATES.find(d => d.id === t.id));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
        } catch (e) {
            console.warn('Failed to save templates:', e);
        }
    }

    /**
     * Get all templates
     */
    function getAll() {
        return templates;
    }

    /**
     * Get template by ID
     */
    function getById(id) {
        return templates.find(t => t.id === id);
    }

    /**
     * Create new template
     */
    function create(template) {
        const newTemplate = {
            id: `custom_${Date.now()}`,
            icon: '📋',
            ...template,
            createdAt: Date.now()
        };
        templates.push(newTemplate);
        saveTemplates();
        return newTemplate;
    }

    /**
     * Update template
     */
    function update(id, updates) {
        const index = templates.findIndex(t => t.id === id);
        if (index === -1) return null;

        // Don't update default templates
        if (DEFAULT_TEMPLATES.find(d => d.id === id)) {
            return null;
        }

        templates[index] = { ...templates[index], ...updates };
        saveTemplates();
        return templates[index];
    }

    /**
     * Delete template
     */
    function remove(id) {
        // Don't delete default templates
        if (DEFAULT_TEMPLATES.find(d => d.id === id)) {
            return false;
        }

        const index = templates.findIndex(t => t.id === id);
        if (index === -1) return false;

        templates.splice(index, 1);
        saveTemplates();
        return true;
    }

    /**
     * Apply template to timer
     */
    function apply(templateId, tasks = []) {
        const template = getById(templateId);
        if (!template) return null;

        const queue = [];

        for (let loop = 0; loop < template.loops; loop++) {
            template.pattern.forEach((phase, index) => {
                if (phase.type === 'work') {
                    // Use next task from queue or create placeholder
                    const task = tasks[queue.filter(q => q.type === 'work').length % (tasks.length || 1)] || {
                        name: phase.label || `Work ${index + 1}`,
                        duration: phase.duration
                    };
                    queue.push({
                        ...task,
                        type: 'work',
                        duration: phase.duration,
                        templatePhase: index
                    });
                } else {
                    queue.push({
                        name: phase.label || (phase.type === 'longBreak' ? 'Long Break' : 'Break'),
                        type: phase.type,
                        duration: phase.duration,
                        isBreak: true,
                        templatePhase: index
                    });
                }
            });
        }

        return queue;
    }

    /**
     * Preview template sequence
     */
    function preview(templateId) {
        const template = getById(templateId);
        if (!template) return null;

        const totalMinutes = template.pattern.reduce((sum, p) => sum + p.duration, 0) * template.loops;
        const workMinutes = template.pattern
            .filter(p => p.type === 'work')
            .reduce((sum, p) => sum + p.duration, 0) * template.loops;
        const breakMinutes = totalMinutes - workMinutes;

        return {
            template,
            totalTime: formatDuration(totalMinutes * 60),
            workTime: formatDuration(workMinutes * 60),
            breakTime: formatDuration(breakMinutes * 60),
            phases: template.pattern.length,
            loops: template.loops,
            sequence: template.pattern.map(p => ({
                type: p.type,
                duration: p.duration,
                label: p.label || (p.type === 'work' ? 'Work' : 'Break')
            }))
        };
    }

    /**
     * Format duration helper
     */
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    }

    /**
     * Render template selector
     */
    function renderSelector(containerId, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="template-grid">
                ${templates.map(t => `
                    <div class="template-card" data-template-id="${t.id}">
                        <div class="template-icon">${t.icon}</div>
                        <div class="template-info">
                            <h4>${t.name}</h4>
                            <p>${t.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.templateId;
                if (onSelect) onSelect(getById(id));
            });
        });
    }

    /**
     * Inject styles
     */
    function injectStyles() {
        if (document.getElementById('rotation-templates-css')) return;

        const styles = document.createElement('style');
        styles.id = 'rotation-templates-css';
        styles.textContent = `
            .template-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: var(--space-3);
            }
            
            .template-card {
                display: flex;
                gap: var(--space-3);
                padding: var(--space-4);
                background: var(--bg-secondary);
                border: 2px solid transparent;
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .template-card:hover {
                background: var(--bg-tertiary);
                border-color: var(--accent-primary);
            }
            
            .template-icon {
                font-size: var(--text-2xl);
            }
            
            .template-info h4 {
                font-size: var(--text-sm);
                font-weight: var(--font-semibold);
                margin-bottom: var(--space-1);
            }
            
            .template-info p {
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            .template-preview {
                padding: var(--space-4);
                background: var(--bg-tertiary);
                border-radius: var(--radius-lg);
            }
            
            .preview-header {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                margin-bottom: var(--space-4);
            }
            
            .preview-stats {
                display: flex;
                gap: var(--space-4);
                margin-bottom: var(--space-4);
            }
            
            .preview-sequence {
                display: flex;
                gap: var(--space-2);
                flex-wrap: wrap;
            }
            
            .sequence-phase {
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-sm);
                font-size: var(--text-xs);
            }
            
            .sequence-phase.work {
                background: var(--accent-primary);
                color: white;
            }
            
            .sequence-phase.break {
                background: var(--accent-success);
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            injectStyles();
        });
    } else {
        init();
        injectStyles();
    }

    return {
        init,
        getAll,
        getById,
        create,
        update,
        remove,
        apply,
        preview,
        renderSelector,
        DEFAULT_TEMPLATES
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RotationTemplates;
}
