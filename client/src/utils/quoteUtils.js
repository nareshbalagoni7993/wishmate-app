/**
 * WHY: Quotes are static content — no API call needed. Pre-computed categories
 *      with a random selector function makes the Quotes page instant.
 */

export const QUOTES = {
  birthday: [
    "Wishing you a day filled with sunshine and smiles, and a year filled with joy and happiness! 🎂",
    "May your birthday be the start of a year filled with good luck, good health, and much happiness! 🎉",
    "Count your life by smiles, not tears. Count your age by friends, not years. Happy Birthday! 🌟",
    "On your special day, I wish you peace, love, happiness, wisdom, and all that your heart desires! 💖",
    "Another year older, another year wiser. Have a fantastic birthday! 🎊",
    "May the joy that you have spread to others come back to you on this day. Wishing you a very Happy Birthday! 🎈",
    "Here's to you! May your birthday be filled with many beautiful moments and blessings. Happy Birthday! ✨",
    "Sending you smiles for every moment of your special day. Have a wonderful time and a very Happy Birthday! 🌈",
  ],
  wedding_anniversary: [
    "Congratulations on another year of love, laughter, and happily ever after! 💑",
    "Your love story is one of my favorites. Happy Anniversary! 💕",
    "May your love continue to grow stronger with each passing year. Happy Anniversary! 🌹",
    "Here's to a couple who still makes each other smile after all these years. Happy Anniversary! 💍",
    "True love is not just a feeling, it's a commitment. Congratulations on your anniversary! ❤️",
    "Wishing you both a day filled with beautiful memories and a future full of joy. Happy Anniversary! 🥂",
  ],
  parents_anniversary: [
    "Your love has been the foundation of our family. Happy Anniversary, Mom and Dad! 💝",
    "Watching you both together has taught us what true love looks like. Happy Anniversary! 🌸",
    "Thank you for showing us that love grows deeper with every passing year. Happy Anniversary! 💑",
    "Your partnership is an inspiration to us all. Wishing you a very Happy Anniversary! 🌹",
  ],
  good_morning: [
    "Good morning! May your day be as bright and beautiful as you are! ☀️",
    "Rise and shine! Today is a new day filled with endless possibilities! 🌅",
    "Good morning! Start each day with a grateful heart. Have a wonderful day! 🌸",
    "Wake up and smile! Today is going to be amazing! ✨",
    "Good morning! Sending you sunshine, positivity, and warm wishes for a beautiful day! 🌻",
  ],
  good_night: [
    "Sweet dreams! May tonight bring you rest and tomorrow bring you joy! 🌙",
    "Good night! Sleep well and wake up to a beautiful tomorrow! ⭐",
    "As you close your eyes tonight, may peace and happiness fill your heart. Good night! 💫",
    "Rest well! Tomorrow is another chance to shine! 🌟",
  ],
  friendship: [
    "A true friend is someone who knows all about you and still loves you! 🤝",
    "Friends are the family we choose for ourselves. Thank you for being mine! 💛",
    "Side by side or miles apart, friends are always close to the heart! 🌈",
    "Good friends are like stars — you don't always see them, but you know they're always there! ⭐",
    "Happy Friendship Day! Thank you for being the reason I smile every day! 😊",
  ],
  diwali: [
    "May the divine light of Diwali spread peace, prosperity, and happiness into your life! 🪔",
    "Wishing you a Diwali that is bright, beautiful, and full of joy! Happy Diwali! ✨",
    "May the festival of lights bring you love, laughter, and blessings. Happy Diwali! 🎆",
    "On this auspicious occasion of Diwali, may Goddess Lakshmi bless your home with wealth and prosperity! 🪔",
  ],
  new_year: [
    "May the New Year bring you happiness, peace, and prosperity. Wishing you a wonderful year ahead! 🎊",
    "Cheers to a new year and another chance for us to get it right! Happy New Year! 🥂",
    "May this new year bring new opportunities, new adventures, and new blessings! Happy New Year! 🎉",
    "Wishing you 365 days of smiles, success, and surprises! Happy New Year! ✨",
  ],
  christmas: [
    "May Santa bring you joy, love, and everything your heart desires this Christmas! 🎄",
    "Wishing you a Merry Christmas filled with warmth, love, and laughter! 🎅",
    "May the magic of Christmas fill your heart with joy and your home with love! 🎁",
    "Sending you warm Christmas wishes and holiday cheer! 🌟",
  ],
  mothers_day: [
    "A mother is the truest friend we have. Happy Mother's Day! 💐",
    "To the world you are a mother, but to your family you are the world! Happy Mother's Day! 🌸",
    "The love of a mother is the veil of a softer light between the heart and the heavenly Father. Happy Mother's Day! 💝",
  ],
  fathers_day: [
    "A father is someone you look up to no matter how tall you grow. Happy Father's Day! 👨",
    "Dad, you've always been my hero! Wishing you a wonderful Father's Day! 💪",
    "Any man can be a father, but it takes someone special to be a dad. Happy Father's Day! 🎩",
  ],
  teachers_day: [
    "Teaching is the profession that makes all other professions possible. Happy Teacher's Day! 📚",
    "A good teacher can inspire hope, ignite the imagination, and instill a love of learning. Thank you! 🍎",
    "The influence of a great teacher is never erased. Happy Teacher's Day! ✏️",
  ],
  womens_day: [
    "Here's to strong women — may we know them, may we be them, may we raise them! Happy Women's Day! 💪",
    "A woman is like a tea bag — you never know how strong she is until she's in hot water! Happy Women's Day! 🌺",
    "Empowered women empower women. Happy International Women's Day! 🌸",
  ],
  ugadi: [
    "May this Ugadi bring new hope, new joy, and new beginnings into your life! Happy Ugadi! 🌿",
    "Wishing you and your family a very Happy Ugadi! May this New Year bring you happiness and prosperity! 🌸",
  ],
  eid: [
    "Eid Mubarak! May Allah accept your prayers and bless you with happiness and peace! 🌙",
    "Wishing you and your family a joyful Eid filled with blessings and love! 🌟",
    "May this Eid bring you joy, prosperity, and all the blessings of the universe! 🌙✨",
  ],
};

