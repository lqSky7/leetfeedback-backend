const mongoose = require('mongoose');
const User = require('./models/User');
const Gamification = require('./models/Gamification');

async function testFriendsGamification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leetfeedback', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all users to see what we have
    const allUsers = await User.find({}, 'username email friends');
    console.log('\n=== ALL USERS ===');
    allUsers.forEach(user => {
      console.log(`User: ${user.username} (${user._id})`);
      console.log(`Friends: ${user.friends.length} friends`);
      console.log(`Friend IDs: ${user.friends.map(f => f.toString()).join(', ')}`);
      console.log('---');
    });
    
    // Find all gamification records
    const allGam = await Gamification.find({}).populate('user_id', 'username');
    console.log('\n=== ALL GAMIFICATION RECORDS ===');
    allGam.forEach(gam => {
      console.log(`User: ${gam.user_id?.username || 'Unknown'} (${gam.user_id?._id || 'No ID'})`);
      console.log(`XP: ${gam.xp}, Level: ${gam.level}, Streak: ${gam.streak_days}`);
      console.log('---');
    });
    
    // Test the specific logic for each user
    console.log('\n=== TESTING FRIENDS GAMIFICATION LOGIC ===');
    for (const user of allUsers) {
      if (user.friends.length > 0) {
        console.log(`\nTesting for user: ${user.username}`);
        console.log(`User's friends: ${user.friends.map(f => f.toString()).join(', ')}`);
        
        const friendsGam = await Gamification.find({ user_id: { $in: user.friends } }).populate('user_id', 'username');
        console.log(`Found ${friendsGam.length} gamification records for friends`);
        
        friendsGam.forEach(gam => {
          console.log(`  - ${gam.user_id?.username}: XP=${gam.xp}, Level=${gam.level}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Load environment variables
require('dotenv').config();
testFriendsGamification();