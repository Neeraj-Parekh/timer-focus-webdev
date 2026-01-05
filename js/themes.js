/**
 * Focus Timer Pro - Themes Module
 * Custom color themes and color palette customization
 */

const Themes = (() => {
    // Built-in themes
    const THEMES = {
        dark: {
            name: 'Bundled Dark (Default)',
            colors: {
                // Neutral Dark Grey surfaces
                'bg-primary': '#121212',
                'bg-secondary': '#1E1E1E',
                'bg-tertiary': '#2C2C2C',
                'text-primary': '#FFFFFF',
                'text-secondary': '#B0B0B0',
                'text-muted': '#757575',
                // Vibrant Accents from Style Guide
                'accent-primary': '#2196F3',  // Blue
                'accent-secondary': '#E91E63', // Pink
                'accent-success': '#4CAF50',  // Green
                'accent-warning': '#FF9800',  // Orange
                'accent-error': '#F44336',    // Red
                'accent-info': '#00BCD4',     // Cyan
                'border-color': '#2C2C2C'
            }
        },
        oled: {
            name: 'OLED (True Black)',
            colors: {
                'bg-primary': '#000000',
                'bg-secondary': '#000000', // Pure black for cards too
                'bg-tertiary': '#121212', // Slightly lighter for inputs/hover
                'text-primary': '#FFFFFF',
                'text-secondary': '#B0B0B0',
                'text-muted': '#616161',
                'accent-primary': '#2196F3',
                'accent-secondary': '#E91E63',
                'accent-success': '#4CAF50',
                'accent-warning': '#FF9800',
                'accent-error': '#F44336',
                'accent-info': '#00BCD4',
                'border-color': '#1E1E1E' // Subtle borders for OLED separation
            }
        },
        midnight: {
            name: 'Midnight',
            colors: {
                'bg-primary': '#0a0a0f',
                'bg-secondary': '#141420',
                'bg-tertiary': '#1f1f2e',
                'text-primary': '#e8e8ed',
                'text-secondary': '#a8a8b3',
                'text-muted': '#5c5c6e',
                'accent-primary': '#6366f1',
                'accent-secondary': '#a855f7',
                'accent-success': '#22c55e',
                'accent-warning': '#eab308',
                'accent-error': '#ef4444',
                'border-color': '#2a2a3d'
            }
        },
        forest: {
            name: 'Forest',
            colors: {
                'bg-primary': '#0c1810',
                'bg-secondary': '#152518',
                'bg-tertiary': '#1e3522',
                'text-primary': '#e5efe8',
                'text-secondary': '#a8c5b0',
                'text-muted': '#5a7860',
                'accent-primary': '#22c55e',
                'accent-secondary': '#14b8a6',
                'accent-success': '#84cc16',
                'accent-warning': '#eab308',
                'accent-error': '#ef4444',
                'border-color': '#2a4530'
            }
        },
        ocean: {
            name: 'Ocean',
            colors: {
                'bg-primary': '#0c1929',
                'bg-secondary': '#132337',
                'bg-tertiary': '#1a3048',
                'text-primary': '#e5f0fa',
                'text-secondary': '#a8c5e0',
                'text-muted': '#5a7890',
                'accent-primary': '#0ea5e9',
                'accent-secondary': '#06b6d4',
                'accent-success': '#10b981',
                'accent-warning': '#f59e0b',
                'accent-error': '#ef4444',
                'border-color': '#1e4060'
            }
        },
        sunset: {
            name: 'Sunset',
            colors: {
                'bg-primary': '#1c1412',
                'bg-secondary': '#2a1f1c',
                'bg-tertiary': '#3a2b26',
                'text-primary': '#faf5f3',
                'text-secondary': '#e0c5b8',
                'text-muted': '#8a6b5a',
                'accent-primary': '#f97316',
                'accent-secondary': '#ef4444',
                'accent-success': '#22c55e',
                'accent-warning': '#eab308',
                'accent-error': '#dc2626',
                'border-color': '#4a3b35'
            }
        },
        sakura: {
            name: 'Sakura',
            colors: {
                'bg-primary': '#1a1218',
                'bg-secondary': '#251c22',
                'bg-tertiary': '#32262e',
                'text-primary': '#faf0f5',
                'text-secondary': '#e0c0d0',
                'text-muted': '#8a6078',
                'accent-primary': '#ec4899',
                'accent-secondary': '#d946ef',
                'accent-success': '#34d399',
                'accent-warning': '#fbbf24',
                'accent-error': '#f87171',
                'border-color': '#4a3542'
            }
        },
        light: {
            name: 'Light',
            colors: {
                'bg-primary': '#ffffff',
                'bg-secondary': '#f8fafc',
                'bg-tertiary': '#f1f5f9',
                'text-primary': '#0f172a',
                'text-secondary': '#334155',
                'text-muted': '#64748b',
                'accent-primary': '#2563eb',
                'accent-secondary': '#7c3aed',
                'accent-success': '#059669',
                'accent-warning': '#d97706',
                'accent-error': '#dc2626',
                'border-color': '#e2e8f0'
            }
        },
        neobrutalism: {
            name: 'Neo-Brutalism',
            colors: {
                'bg-primary': '#ffffff',
                'bg-secondary': '#ffffff', // Cards are white
                'bg-tertiary': '#e0e0e0',  // Inputs are light grey
                'text-primary': '#000000',
                'text-secondary': '#000000',
                'text-muted': '#333333',
                'accent-primary': '#ff3366', // Hot pink default
                'accent-secondary': '#ffcc00', // Yellow
                'accent-success': '#00cc66',
                'accent-warning': '#ff9900',
                'accent-error': '#ff0000',
                'border-color': '#000000' // Thick black borders
            }
        }
    };

    let currentTheme = 'dark';
    let currentAccent = null;

    // Preset accent colors
    const ACCENTS = {
        '#2196F3': 'Blue',
        '#E91E63': 'Pink',
        '#4CAF50': 'Green',
        '#00BCD4': 'Cyan',
        '#FF9800': 'Orange',
        '#F44336': 'Red',
        '#673AB7': 'Purple',
        '#10B981': 'Emerald'
    };

    /**
     * Apply a theme
     */
    function apply(themeName) {
        const theme = THEMES[themeName];
        if (!theme) return false;

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // Set body class for structural overrides (e.g. Neo-Brutalism borders)
        document.body.className = document.body.className.replace(/theme-[\w-]+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        // Re-apply accent if one is selected
        if (currentAccent) {
            applyAccent(currentAccent);
        }

        currentTheme = themeName;
        saveTheme(themeName);
        return true;
    }

    /**
     * Apply a custom accent color
     */
    function applyAccent(color) {
        if (!color) return;
        const root = document.documentElement;
        root.style.setProperty('--accent-primary', color);
        // We can allow users to customize this, but for now we'll stick to primary

        currentAccent = color;
        try {
            localStorage.setItem('app_accent', color);
        } catch (e) {
            console.warn('Failed to save accent:', e);
        }
    }

    /**
     * Get current theme and accent
     */
    function getCurrent() {
        return { theme: currentTheme, accent: currentAccent };
    }

    /**
     * Get all available themes
     */
    function getAll() {
        return Object.entries(THEMES).map(([key, theme]) => ({
            id: key,
            name: theme.name
        }));
    }

    /**
     * Save theme preference
     */
    function saveTheme(themeName) {
        try {
            localStorage.setItem('app_theme', themeName);
        } catch (e) {
            console.warn('Failed to save theme:', e);
        }
    }

    /**
     * Load saved theme and accent
     */
    function loadTheme() {
        try {
            const savedTheme = localStorage.getItem('app_theme');
            const savedAccent = localStorage.getItem('app_accent');

            if (savedTheme && THEMES[savedTheme]) {
                apply(savedTheme);
            }
            if (savedAccent) {
                applyAccent(savedAccent);
            }
        } catch (e) {
            console.warn('Failed to load theme:', e);
        }
    }

    /**
     * Create custom theme
     */
    function createCustom(name, colors) {
        const customKey = `custom_${Date.now()}`;
        THEMES[customKey] = {
            name: name,
            colors: { ...THEMES.dark.colors, ...colors }
        };
        return customKey;
    }

    /**
     * Render theme selector
     */
    function renderSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="theme-selector-group">
                <h4>Theme</h4>
                <div class="theme-selector">
                    ${getAll().map(theme => `
                        <button class="theme-option ${theme.id === currentTheme ? 'active' : ''}" 
                                data-theme="${theme.id}">
                            <div class="theme-preview" style="
                                background: ${THEMES[theme.id].colors['bg-primary']};
                                border: 2px solid ${THEMES[theme.id].colors['accent-primary']};
                            ">
                                <div class="theme-accent" style="
                                    background: ${THEMES[theme.id].colors['accent-primary']};
                                "></div>
                            </div>
                            <span>${theme.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="theme-selector-group" style="margin-top: 24px;">
                <h4>Accent Color</h4>
                <div class="flex gap-2 flex-wrap accent-selector">
                    ${Object.entries(ACCENTS).map(([color, name]) => `
                         <button class="color-option ${color === currentAccent ? 'active' : ''}" 
                                 data-color="${color}" 
                                 style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--bg-tertiary);"
                                 title="${name}">
                         </button>
                    `).join('')}
                    <!-- Custom Color Input -->
                    <div class="relative">
                        <input type="color" id="custom-accent-picker" 
                               value="${currentAccent || '#2196F3'}"
                               style="width: 32px; height: 32px; padding: 0; border: none; border-radius: 50%; overflow: hidden; cursor: pointer;">
                    </div>
                </div>
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                apply(btn.dataset.theme);
                renderSelector(containerId);
            });
        });

        // Accent Click Handlers
        container.querySelectorAll('.accent-selector .color-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                applyAccent(color);
                renderSelector(containerId);
            });
        });

        // Custom Pixel Picker
        const picker = document.getElementById('custom-accent-picker');
        if (picker) {
            picker.addEventListener('input', (e) => {
                const color = e.target.value;
                applyAccent(color);
                container.querySelectorAll('.accent-selector .color-option').forEach(b => b.classList.remove('active'));
            });

            picker.addEventListener('change', (e) => {
                renderSelector(containerId);
            });
        }
    }

    /**
     * Inject CSS
     */
    function injectStyles() {
        if (document.getElementById('themes-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'themes-styles-css';
        styles.textContent = `
            .theme-selector {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: var(--space-3);
            }
            
            .theme-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-3);
                background: var(--bg-tertiary);
                border: 2px solid transparent;
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .theme-option:hover {
                border-color: var(--text-muted);
            }
            
            .theme-option.active {
                border-color: var(--accent-primary);
            }
            
            .theme-preview {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-md);
                position: relative;
                overflow: hidden;
            }
            
            .theme-accent {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 8px;
            }
            
            .theme-option span {
                font-size: var(--text-xs);
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(styles);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            loadTheme();
        });
    } else {
        injectStyles();
        loadTheme();
    }

    return {
        apply,
        getCurrent,
        getAll,
        createCustom,
        renderSelector,
        THEMES
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Themes;
}
