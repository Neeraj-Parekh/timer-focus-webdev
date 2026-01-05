/**
 * Focus Timer Pro - Keyboard Shortcuts Module
 * Global keyboard shortcuts with help overlay
 */

const KeyboardShortcuts = (() => {
    // Shortcut definitions
    const SHORTCUTS = {
        'Space': { action: 'playPause', label: 'Play/Pause', description: 'Start or pause the timer' },
        'Escape': { action: 'closeModal', label: 'Close Modal', description: 'Close any open modal' },
        'n': { action: 'newTask', label: 'New Task', description: 'Open new task form', ctrl: true },
        'b': { action: 'brainDump', label: 'Brain Dump', description: 'Quick capture', ctrl: true },
        's': { action: 'toggleSound', label: 'Toggle Sound', description: 'Mute/unmute sounds', ctrl: true },
        '?': { action: 'showHelp', label: 'Help', description: 'Show keyboard shortcuts' },
        '1': { action: 'viewHome', label: 'Home', description: 'Go to timer view', alt: true },
        '2': { action: 'viewTasks', label: 'Tasks', description: 'Go to tasks view', alt: true },
        '3': { action: 'viewMatrix', label: 'Matrix', description: 'Go to Eisenhower Matrix', alt: true },
        '4': { action: 'viewFolders', label: 'Folders', description: 'Go to folders view', alt: true },
        '5': { action: 'viewStats', label: 'Statistics', description: 'Go to statistics', alt: true },
        '6': { action: 'viewSettings', label: 'Settings', description: 'Go to settings', alt: true },
        'ArrowRight': { action: 'skipNext', label: 'Skip Next', description: 'Skip to next task', alt: true },
        'ArrowLeft': { action: 'skipPrev', label: 'Skip Previous', description: 'Go to previous task', alt: true },
        'r': { action: 'resetTimer', label: 'Reset', description: 'Reset current timer', ctrl: true, shift: true }
    };

    let isEnabled = true;
    let onAction = null;

    /**
     * Initialize keyboard shortcuts
     */
    function init(actionHandler) {
        onAction = actionHandler;
        document.addEventListener('keydown', handleKeyDown);
    }

    /**
     * Handle keydown events
     */
    function handleKeyDown(e) {
        if (!isEnabled) return;

        // Don't handle if typing in input
        if (e.target.matches('input, textarea, select')) return;

        const key = e.key === ' ' ? 'Space' : e.key;
        const shortcut = SHORTCUTS[key];

        if (!shortcut) return;

        // Check modifiers
        if (shortcut.ctrl && !e.ctrlKey && !e.metaKey) return;
        if (shortcut.alt && !e.altKey) return;
        if (shortcut.shift && !e.shiftKey) return;

        // If requires modifier but none pressed
        if (!shortcut.ctrl && !shortcut.alt && !shortcut.shift) {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
        }

        e.preventDefault();
        triggerAction(shortcut.action);
    }

    /**
     * Trigger shortcut action
     */
    function triggerAction(action) {
        if (onAction) {
            onAction(action);
        }

        // Emit custom event
        document.dispatchEvent(new CustomEvent('shortcut', {
            detail: { action }
        }));
    }

    /**
     * Show help overlay
     */
    function showHelp() {
        // Remove existing if any
        const existing = document.getElementById('shortcuts-help');
        if (existing) {
            existing.remove();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'shortcuts-help';
        overlay.className = 'shortcuts-overlay';
        overlay.innerHTML = `
            <div class="shortcuts-modal">
                <div class="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="shortcuts-close">×</button>
                </div>
                <div class="shortcuts-content">
                    <div class="shortcuts-section">
                        <h3>Timer Controls</h3>
                        ${renderShortcutGroup(['Space', 'ArrowRight', 'ArrowLeft', 'r'])}
                    </div>
                    <div class="shortcuts-section">
                        <h3>Navigation</h3>
                        ${renderShortcutGroup(['1', '2', '3', '4', '5', '6'])}
                    </div>
                    <div class="shortcuts-section">
                        <h3>Actions</h3>
                        ${renderShortcutGroup(['n', 'b', 's', 'Escape', '?'])}
                    </div>
                </div>
                <div class="shortcuts-footer">
                    <span>Press <kbd>?</kbd> to toggle this help</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close handlers
        overlay.querySelector('.shortcuts-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    /**
     * Render shortcut group
     */
    function renderShortcutGroup(keys) {
        return keys.map(key => {
            const shortcut = SHORTCUTS[key];
            if (!shortcut) return '';

            return `
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        ${shortcut.ctrl ? '<kbd>Ctrl</kbd> + ' : ''}
                        ${shortcut.alt ? '<kbd>Alt</kbd> + ' : ''}
                        ${shortcut.shift ? '<kbd>Shift</kbd> + ' : ''}
                        <kbd>${formatKey(key)}</kbd>
                    </div>
                    <div class="shortcut-desc">${shortcut.description}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Format key for display
     */
    function formatKey(key) {
        const keyMap = {
            'Space': '␣',
            'ArrowRight': '→',
            'ArrowLeft': '←',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'Escape': 'Esc'
        };
        return keyMap[key] || key.toUpperCase();
    }

    /**
     * Enable/disable shortcuts
     */
    function setEnabled(enabled) {
        isEnabled = enabled;
    }

    /**
     * Get all shortcuts
     */
    function getAll() {
        return { ...SHORTCUTS };
    }

    /**
     * Inject CSS
     */
    function injectStyles() {
        if (document.getElementById('shortcuts-styles-css')) return;

        const styles = document.createElement('style');
        styles.id = 'shortcuts-styles-css';
        styles.textContent = `
            .shortcuts-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease;
            }
            
            .shortcuts-modal {
                background: var(--bg-secondary);
                border-radius: var(--radius-xl);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            
            .shortcuts-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-4);
                border-bottom: 1px solid var(--border-color);
            }
            
            .shortcuts-header h2 {
                font-size: var(--text-lg);
                font-weight: var(--font-semibold);
            }
            
            .shortcuts-close {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: var(--text-muted);
                background: none;
                border: none;
                cursor: pointer;
                border-radius: var(--radius-full);
            }
            
            .shortcuts-close:hover {
                background: var(--bg-tertiary);
            }
            
            .shortcuts-content {
                padding: var(--space-4);
                display: grid;
                gap: var(--space-4);
            }
            
            .shortcuts-section h3 {
                font-size: var(--text-sm);
                font-weight: var(--font-semibold);
                color: var(--accent-primary);
                margin-bottom: var(--space-2);
            }
            
            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-2) 0;
                border-bottom: 1px solid var(--bg-tertiary);
            }
            
            .shortcut-item:last-child {
                border-bottom: none;
            }
            
            .shortcut-keys {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .shortcut-keys kbd {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                padding: 0 var(--space-2);
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                font-family: var(--font-mono);
                font-size: var(--text-xs);
            }
            
            .shortcut-desc {
                font-size: var(--text-sm);
                color: var(--text-muted);
            }
            
            .shortcuts-footer {
                padding: var(--space-3) var(--space-4);
                border-top: 1px solid var(--border-color);
                text-align: center;
                font-size: var(--text-xs);
                color: var(--text-muted);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
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
        init,
        showHelp,
        setEnabled,
        getAll,
        triggerAction
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcuts;
}
