const Navigation = {
    focusableElements: [],
    currentIndex: 0,

    init: function () {
        this.updateFocusable();
        this.bindKeys();
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    },

    updateFocusable: function () {
        this.focusableElements = Array.from(document.querySelectorAll('.focusable'));
    },

    setFocus: function (index) {
        if (this.focusableElements[this.currentIndex]) {
            this.focusableElements[this.currentIndex].classList.remove('focused');
        }

        this.currentIndex = index;

        if (this.focusableElements[this.currentIndex]) {
            this.focusableElements[this.currentIndex].classList.add('focused');
            this.focusableElements[this.currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    handleKey: function (keyCode) {
        // Tizen KeyCodes
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_LEFT = 37;
        const KEY_RIGHT = 39;
        const KEY_ENTER = 13;
        const KEY_RETURN = 10009; // Tizen specific return key

        let items = this.focusableElements;
        if (items.length === 0) return;

        let current = items[this.currentIndex];

        if (keyCode === KEY_UP) {
            if (this.currentIndex > 0) this.setFocus(this.currentIndex - 1);
        } else if (keyCode === KEY_DOWN) {
            if (this.currentIndex < items.length - 1) this.setFocus(this.currentIndex + 1);
        } else if (keyCode === KEY_ENTER) {
            current.click();
        } else if (keyCode === KEY_RETURN) {
            App.switchView('dashboard');
        }
    },

    bindKeys: function () {
        document.addEventListener('keydown', (e) => {
            this.handleKey(e.keyCode);
        });
    }
};
