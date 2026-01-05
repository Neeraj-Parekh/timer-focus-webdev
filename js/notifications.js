/**
 * Focus Timer Pro - Notifications Module
 * Browser notifications and alerts
 */

const Notifications = (() => {
    let permission = 'default';

    /**
     * Initialize and request permission
     */
    async function init() {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return false;
        }

        permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        return permission === 'granted';
    }

    /**
     * Check if notifications are enabled
     */
    function isEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * Request permission explicitly
     */
    async function requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /**
     * Show a notification
     */
    function show(title, options = {}) {
        if (!isEnabled()) {
            console.warn('Notifications not enabled');
            return null;
        }

        const defaultOptions = {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200],
            tag: 'focus-timer',
            requireInteraction: false,
            silent: false
        };

        const notification = new Notification(title, {
            ...defaultOptions,
            ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        return notification;
    }

    /**
     * Show task completion notification
     */
    function showTaskComplete(task) {
        return show('Task Complete! 🎉', {
            body: `Great job finishing "${task.name}"!`,
            tag: 'task-complete',
            requireInteraction: true,
            actions: [
                { action: 'next', title: 'Start Next' },
                { action: 'break', title: 'Take Break' }
            ]
        });
    }

    /**
     * Show break reminder
     */
    function showBreakReminder() {
        return show('Time for a Break! ☕', {
            body: 'You\'ve been focused for a while. Take 5 minutes to stretch.',
            tag: 'break-reminder'
        });
    }

    /**
     * Show timer notification
     */
    function showTimerNotification(remaining, task) {
        if (remaining <= 60 && remaining > 0) {
            return show('1 Minute Left! ⏱️', {
                body: `Almost done with "${task.name}"`,
                tag: 'timer-warning',
                silent: true
            });
        }
        return null;
    }

    /**
     * Show streak notification
     */
    function showStreakNotification(days) {
        return show(`${days} Day Streak! 🔥`, {
            body: `You've been consistent for ${days} days. Keep it up!`,
            tag: 'streak'
        });
    }

    /**
     * Close all notifications with a specific tag
     */
    function closeByTag(tag) {
        // Note: Can't programmatically close notifications in all browsers
        // This is a placeholder for service worker-based closing
    }

    return {
        init,
        isEnabled,
        requestPermission,
        show,
        showTaskComplete,
        showBreakReminder,
        showTimerNotification,
        showStreakNotification,
        closeByTag
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Notifications;
}
