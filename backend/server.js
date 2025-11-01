// 1. Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 2. Initialize the Express app
const app = express();
const PORT = 3000; // We'll run our backend on port 3000

// 3. Middleware
app.use(cors()); // Allows cross-origin requests (from our front-end)
app.use(express.json()); // Allows the server to understand JSON data sent from the form

// 4. Connect to MongoDB Atlas
//    !!!! IMPORTANT: MAKE SURE YOUR PASSWORD IS CORRECTLY PASTED IN HERE !!!!
const mongoURI = 'mongodb+srv://ahershantanu04_db_user:svaher370822@cluster0.nn6iclu.mongodb.net/MusicFestDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// 5. Define a "Schema" and "Model" for our user data
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 5b. Define a "Schema" and "Model" for EVENTS
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genre: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true }
});

const Event = mongoose.model('Event', eventSchema);
// 6. Create the API Endpoint (The Route)
app.post('/register', async (req, res) => {
    try {
        const { name, email, mobile } = req.body;

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const newUser = new User({
            name,
            email,
            mobile
        });

        await newUser.save();
        res.status(201).json({ message: 'Registration successful!' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});



// 1. CREATE (Create a new event)
app.post('/api/events', async (req, res) => {
    try {
        const newEvent = new Event({
            name: req.body.name,
            genre: req.body.genre,
            image: req.body.image,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: 'Error creating event', error });
    }
});

// 2. READ (Get all events)
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// 3. READ (Get a single event by ID - we'll use this for editing)
app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error });
    }
});


// 4. UPDATE (Update an event by ID)
app.put('/api/events/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // 'new: true' sends back the updated doc
        );
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: 'Error updating event', error });
    }
});

// 5. DELETE (Delete an event by ID)
app.delete('/api/events/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
});



// 7. Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});