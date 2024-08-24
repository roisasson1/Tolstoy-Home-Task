const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

// Middleware to secure the app with HTTP headers
app.use(helmet());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cookie parser middleware before csrf
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: 'https://tolstoy-home-task-1.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per window
    message: {
        message: 'Too many requests.',
        status: 429
    }
});

app.use('/fetch-metadata', limiter); // Apply the rate limiter specifically to the /fetch-metadata route
app.use(bodyParser.json());

// Conditionally apply CSRF protection only in development
if (process.env.NODE_ENV !== 'production') {
    const csrfProtection = csurf({ cookie: true });
    app.use(csrfProtection);
    app.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}

// fetch metadata from a URL
const fetchMetadata = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');

        return {
            url,
            title: title || 'No title available',
            description: description || 'No description available',
            image: image || 'No image available'
        };
    } catch (error) {
        return {
            url,
            error: 'Could not retrieve metadata'
        };
    }
};

// Endpoint to fetch metadata
app.post('/fetch-metadata', async (req, res) => {
    const { urls } = req.body;

    // Validate the URL array
    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of URLs.' });
    }

    const metadataArray = [];
    for (const url of urls) {
        const metadata = await fetchMetadata(url);
        metadataArray.push(metadata);
    }

    res.json(metadataArray);
});

// Only start listening if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;