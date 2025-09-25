const Gamification = require('../models/Gamification');

async function updateGamification(userId, xpGain) {
  let gam = await Gamification.findOne({ user_id: userId });
  if (!gam) {
    gam = new Gamification({ user_id: userId });
  }

  gam.xp += xpGain;

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = gam.last_streak_date ? new Date(gam.last_streak_date) : null;
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      gam.streak_days += 1;
    } else if (diff > 1) {
      gam.streak_days = 1;
    }
    // If diff === 0, same day, no change
  } else {
    gam.streak_days = 1;
  }
  gam.last_streak_date = today;

  // Update level (e.g., level up every 100 XP)
  gam.level = Math.floor(gam.xp / 100) + 1;

  // Update badges
  gam.badges = [];
  if (gam.streak_days >= 7) gam.badges.push('Week Warrior');
  if (gam.streak_days >= 30) gam.badges.push('Month Master');
  if (gam.xp >= 1000) gam.badges.push('XP Champion');
  if (gam.xp >= 5000) gam.badges.push('Legend');

  // Update rank (1-based, lower number is better)
  const higherCount = await Gamification.countDocuments({ xp: { $gt: gam.xp } });
  gam.rank = higherCount + 1;

  await gam.save();
  return gam;
}

module.exports = updateGamification;