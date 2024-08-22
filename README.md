# Metadata Fetcher Application

## Overview

This application is a full-stack project designed to fetch metadata (title, description, image) from user-inputted URLs.
The project is divided into two main parts: the backend - which handles the server-side logic, 
and the frontend - which provides the user interface.
This project demonstrates a full-stack approach to building an application that interacts with external APIs, handles server-side logic securely, and provides a responsive and user-friendly frontend interface. The inclusion of robust testing ensures reliability and maintainability of the codebase.

## Backend

### Technology Stack
- **Node.js**: JavaScript runtime environment used to execute server-side code.
- **Express.js**: Web framework for Node.js used to build the backend API.
- **Axios**: Promise-based HTTP client used to make requests to external URLs to fetch metadata.
- **Cheerio**: Library that parses and manipulates HTML, used here to extract metadata from the fetched HTML.
- **Helmet**: Middleware for securing the app by setting various HTTP headers.
- **CSRF Protection**: Implemented using `csurf` and `cookie-parser` to protect against cross-site request forgery attacks.
- **Rate Limiting**: Implemented using `express-rate-limit` to limit the number of requests from a single IP in a given time frame.

### Endpoints
- **POST `/fetch-metadata`**: 
  - Accepts an array of URLs in the request body.
  - Fetches metadata (title, description, image) for each URL.
  - Returns metadata in JSON format or an error message if metadata cannot be retrieved.

### Testing
- **Supertest**: Used for testing the `/fetch-metadata` endpoint.
- **Jest**: Test runner used to execute the backend tests.

### Sample Test Scenarios
- Fetch metadata for valid URLs.
- Handle cases where no URLs are provided.
- Handle invalid URLs gracefully.
- Enforce rate limiting to prevent abuse.

## Frontend

### Technology Stack
- **React**: JavaScript library for building the user interface.
- **Axios**: Used in the frontend to send HTTP POST requests to the backend API.
- **react-hot-toast**: Library for showing toast notifications for success and error messages.

### Components
- **MetadataFetcher.jsx**: 
  - Manages state for URLs, metadata, and errors.
  - Allows users to input URLs and fetch metadata by interacting with the backend.
  - Displays the fetched metadata or error messages as toast notifications.

### Features
- **Dynamic URL Fields**: Users can add more URL input fields dynamically.
- **URL Validation**: Checks if the inputted URLs start with `http://` or `https://` before submitting.
- **Error Handling**: Displays error messages via toast notifications if:
  - Less than three URLs are provided.
  - URLs are invalid.
  - Metadata fetching fails.

### CSS
- **Flexbox**: Used for layout and centering elements within containers.

## Installation and Running

### Prerequisites
- Node.js and npm installed on your machine.

### Backend Setup
1. Navigate to the backend directory.
2. Run `npm install` to install dependencies.
3. Start the backend server with `npm start`.

### Frontend Setup
1. Navigate to the frontend directory.
2. Run `npm install` to install dependencies.
3. Start the frontend development server with `npm run dev`.

### Running Tests
Run `npm test` in the backend directory to execute the test suite.
