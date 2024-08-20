require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Use the connection string from environment variables
// const mongoURI = process.env.MONGODB_URI;
const mongoURI = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const billSchema = new mongoose.Schema({
    type: String,
    amount: Number,
    date: String
});

const Bill = mongoose.model('Bill', billSchema);

app.use(cors());
app.use(bodyParser.json());

app.post('/api/bills', async (req, res) => {
    try {
        console.log("hi")
        const bill = new Bill(req.body);
        await bill.save();
        res.status(201).send(bill);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/bills', async (req, res) => {
    try {
        const query = req.query.q || '';

        let searchCriteria = {};

        if (query) {
            const numericQuery = parseFloat(query);

            if (!isNaN(numericQuery)) {
                // If the query is a number, search by amount
                searchCriteria.amount = numericQuery;
            } else {
                // If the query is a string, search by type or date
                searchCriteria.$or = [
                    { type: query },
                    { date: query }
                ];
            }
        }

        const bills = await Bill.find(searchCriteria);
        res.send(bills);
    } catch (error) {
        console.log("Error retrieving bills:", error);
        res.status(500).send({ error: 'An error occurred while retrieving bills.' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
