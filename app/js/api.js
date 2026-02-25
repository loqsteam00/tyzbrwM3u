const API = {
    baseUrl: `http://${window.location.hostname}:3567`,

    fetchM3U: async function (url) {
        try {
            const resp = await fetch(`${this.baseUrl}/proxy/m3u?url=${encodeURIComponent(url)}`);
            if (!resp.ok) throw new Error("Network response was not ok");
            return await resp.text();
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    getSettings: async function () {
        try {
            const resp = await fetch(`${this.baseUrl}/settings`);
            if (!resp.ok) return {};
            return await resp.json();
        } catch (e) {
            console.error(e);
            return {};
        }
    },

    saveSettings: async function (settings) {
        await fetch(`${this.baseUrl}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
    }
};
