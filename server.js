require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define Fact Schema
const factSchema = new mongoose.Schema({
    category: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    lastShown: { type: Date, default: null }
});

const Fact = mongoose.model('Fact', factSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Function to generate a fact using OpenAI
async function generateFact(category) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a direct fact provider. Output ONLY the raw fact with no prefixes, suffixes, or dialogue. Never use phrases like 'Random fact', 'Did you know', 'Here's a fact', etc. Start directly with the fact content. Keep facts concise and interesting."
                },
                {
                    role: "user",
                    content: `Generate a unique interesting fact about ${category}. Output ONLY the fact itself.`
                }
            ],
            max_tokens: 100,
            temperature: 0.8
        });

        let fact = completion.choices[0].message.content.trim();
        
        // Clean up the fact
        fact = fact.replace(/^(random fact:|fact:|here's a fact:|did you know( that)?:|fun fact:|interesting(ly)?:)/gi, '');
        fact = fact.replace(/[!?]+$/, '.');
        fact = fact.trim();
        
        // Ensure proper capitalization and punctuation
        fact = fact.charAt(0).toUpperCase() + fact.slice(1);
        if (!fact.match(/[.!?]$/)) {
            fact += '.';
        }

        // Save the fact to database
        await Fact.create({
            category: category === 'random' ? 'random' : category,
            content: fact
        });

        return fact;
    } catch (error) {
        console.error('Error generating fact:', error);
        throw error;
    }
}

// Get facts from database or generate new ones
async function getFacts(category, count = 3) {
    try {
        // Find facts that haven't been shown in the last 6 hours
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        let query = category === 'random' ? {} : { category };
        
        let facts = await Fact.aggregate([
            { $match: { 
                ...query,
                $or: [
                    { lastShown: { $lt: sixHoursAgo } },
                    { lastShown: null }
                ]
            }},
            { $sample: { size: count } }
        ]);

        // If we don't have enough facts, generate new ones
        if (facts.length < count) {
            const neededFacts = count - facts.length;
            for (let i = 0; i < neededFacts; i++) {
                const newFact = await generateFact(category);
                facts.push({ content: newFact });
            }
        }

        // Update lastShown timestamp for returned facts
        const factIds = facts.map(f => f._id).filter(id => id);
        if (factIds.length > 0) {
            await Fact.updateMany(
                { _id: { $in: factIds } },
                { $set: { lastShown: new Date() } }
            );
        }

        return facts.map(f => f.content);
    } catch (error) {
        console.error('Error getting facts:', error);
        throw error;
    }
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get facts for any category (including random)
app.get('/api/facts/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const facts = await getFacts(category);
        res.json({ facts });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate facts' });
    }
});

// Endpoint to manually generate and store facts
app.post('/api/generate-facts', async (req, res) => {
    try {
        const { category, count = 10 } = req.body;
        const facts = [];
        for (let i = 0; i < count; i++) {
            const fact = await generateFact(category);
            facts.push(fact);
        }
        res.json({ message: `Generated ${facts.length} facts for ${category}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate facts' });
    }
});

const authRoutes = require('./auth/routes/auth.routes');
const factsRoutes = require('./auth/routes/facts.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facts', factsRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 