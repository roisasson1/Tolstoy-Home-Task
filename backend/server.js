const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

// Middleware to secure the app with HTTP headers
app.use(helmet());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cookie parser middleware before csrf
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Adjust to match your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1000, // 1 second window
    max: 5, // Limit each IP to 5 requests per window
    message: 'Too many requests, please try again later.'
});

app.use(limiter); // Apply the rate limiter to all requests
app.use(bodyParser.json());

// Conditionally apply CSRF protection
/*if (process.env.NODE_ENV !== 'test') {
    const csrfProtection = csurf({ cookie: true });
    app.use(csrfProtection);
    app.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}*/

// Endpoint to fetch metadata
app.post('/fetch-metadata', async (req, res) => {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of URLs.' });
    }

    const metadataPromises = urls.map(async (url) => {
        try {
            const response = await axios.get(url);
            const html = response.data;
            //console.log(html);
            const $ = cheerio.load(html);
            //console.log($);

            const title = $('title').text() || 'No title available';
            console.log(title);
            const description = $('meta[name="description"]').attr('content') || 'No description available';
            console.log(description);
            const image = $('meta[property="og:image"]').attr('content') || 'No image available';
            console.log(image);

            return { url, title, description, image };
        } catch (error) {
            return { url, error: 'Could not retrieve metadata' };
        }
    });

    try {
        const metadataResults = await Promise.all(metadataPromises);
        res.json(metadataResults);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching metadata' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
