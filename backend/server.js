require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ShantiDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected Securely"))
  .catch(err => console.error("MongoDB Error:", err));

// Define User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static file serving (CSS/JS/images)
app.use(express.static(path.join(__dirname, '..')));

// Route to serve login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'models', 'login.html'));
});

// Handle form submission (SignUp / Login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Invalid email format');
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user exists, check password (Login logic)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send('Invalid credentials');
      }
    } else {
      // If user doesn't exist, hash password and save (SignUp logic)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({ email, password: hashedPassword });
      await user.save();
    }

    
    // Redirect to homepage after successful login/signup
    res.redirect('/Shanti/index.html');
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