export const getRandomQuote = (category) => {
  const list = QUOTES[category] || QUOTES.birthday;
  return list[Math.floor(Math.random() * list.length)];
};

export const getQuotesByCategory = (category) => QUOTES[category] || [];

export const QUOTE_CATEGORIES = [
  { id: 'birthday', label: 'Birthday Wishes', icon: '🎂', color: '#FF6584' },
  { id: 'wedding_anniversary', label: 'Wedding Anniversary', icon: '💍', color: '#6C63FF' },
  { id: 'parents_anniversary', label: "Parents' Anniversary", icon: '💑', color: '#FF8E53' },
  { id: 'good_morning', label: 'Good Morning', icon: '☀️', color: '#FFB347' },
  { id: 'good_night', label: 'Good Night', icon: '🌙', color: '#667eea' },
  { id: 'friendship', label: 'Friendship Day', icon: '🤝', color: '#43D4B0' },
  { id: 'diwali', label: 'Diwali', icon: '🪔', color: '#FF9800' },
  { id: 'new_year', label: 'New Year', icon: '🎊', color: '#E91E63' },
  { id: 'christmas', label: 'Christmas', icon: '🎄', color: '#4CAF50' },
  { id: 'mothers_day', label: "Mother's Day", icon: '🌸', color: '#FF4081' },
  { id: 'fathers_day', label: "Father's Day", icon: '👨', color: '#2196F3' },
  { id: 'teachers_day', label: "Teacher's Day", icon: '📚', color: '#795548' },
  { id: 'womens_day', label: "Women's Day", icon: '💪', color: '#9C27B0' },
  { id: 'ugadi', label: 'Ugadi', icon: '🌿', color: '#8BC34A' },
  { id: 'eid', label: 'Eid Mubarak', icon: '🌙', color: '#009688' },
];
