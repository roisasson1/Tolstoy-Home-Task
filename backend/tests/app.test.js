const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cheerio = require('cheerio');

// Create an Express app instance
const app = express();

// Middleware to secure the app with HTTP headers
app.use(helmet());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cookie parser middleware before csrf
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1000, // 1 second window
    max: 5, // Limit each IP to 5 requests per window
    message: 'Too many requests, please try again later.'
});

app.use(limiter); // Apply the rate limiter to all requests

// Mock CSRF token for testing
app.use((req, res, next) => {
    req.csrfToken = () => 'test-csrf-token';
    next();
});

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
            const $ = cheerio.load(html);

            const title = $('title').text();
            const description = $('meta[name="description"]').attr('content');
            const image = $('meta[property="og:image"]').attr('content');

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

// Test suite for /fetch-metadata endpoint
describe('POST /fetch-metadata', () => {
    it('should return metadata for valid URLs', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({
                urls: ['https://example.com'],
            });

        expect(response.statusCode).toBe(200);
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('image');
    });

    it('should return 400 if no URLs are provided', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({
                urls: [],
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Please provide an array of URLs.');
    });

    it('should return error for invalid URLs', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({
                urls: ['https://invalid-url.example.com'],
            });

        expect(response.statusCode).toBe(200);
        expect(response.body[0].error).toBe('Could not retrieve metadata');
    });

    it('should handle rate limiting', async () => {
        // Send 5 requests to reach rate limit
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/fetch-metadata')
                .send({
                    urls: ['https://example.com'],
                });
        }

        const response = await request(app)
            .post('/fetch-metadata')
            .send({
                urls: ['https://example.com'],
            });

        expect(response.statusCode).toBe(429);
        expect(response.text).toBe('Too many requests, please try again later.');
    });
});