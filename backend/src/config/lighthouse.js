import dotenv from 'dotenv';
dotenv.config();

// Lighthouse API configuration
export const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || '';

if (!LIGHTHOUSE_API_KEY) {
    console.warn('Warning: LIGHTHOUSE_API_KEY not set in environment variables');
}

export default {
    apiKey: LIGHTHOUSE_API_KEY,
};

