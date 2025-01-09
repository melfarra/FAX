require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define a Fact schema
const factSchema = new mongoose.Schema({
    topic: String,
    content: String
});

// Create a Fact model
const Fact = mongoose.model('Fact', factSchema);

// Fetch facts from the database
app.get('/facts/:topic', async (req, res) => {
    try {
        const facts = await Fact.find({ topic: req.params.topic });
        res.json(facts.map(fact => fact.content));
    } catch (err) {
        res.status(500).send('Error fetching facts');
    }
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 