const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // הגדלת הלימיט עבור תמונות base64
app.use(express.static(path.join(__dirname)));

// Google Sheets configuration
const SHEET_ID = '1gRyLvPyfxSwpg8PA4AVd1MEj1eWf0anEyJ5bpqRSFY4';

async function appendToSheet(formData) {
    try {
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:I',
            valueInputOption: 'RAW',
            resource: {
                values: [[
                    new Date().toISOString(),
                    formData.name,
                    formData.last_name,
                    formData.id_number,
                    formData.phone,
                    formData.email,
                    formData.condition,
                    formData.date
                ]]
            }
        });
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/thanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'thanks.html'));
});

// Handle form submissions
app.post('/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // שמירה בגוגל שיטס
        await appendToSheet(formData);

        // שמירת החתימה כקובץ
        if (formData.signature) {
            const signatureData = formData.signature.replace(/^data:image\/png;base64,/, '');
            const signaturePath = path.join(__dirname, 'signatures', `${formData.id_number}_${Date.now()}.png`);
            
            // יצירת תיקיית חתימות אם לא קיימת
            if (!fs.existsSync(path.join(__dirname, 'signatures'))) {
                fs.mkdirSync(path.join(__dirname, 'signatures'));
            }
            
            require('fs').writeFileSync(signaturePath, signatureData, 'base64');
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'Failed to process form' });
    }
});

app.get('/healthz', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});