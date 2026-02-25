const App = {
    settings: { playlists: [] },
    currentPlaylist: null,
    parsedData: [],
    groups: {},

    init: async function () {
        console.log("App Initialized");
        this.bindMenu();
        await this.loadSettings();

        if (this.settings.playlists.length > 0) {
            this.loadPlaylist(this.settings.playlists[0]);
        } else {
            this.switchView('settings');
            this.renderSettings();
        }
    },

    loadSettings: async function () {
        this.settings = await API.getSettings();
        if (!this.settings.playlists) this.settings.playlists = [];
    },

    loadPlaylist: async function (playlist) {
        this.currentPlaylist = playlist;
        if (playlist.type === 'm3u') {
            const data = await API.fetchM3U(playlist.url);
            if (data) {
                this.parsedData = Parser.parseM3U(data);
                this.groups = Parser.groupItems(this.parsedData);
                this.switchView('live');
            }
        }
    },

    bindMenu: function () {
        document.querySelectorAll('#main-menu .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action) this.switchView(action);
            });
        });
    },

    switchView: function (viewId) {
        document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));

        const viewMap = {
            'live': 'view-list',
            'movies': 'view-list',
            'series': 'view-list',
            'favorites': 'view-list',
            'settings': 'view-settings'
        };

        const targetId = viewMap[viewId] || 'view-dashboard';
        const targetView = document.getElementById(targetId);

        if (targetView) {
            targetView.classList.add('active');
            if (targetId === 'view-list') {
                document.getElementById('list-title').innerText = viewId.charAt(0).toUpperCase() + viewId.slice(1);
                if (viewId === 'favorites') {
                    this.renderItems(this.settings.favorites || [], 'Favorites');
                } else {
                    this.renderGroups(viewId);
                }
            } else if (targetId === 'view-settings') {
                this.renderSettings();
            }
        }
    },

    renderGroups: function (type) {
        const grid = document.getElementById('item-grid');
        grid.innerHTML = '';

        Object.keys(this.groups).forEach(groupName => {
            const div = document.createElement('div');
            div.className = 'grid-item focusable';
            div.innerHTML = `<h3>${groupName}</h3>`;
            div.onclick = () => this.renderItems(this.groups[groupName], groupName);
            grid.appendChild(div);
        });

        Navigation.updateFocusable();
        const focusItems = Navigation.focusableElements.filter(e => e.classList.contains('grid-item'));
        if (focusItems.length > 0) {
            Navigation.setFocus(Navigation.focusableElements.indexOf(focusItems[0]));
        }
    },

    renderItems: function (items, groupName) {
        const grid = document.getElementById('item-grid');
        grid.innerHTML = '';
        document.getElementById('list-title').innerText = groupName;

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'grid-item focusable';

            const isFav = this.settings.favorites && this.settings.favorites.find(f => f.url === item.url);

            div.innerHTML = `
                ${item.logo ? `<img src="${item.logo}" onerror="this.style.display='none'">` : ''}
                <h5>${item.title}</h5>
                <button class="focusable btn-fav" style="margin-top: 10px">${isFav ? 'Remove Fav' : 'Add Fav'}</button>
            `;

            div.onclick = () => Player.play(item.url, item.title);
            div.querySelector('.btn-fav').onclick = (e) => {
                e.stopPropagation();
                this.toggleFavorite(item);
                // re-render to update text
                div.querySelector('.btn-fav').innerText = (this.settings.favorites.find(f => f.url === item.url)) ? 'Remove Fav' : 'Add Fav';
            };

            grid.appendChild(div);
        });

        Navigation.updateFocusable();
        const focusItems = Navigation.focusableElements.filter(e => e.classList.contains('grid-item'));
        if (focusItems.length > 0) {
            Navigation.setFocus(Navigation.focusableElements.indexOf(focusItems[0]));
        }
    },

    renderSettings: function () {
        const container = document.getElementById('playlists-container');
        container.innerHTML = '<h3>Your Playlists</h3>';

        this.settings.playlists.forEach((pl, idx) => {
            const div = document.createElement('div');
            div.innerHTML = `<span>${pl.name || 'Playlist ' + (idx + 1)}</span> - <button class="focusable" onclick="App.deletePlaylist(${idx})">Delete</button>`;
            container.appendChild(div);
        });

        const addBtn = document.getElementById('btn-add-playlist');
        addBtn.onclick = () => {
            const url = prompt("Enter M3U URL (on Tizen an onscreen keyboard would appear here, ideally we'd implement our own virtual keyboard but prompt works on Tizen)");
            if (url) {
                this.settings.playlists.push({ type: 'm3u', url: url, name: 'New M3U Playlist' });
                API.saveSettings(this.settings);
                this.renderSettings();
                this.loadPlaylist(this.settings.playlists[this.settings.playlists.length - 1]);
            }
        };
        Navigation.updateFocusable();
    },

    deletePlaylist: function (idx) {
        this.settings.playlists.splice(idx, 1);
        API.saveSettings(this.settings);
        this.renderSettings();
        if (this.settings.playlists.length === 0) {
            this.groups = {};
            this.parsedData = [];
        }
    },

    toggleFavorite: function (item) {
        if (!this.settings.favorites) {
            this.settings.favorites = [];
        }
        const idx = this.settings.favorites.findIndex(f => f.url === item.url);
        if (idx !== -1) {
            this.settings.favorites.splice(idx, 1);
        } else {
            this.settings.favorites.push(item);
        }
        API.saveSettings(this.settings);

        if (document.getElementById('list-title').innerText === 'Favorites') {
            this.renderItems(this.settings.favorites, 'Favorites');
        }
    }
};

window.onload = () => {
    App.init();
    Navigation.init();
};
