import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pg from 'pg'; 
import multer from 'multer'; 
import path from 'path';

const { Client } = pg;



const app = express();
const client = new Client({
   connectionString: process.env.DB_URL,
   ssl: {
       rejectUnauthorized: false 
   }
});

client.connect()
    .then(async () => {
        console.log('Connected to PostgreSQL');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS images (
                id SERIAL PRIMARY KEY,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        try {
            await client.query(createTableQuery);
            console.log("Database table is ready.");
        } catch (err) {
            console.error("Error creating table:", err);
        }
    })
    .catch(err => console.error('Connection error:', err.stack));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// http://localhost:3000/image/300/500?token=123123
app.get('/image/:width/:height', (req, res) => {
  res.json({
    params: req.params,
    query: req.query,
  })
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));