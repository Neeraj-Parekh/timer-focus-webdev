/**
 * Focus Timer Pro - TickTick Integration
 * Sync tasks from TickTick
 */

const TickTick = (() => {

    function init() {
        const btn = document.getElementById('btn-sync-ticktick');
        const input = document.getElementById('setting-ticktick-token');

        if (input) {
            input.value = localStorage.getItem('ticktick_token') || '';
            input.addEventListener('change', (e) => {
                localStorage.setItem('ticktick_token', e.target.value);
            });
        }

        if (btn) {
            btn.addEventListener('click', sync);
        }
    }

    async function sync() {
        const token = localStorage.getItem('ticktick_token');
        if (!token) {
            UI.showToast('Please enter a TickTick ICS URL or Token', 'error');
            return;
        }

        UI.showToast('Syncing with TickTick...', 'info');

        // Simulating Sync since we can't easily do CORS requests to TickTick from client-side without a proxy
        // If this were a real backend app, we'd fetch(token)

        console.log('Syncing using token:', token);

        setTimeout(() => {
            // Mock result
            UI.showToast('TickTick Sync successful (Simulation)', 'success');
            // Here we would parse ICS/JSON and call Tasks.create()
        }, 1500);
    }

    return {
        init,
        sync
    };
})();
