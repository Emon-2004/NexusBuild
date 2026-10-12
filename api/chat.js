import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION =
    'You are the Support Agent, a helpful assistant for this real-estate ' +
    'platform website. Answer questions using only the information retrieved from the ' +
    'site content provided to you. If the answer isn\'t in the retrieved content, say ' +
    'you don\'t have that information and suggest the user contact the team directly — ' +
    'never make up project details, dates, or figures. Keep answers concise (2-4 sentences) ' +
    'and match the site\'s professional tone.';

const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const message = req.body?.message;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message is required and must be a non-empty string' });
    }

    const fileSearchStoreName = process.env.GEMINI_FILE_SEARCH_STORE;
    if (!fileSearchStoreName) {
        return res.status(500).json({ error: 'GEMINI_FILE_SEARCH_STORE environment variable is not set' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        let replyText = null;
        let lastError = null;

        for (const model of MODELS) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: message,
                    config: {
                        systemInstruction: SYSTEM_INSTRUCTION,
                        tools: [
                            {
                                fileSearch: {
                                    fileSearchStoreNames: [fileSearchStoreName],
                                },
                            },
                        ],
                    },
                });
                if (response?.text) {
                    replyText = response.text;
                    break;
                }
            } catch (err) {
                console.warn(`[Chat API] Model ${model} failed (${err.message}). Trying fallback model...`);
                lastError = err;
            }
        }

        if (!replyText) {
            throw lastError || new Error('All AI models failed to respond.');
        }

        return res.status(200).json({ reply: replyText });
    } catch (error) {
        console.error('[Chat API] Fatal Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
