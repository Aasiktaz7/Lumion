import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2'; 

const app = express();
const port = 4000; 


app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'localhost', 
    user: '',       
    password: '', 
    database: '', 
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    } else {
        console.log('Connected to MySQL');
    }
});


const languageDefaults = {
    c: { language: 'c', versionIndex: 0 },
    cpp: { language: 'cpp17', versionIndex: 0 },
    java: { language: 'java', versionIndex: 4 }, 
    python: { language: 'python3', versionIndex: 3 },
    php: { language: 'php', versionIndex: 0 },
    csharp: { language: 'csharp', versionIndex: 0 }, 
    mysql: { language: 'mysql', versionIndex: 0 }, 
    ruby: { language: 'ruby', versionIndex: 0 }, 
};


app.post('/compile-sql', (req, res) => {
    const { query } = req.body;

    if (!query || query.trim() === "") {
        return res.status(400).json({ result: 'SQL code cannot be empty.' });
    }

    db.query(query, (err, result) => {
        if (err) {
            return res.status(400).json({ result: `SQL Error: ${err.message}` });
        }

        
        const queryType = query.trim().split(' ')[0].toUpperCase();

        
        if (['SELECT', 'SHOW'].includes(queryType)) {
            
            res.json({ result });
        } else {
            
            res.json({ result: `${queryType} command executed successfully.` });
        }
    });
});


app.post('/compile', async (req, res) => {
    const { sourceCode, language } = req.body;

    
    const selectedLanguage = languageDefaults[language];
    if (!selectedLanguage) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    
    const apiData = {
        script: sourceCode, 
        language: selectedLanguage.language,
        versionIndex: selectedLanguage.versionIndex,
        clientId: '', 
        clientSecret: '',
    };

    try {
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `JDoodle API error: ${response.statusText}` });
        }

        const result = await response.json();

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json(result); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to compile code' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`); 
});
