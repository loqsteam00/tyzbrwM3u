const Player = {
    videoElement: null,
    hls: null,

    init: function () {
        this.videoElement = document.getElementById('video-player');
    },

    play: function (url, title) {
        const container = document.getElementById('player-container');
        container.classList.remove('hidden');
        document.getElementById('osd-title').innerText = title || "Livestream";

        if (url.includes('.m3u8')) {
            if (Hls.isSupported()) {
                if (this.hls) this.hls.destroy();
                this.hls = new Hls();
                this.hls.loadSource(url);
                this.hls.attachMedia(this.videoElement);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.videoElement.play();
                });
            } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Native Safari / older Tizen AVPlay fallback
                this.videoElement.src = url;
                this.videoElement.addEventListener('loadedmetadata', () => {
                    this.videoElement.play();
                });
            }
        } else {
            // Direct MP4 or TS
            this.videoElement.src = url;
            this.videoElement.play();
        }
    },

    stop: function () {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        this.videoElement.pause();
        this.videoElement.src = '';
        document.getElementById('player-container').classList.add('hidden');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Player.init();
});
