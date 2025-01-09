const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/factsDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a Fact schema
const factSchema = new mongoose.Schema({
    topic: String,
    content: String
});

// Create a Fact model
const Fact = mongoose.model('Fact', factSchema);

// Fetch facts from the database
app.get('/facts/:topic', (req, res) => {
    Fact.find({ topic: req.params.topic }, (err, facts) => {
        if (err) {
            res.status(500).send('Error fetching facts');
        } else {
            res.json(facts.map(fact => fact.content));
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 