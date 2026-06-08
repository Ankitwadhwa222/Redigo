const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for chatbot: 10 requests per minute per IP
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many chatbot requests, please try again later.'
});

router.use(chatbotLimiter);

// Chatbot endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'AI service is not configured. Please contact support.'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare the system prompt for Redigo-specific context
    const systemPrompt = `You are Redigo Assistant, an AI chatbot specifically designed for Redigo, a ride-sharing platform. Your role is to help users with:

1. Ride booking and management
2. Driver and passenger support
3. Safety and security information
4. Payment and billing questions
5. General platform navigation
6. Troubleshooting common issues

Key features of Redigo:
- Users can book rides as passengers or offer rides as drivers
- Real-time ride tracking and communication
- Secure payment processing
- User profiles with ratings and reviews
- Emergency contacts and safety features
- Live chat between drivers and passengers

Always be helpful, friendly, and focused on ride-sharing topics. If a question is not related to Redigo or ride-sharing, politely redirect the conversation back to our services.

Keep responses concise but informative. If you need more information to help properly, ask for clarification.`;

    // Generate response using Gemini
    const result = await model.generateContent([
      `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
    ]);

    const response = await result.response;
    const aiResponse = response.text().trim();

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Chatbot error:', error);

    // Handle specific Gemini errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(500).json({
        error: 'AI service authentication failed. Please contact support.'
      });
    }

    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return res.status(429).json({
        error: 'AI service is busy. Please try again in a moment.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Sorry, I\'m having trouble responding right now. Please try again later.'
    });
  }
});

module.exports = router;