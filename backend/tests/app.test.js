const request = require('supertest');
const app = require('../server');

describe('POST /fetch-metadata', () => {
    it('should return metadata for valid URLs', async () => {
        const urls = ['https://www.facebook.com']; // Ensure this URL is reachable and returns valid metadata
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls });

        expect(response.status).toBe(200);
        response.body.forEach(item => {
            expect(item).toHaveProperty('url');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('description');
            expect(item).toHaveProperty('image');
        });
    });

    it('should return an error for an empty URL array', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: [] });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Please provide an array of URLs.');
    });

    it('should handle failed requests gracefully', async () => {
        const urls = ['https://invalidurl.com'];

        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls });

        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('url');
        expect(response.body[0]).toHaveProperty('error', 'Could not retrieve metadata');
    });

    it('should apply rate limiting', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/fetch-metadata')
                .send({ urls: ['https://example.com'] });
        }

        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ['https://example.com'] });

        expect(response.status).toBe(429);
        expect(response.body).toHaveProperty('message', 'Too many requests, please try again later.');
    });
});