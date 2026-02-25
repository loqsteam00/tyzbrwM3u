const Parser = {
    parseM3U: function (m3uData) {
        const lines = m3uData.split('\n');
        const items = [];
        let currentItem = {};

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                currentItem = {};

                const logoMatch = line.match(/tvg-logo="(.*?)"/);
                currentItem.logo = logoMatch ? logoMatch[1] : '';

                const groupMatch = line.match(/group-title="(.*?)"/);
                currentItem.group = groupMatch ? groupMatch[1] : 'Uncategorized';

                const parts = line.split(',');
                currentItem.title = parts[parts.length - 1].trim();

            } else if (line !== '' && !line.startsWith('#')) {
                currentItem.url = line;
                items.push(currentItem);
                currentItem = {};
            }
        }
        return items;
    },

    groupItems: function (items) {
        const groups = {};
        for (const item of items) {
            if (!groups[item.group]) {
                groups[item.group] = [];
            }
            groups[item.group].push(item);
        }
        return groups;
    }
};
