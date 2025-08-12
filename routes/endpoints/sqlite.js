const sqlite3 = require('sqlite3').verbose();
const express = require("express");
let router = express.Router();

// Open or create the database
const db = new sqlite3.Database('./tokens.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create tokens table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS tokens (
    user_id TEXT PRIMARY KEY,
    refresh_token TEXT NOT NULL,
    expires_at TEXT
)`);
db.run(`CREATE TABLE IF NOT EXISTS pushpin_details (
    new_guid TEXT PRIMARY KEY,
    details TEXT NOT NULL,
    user_id TEXT,
    date_created TEXT
)`);




router.post('/api/sqlite/pushpin', (req, res) => {
    const currentTime = new Date();
    const {user_id, details, new_guid} = req.body;
  //  console.log(user_id, details)
    db.run(
        `INSERT INTO pushpin_details (user_id, details, new_guid, date_created) 
         VALUES (?, ?, ?, ?) 
         ON CONFLICT(new_guid) DO UPDATE SET details = excluded.details`,
        [user_id, details, new_guid, currentTime],
        (err) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: "Error saving pushpin_details", details: err.message });
            }
            res.json({ message: "pushpin saved successfully" });
        }
    );
});

router.get('/api/sqlite/pushpin/:new_guid', async (req, res) => {
    const { new_guid } = req.params;

    db.get(`SELECT details, user_id, new_guid FROM pushpin_details WHERE new_guid = ?`, [new_guid], (err, row) => {
        if (err) {
            return res.json({ error: "Error retrieving token", details: err.message });
        }
        if (!row) {
             return res.json({ error: "details not found" });
        }
        res.json({ details: row.details, user_id: row.user_id, new_guid: row.new_guid });
    });
});


router.post('/api/sqlite/token', (req, res) => {
    const {user_id, refresh_token, expires_at} = req.body;
    
    db.run(
        `INSERT INTO tokens (user_id, refresh_token, expires_at) 
         VALUES (?, ?, ?) 
         ON CONFLICT(user_id) DO UPDATE SET refresh_token = excluded.refresh_token, expires_at = excluded.expires_at`,
        [user_id, refresh_token, expires_at],
        (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving token", details: err.message });
            }
            res.json({ message: "Token saved successfully" });
        }
    );


});

router.get('/api/sqlite/token/:user_id', async (req, res) => {
    const { user_id } = req.params;

    db.get(`SELECT refresh_token, expires_at FROM tokens WHERE user_id = ?`, [user_id], (err, row) => {
        if (err) {
            return res.json({ error: "Error retrieving token", details: err.message });
        }
        if (!row) {
             return res.json({ error: "Token not found" });
        }
        res.json({ refresh_token: row.refresh_token, expires_at: row.expires_at });
    });
});



module.exports = router;