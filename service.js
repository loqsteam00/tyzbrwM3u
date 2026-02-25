const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3567; // TizenBrew app will hit window.location.hostname on this port
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

app.get('/proxy/m3u', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).send('URL required');

        const response = await axios.get(url, { responseType: 'text' });
        res.send(response.data);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

app.get('/settings', (req, res) => {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({ playlists: [] });
        }
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

app.post('/settings', (req, res) => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
        res.send({ success: true });
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`TyzBrew IPTV NodeJS Service running on port ${PORT}`);
});
