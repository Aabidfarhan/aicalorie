import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI("AIzaSyBZGm8SzpfVj1K0x9n44UnrPwztoSdAz0M");

const SYSTEM_PROMPT = `You are a friendly, knowledgeable nutrition and fitness coach inside a calorie tracking app called Calorie Coach. 
You help users with:
- Calorie and macro information for Indian and international foods
- Meal planning and diet advice (weight loss, muscle gain, maintenance)
- Healthy recipe suggestions using Indian ingredients
- Interpreting their daily calorie and macro data
- General wellness, hydration, sleep, and fitness tips

Keep responses concise, practical, and encouraging. Use bullet points for lists. 
When asked about specific foods, always mention approximate calories and key macros.
Do not provide medical diagnoses. Always recommend consulting a doctor for medical concerns.`;

app.post('/api/chat', async (req, res) => {
    try {
        const { history, userText } = req.body;

        // 1. Map frontend history to the format the Gemini SDK expects
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // 2. Initialize the model with the system instruction
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
            }
        });

        // 3. Start a chat session using the history
        const chat = model.startChat({
            history: formattedHistory
        });

        // 4. Send the new user message
        const result = await chat.sendMessage(userText);
        const responseText = result.response.text();

        // 5. Send the text back to React
        res.json({ reply: responseText });

    } catch (error) {
        console.error('Full error:', JSON.stringify(error, null, 2));
        res.status(500).json({ 
            error: error.message || 'Failed to generate response',
            details: error?.errorDetails || error?.status || 'no details'
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});