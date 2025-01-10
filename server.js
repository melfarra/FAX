require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define a Fact schema
const factSchema = new mongoose.Schema({
    topic: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    lastShown: { type: Date, default: Date.now }  // Track when the fact was last displayed
});

// Create a Fact model
const Fact = mongoose.model('Fact', factSchema);

// Simple similarity check function
function similarity(str1, str2) {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
}

// Generate fact using OpenAI
app.get('/generate-fact/:topic', async (req, res) => {
    try {
        // First, get all existing facts for this topic
        const existingFacts = await Fact.find({ topic: req.params.topic });
        const existingContents = existingFacts.map(fact => fact.content.toLowerCase());

        let isUnique = false;
        let fact = '';
        let attempts = 0;
        const maxAttempts = 3;

        while (!isUnique && attempts < maxAttempts) {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that provides interesting facts. Please provide a completely unique fact but do not offer any dialogue before or after you state the fact. Do not include any other text or dialogue."
                    },
                    {
                        role: "user",
                        content: `Tell me a unique and interesting fact about ${req.params.topic} that is different from these existing facts: ${existingContents.join(', ')}. Make sure the fact is completely different from the existing ones.`
                    }
                ],
                max_tokens: 100,
                temperature: 1.0 // Increase creativity
            });

            fact = completion.choices[0].message.content;
            
            // Check if the generated fact is unique enough
            isUnique = !existingContents.some(existingFact => 
                similarity(fact.toLowerCase(), existingFact) > 0.7 // Threshold for similarity
            );
            
            attempts++;
        }

        if (!isUnique && attempts >= maxAttempts) {
            return res.status(400).json({ error: 'Unable to generate a unique fact. Please try again.' });
        }

        // Save the unique fact to MongoDB
        await Fact.create({
            topic: req.params.topic,
            content: fact,
            lastShown: new Date()
        });

        res.json({ fact });
    } catch (error) {
        console.error('Error generating fact:', error);
        res.status(500).json({ error: 'Failed to generate fact' });
    }
});

// Fetch facts from the database
app.get('/facts/:topic', async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Find facts that haven't been shown in the last 6 months
        const facts = await Fact.find({
            topic: req.params.topic,
            lastShown: { $lt: sixMonthsAgo }
        });

        // If no eligible facts, fetch all facts (fallback)
        if (facts.length === 0) {
            const allFacts = await Fact.find({ topic: req.params.topic });
            if (allFacts.length === 0) {
                return res.json([]);
            }
            // Select a random fact from all available facts
            const randomFact = allFacts[Math.floor(Math.random() * allFacts.length)];
            // Update lastShown timestamp
            await Fact.findByIdAndUpdate(randomFact._id, { lastShown: new Date() });
            return res.json([randomFact.content]);
        }

        // Select a random fact from eligible facts
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        // Update lastShown timestamp
        await Fact.findByIdAndUpdate(randomFact._id, { lastShown: new Date() });
        res.json([randomFact.content]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error fetching facts');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 