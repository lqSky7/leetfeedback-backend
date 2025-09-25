const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 'github.id': profile.id });
    if (user) {
      return done(null, user);
    } else {
      // Check if user exists by email or create new
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // Link GitHub
        user.github = {
          id: profile.id,
          username: profile.username,
          linked: true
        };
        await user.save();
        return done(null, user);
      } else {
        // Create new user
        user = new User({
          username: profile.username,
          email: profile.emails[0].value,
          password_hash: '', // No password for GitHub users
          github: {
            id: profile.id,
            username: profile.username,
            linked: true
          },
          role: 'student'
        });
        await user.save();
        return done(null, user);
      }
    }
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;