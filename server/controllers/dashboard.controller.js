/**
 * WHY: Dashboard needs aggregated data — counts, upcoming events, charts.
 *      Using MongoDB aggregation pipelines is far more efficient than
 *      fetching all records to Node and computing in JS.
 * HOW: Each query is a MongoDB aggregation pipeline.
 * PERFORMANCE: All aggregations run on indexed fields. Promise.all() parallelizes
 *              all 6 queries — total time = slowest query, not sum of all.
 * INTERVIEW Q: Why use MongoDB aggregation instead of JS-side computation?
 *   MongoDB processes data in-place, sends only the result across the wire.
 *   JS-side processing requires fetching all raw documents (network + memory overhead).
 */

const Friend = require('../models/Friend.model');
const { sendSuccess } = require('../utils/response.utils');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const todayYear = today.getFullYear();

    // Run all aggregations in parallel
    const [
      totalFriends,
      genderStats,
      monthlyBirthdays,
      upcomingBirthdays,
      upcomingAnniversaries,
      todayBirthdays,
      recentFriends,
      relationshipStats,
    ] = await Promise.all([

      // 1. Total active friends
      Friend.countDocuments({ userId, isDeleted: false, isArchived: false }),

      // 2. Gender distribution
      Friend.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),

      // 3. Birthdays by month (for yearly graph)
      Friend.aggregate([
        { $match: { userId, isDeleted: false, dateOfBirth: { $exists: true, $ne: null } } },
        { $group: { _id: { $month: '$dateOfBirth' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),

      // 4. Upcoming birthdays (next 30 days) using dayOfYear trick
      Friend.find({
        userId,
        isDeleted: false,
        dateOfBirth: { $exists: true, $ne: null },
      })
        .select('name photo dateOfBirth')
        .lean({ virtuals: true })
        .then((friends) =>
          friends
            .map((f) => ({
              ...f,
              daysUntilBirthday: (() => {
                const dob = new Date(f.dateOfBirth);
                const next = new Date(todayYear, dob.getMonth(), dob.getDate());
                if (next < today) next.setFullYear(todayYear + 1);
                return Math.ceil((next - today) / 86400000);
              })(),
            }))
            .filter((f) => f.daysUntilBirthday >= 0 && f.daysUntilBirthday <= 30)
            .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
            .slice(0, 10)
        ),

      // 5. Upcoming anniversaries (next 30 days)
      Friend.find({
        userId,
        isDeleted: false,
        'spouse.weddingAnniversary': { $exists: true, $ne: null },
      })
        .select('name photo spouse')
        .lean()
        .then((friends) =>
          friends
            .map((f) => ({
              ...f,
              daysUntilAnniversary: (() => {
                const ann = new Date(f.spouse.weddingAnniversary);
                const next = new Date(todayYear, ann.getMonth(), ann.getDate());
                if (next < today) next.setFullYear(todayYear + 1);
                return Math.ceil((next - today) / 86400000);
              })(),
            }))
            .filter((f) => f.daysUntilAnniversary >= 0 && f.daysUntilAnniversary <= 30)
            .sort((a, b) => a.daysUntilAnniversary - b.daysUntilAnniversary)
            .slice(0, 10)
        ),

      // 6. Today's birthdays
      Friend.find({ userId, isDeleted: false, dateOfBirth: { $exists: true, $ne: null } })
        .select('name photo dateOfBirth mobile whatsapp')
        .lean()
        .then((friends) =>
          friends.filter((f) => {
            const dob = new Date(f.dateOfBirth);
            return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
          })
        ),

      // 7. Recently added friends
      Friend.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name photo gender city relationship dateOfBirth')
        .lean({ virtuals: true }),

      // 8. Relationship distribution
      Friend.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: '$relationship', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Build monthly birthday data for chart (Jan–Dec)
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const birthdayByMonth = MONTHS.map((month, idx) => {
      const found = monthlyBirthdays.find((m) => m._id === idx + 1);
      return { month, count: found ? found.count : 0 };
    });

    // Count children across all friends
    const childrenData = await Friend.aggregate([
      { $match: { userId, isDeleted: false } },
      { $project: { childrenCount: { $size: '$children' } } },
      { $group: { _id: null, total: { $sum: '$childrenCount' } } },
    ]);

    return sendSuccess(res, {
      stats: {
        totalFriends,
        todayBirthdaysCount: todayBirthdays.length,
        upcomingBirthdaysCount: upcomingBirthdays.length,
        upcomingAnniversariesCount: upcomingAnniversaries.length,
        totalChildren: childrenData[0]?.total || 0,
      },
      genderStats: genderStats.map((g) => ({ name: g._id || 'Unknown', value: g.count })),
      relationshipStats,
      birthdayByMonth,
      upcomingBirthdays,
      upcomingAnniversaries,
      todayBirthdays,
      recentFriends,
    }, 'Dashboard stats fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
