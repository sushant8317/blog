require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/propscholar-blog';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'propscholars@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hindi@1234';

// ============= SCHEMAS =============

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  minWords: { type: Number, default: 250 },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
      reward: { type: String, default: '₹0' },
    imageUrl: { type: String, default: '🎯' }
});

// Submission Schema
const submissionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  blog: { type: String, required: true },
  wordCount: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);
const Submission = mongoose.model('Submission', submissionSchema);

// ============= HELPER FUNCTIONS =============

// Check if event is active
function isEventActive(event) {
  const now = new Date();
  return event && event.status === 'active' && now <= new Date(event.endDate);
}

// ============= PUBLIC ROUTES =============

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Event submission page (dynamic)
app.get('/events/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    
    if (!event) {
      return res.status(404).send('Event not found');
    }
    
    res.sendFile(path.join(__dirname, 'public', 'event.html'));
  } catch (err) {
    res.status(500).send('Error loading event');
  }
});

// Fetch event details (for frontend)
app.get('/api/events/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const now = new Date();
    const isActive = event.status === 'active' && now <= new Date(event.endDate);
    
    res.json({
      _id: event._id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      minWords: event.minWords,
      isActive: isActive,
      daysRemaining: Math.ceil((new Date(event.endDate) - now) / (1000 * 60 * 60 * 24))
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching event' });
  }
});

// Submit blog to event
app.post('/api/events/:slug/submit', async (req, res) => {
  try {
    const { name, email, phone, blog } = req.body;
    
    // Validate inputs
    if (!name || !email || !phone || !blog) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Find event
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is still active
    const now = new Date();
    if (event.status === 'closed' || now > new Date(event.endDate)) {
      return res.status(403).json({ error: 'Submissions for this event are closed' });
    }
    
    // Validate word count
    const wordCount = blog.trim().split(/\\s+/).filter(Boolean).length;
    if (wordCount < event.minWords) {
      return res.status(400).json({ 
        error: `Minimum ${event.minWords} words required. You have ${wordCount} words.` 
      });
    }
    
    // Save submission
    const submission = new Submission({
      eventId: event._id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      blog: blog.trim(),
      wordCount: wordCount
    });
    
    await submission.save();
    res.json({ success: true, message: 'Blog submitted successfully!' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Error submitting blog' });
  }
});

// ============= ADMIN ROUTES =============

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Create event
app.post('/api/admin/events', async (req, res) => {
  try {
    const { email, password, title, slug, description, startDate, endDate, minWor, minWords, reward, imageUrl } } = req.body;
    
    // Verify admin
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if slug already exists
    const existing = await Event.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    // Create event
    const event = new Event({
      title,
      slug: slug.toLowerCase(),
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      minWords: minWords || 250,
      status: 'active'
          reward: reward || '₹5,000',
          imageUrl: imageUrl || '🎯'
    });
    
    await event.save();
    res.json({ success: true, event: event, message: `Event created: /events/${event.slug}` });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Error creating event' });
  }
});

// Get all events (admin)
app.get('/api/admin/events', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Get submissions for an event
app.get('/api/admin/events/:slug/submissions', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const submissions = await Submission.find({ eventId: event._id }).sort({ submittedAt: -1 });
    res.json({
      event: {
        title: event.title,
        slug: event.slug,
        totalSubmissions: submissions.length
      },
      submissions: submissions
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// Close event (admin)
app.post('/api/admin/events/:slug/close', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verify admin
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const event = await Event.findOneAndUpdate(
      { slug: req.params.slug },
      { status: 'closed' },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ success: true, message: 'Event closed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error closing event' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============= ERROR HANDLING =============

app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Server error');
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`\n✅ PropScholar Blog Contest Server v2.0`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Submit blog: http://localhost:${PORT}/events/:slug`);
  console.log(`🔐 Admin dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`\n📊 MongoDB: ${mongoURI}`);
  console.log('================================\n');
});

module.exports = app;
