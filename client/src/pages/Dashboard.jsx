import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Avatar, Chip,
  Button, useTheme, alpha, IconButton, Tooltip, useMediaQuery,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MdPeople, MdCake, MdFavorite, MdChildCare, MdArrowForward, MdRefresh } from 'react-icons/md';
import { FaRing } from 'react-icons/fa';
import {
  fetchDashboardStats,
  selectDashboardStats, selectGenderStats, selectBirthdayByMonth,
  selectUpcomingBirthdays, selectUpcomingAnniversaries, selectTodayBirthdays,
  selectRecentFriends, selectDashboardLoading,
} from '../features/dashboard/dashboardSlice';
import StatsCard from '../components/common/StatsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, getDaysUntil, getAnniversaryYears } from '../utils/dateUtils';
import PageHeader from '../components/common/PageHeader';

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const EventRow = ({ name, photo, days, date, type, onClick }) => {
  const theme = useTheme();
  const isToday = days === 0;
  const isTomorrow = days === 1;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
        borderRadius: 2, cursor: 'pointer',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
        transition: 'background 0.2s ease',
      }}
    >
      <Avatar
        src={photo}
        sx={{
          width: 40, height: 40, flexShrink: 0,
          background: `linear-gradient(135deg, ${type === 'birthday' ? '#FF6584' : '#6C63FF'} 0%, ${type === 'birthday' ? '#FF8E9E' : '#9D97FF'} 100%)`,
          fontSize: '0.85rem', fontWeight: 700,
        }}
      >
        {name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
        <Typography variant="caption" color="text.secondary">{formatDate(date)}</Typography>
      </Box>
      <Chip
        label={isToday ? 'Today! 🎂' : isTomorrow ? 'Tomorrow' : `${days}d`}
        size="small"
        color={isToday ? 'error' : isTomorrow ? 'warning' : 'primary'}
        sx={{ fontWeight: 600, minWidth: 56 }}
      />
    </Box>
  );
};

const GENDER_COLORS = { male: '#6C63FF', female: '#FF6584', other: '#43D4B0', Unknown: '#FFB347', prefer_not_to_say: '#94A3B8' };
const CHART_COLORS = ['#6C63FF', '#FF6584', '#43D4B0', '#FFB347', '#8B5CF6', '#06B6D4'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const stats = useSelector(selectDashboardStats);
  const genderStats = useSelector(selectGenderStats);
  const birthdayByMonth = useSelector(selectBirthdayByMonth);
  const upcomingBirthdays = useSelector(selectUpcomingBirthdays);
  const upcomingAnniversaries = useSelector(selectUpcomingAnniversaries);
  const todayBirthdays = useSelector(selectTodayBirthdays);
  const recentFriends = useSelector(selectRecentFriends);
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading && !stats) return <LoadingSpinner message="Loading dashboard..." />;

  const gridTextColor = isDark ? '#94A3B8' : '#6B7280';
  const chartHeight = isMobile ? 180 : 260;
  const pieHeight = isMobile ? 160 : 200;
  const pieRadius = isMobile ? 55 : 80;
  const pieInner = isMobile ? 25 : 40;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening today."
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={() => dispatch(fetchDashboardStats())} disabled={loading} size="small">
              <MdRefresh style={{ fontSize: '1.3rem' }} />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Today's Birthdays Banner */}
      {todayBirthdays.length > 0 && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #FF6584 0%, #FF8E9E 50%, #FFB347 100%)',
            color: '#fff',
          }}
          className="pulse"
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>🎂</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {todayBirthdays.length === 1
                    ? `It's ${todayBirthdays[0].name}'s Birthday!`
                    : `${todayBirthdays.length} Birthdays Today!`}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {todayBirthdays.map((f) => f.name).join(', ')} — Don't forget to wish!
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate('/reminders')}
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}
              >
                Wish
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards — 2 per row on mobile, 3 on tablet, 6 on desktop */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
        {[
          { title: 'Total Friends',      value: stats?.totalFriends,                icon: MdPeople,    color: '#6C63FF', subtitle: 'Connections' },
          { title: "Today's Birthdays",  value: stats?.todayBirthdaysCount,         icon: MdCake,      color: '#FF6584', subtitle: 'Celebrate!' },
          { title: 'Upcoming Birthdays', value: stats?.upcomingBirthdaysCount,      icon: MdCake,      color: '#FFB347', subtitle: 'Next 30d' },
          { title: 'Anniversaries',      value: stats?.upcomingAnniversariesCount,  icon: FaRing,      color: '#43D4B0', subtitle: 'Next 30d' },
          { title: 'Total Children',     value: stats?.totalChildren,               icon: MdChildCare, color: '#8B5CF6', subtitle: "Friend's kids" },
          { title: 'Favorites',          value: stats?.totalFavorites || '—',       icon: MdFavorite,  color: '#FF4081', subtitle: 'Close friends' },
        ].map((card) => (
          <Grid item xs={6} sm={4} md={4} lg={2} key={card.title}>
            <StatsCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
        {/* Birthday by Month — Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                Birthday Statistics — Monthly
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Friends' birthdays distributed across months
              </Typography>
              <Box sx={{ mt: 2, height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={birthdayByMonth} margin={{ top: 5, right: 5, left: isMobile ? -30 : -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2D2D4E' : '#F0EFFF'} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: isMobile ? 9 : 11, fill: gridTextColor }}
                      interval={isMobile ? 1 : 0}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: gridTextColor }} allowDecimals={false} />
                    <ReTooltip
                      contentStyle={{
                        background: isDark ? '#1E1E3A' : '#fff',
                        border: '1px solid #6C63FF30',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Birthdays" fill="#6C63FF">
                      {birthdayByMonth.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.count > 0 ? CHART_COLORS[index % CHART_COLORS.length] : (isDark ? '#2D2D4E' : '#F0EFFF')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gender Pie Chart */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                Gender Distribution
              </Typography>
              <Box sx={{ mt: 1, height: pieHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={pieRadius}
                      innerRadius={pieInner}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {genderStats.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={GENDER_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ReTooltip
                      contentStyle={{ background: isDark ? '#1E1E3A' : '#fff', border: '1px solid #6C63FF30', borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 11, color: gridTextColor, textTransform: 'capitalize' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Events + Recent Friends */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  🎂 Upcoming Birthdays
                </Typography>
                <Button size="small" endIcon={<MdArrowForward />} onClick={() => navigate('/birthdays')} sx={{ fontSize: '0.75rem' }}>
                  All
                </Button>
              </Box>
              {upcomingBirthdays.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">No upcoming birthdays in 30 days</Typography>
                </Box>
              ) : (
                upcomingBirthdays.slice(0, 5).map((f) => (
                  <EventRow
                    key={f._id}
                    name={f.name}
                    photo={f.photo}
                    days={f.daysUntilBirthday}
                    date={f.dateOfBirth}
                    type="birthday"
                    onClick={() => navigate(`/friends/${f._id}`)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  💍 Anniversaries
                </Typography>
                <Button size="small" endIcon={<MdArrowForward />} onClick={() => navigate('/anniversaries')} sx={{ fontSize: '0.75rem' }}>
                  All
                </Button>
              </Box>
              {upcomingAnniversaries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">No upcoming anniversaries in 30 days</Typography>
                </Box>
              ) : (
                upcomingAnniversaries.slice(0, 5).map((f) => (
                  <EventRow
                    key={f._id}
                    name={f.name}
                    photo={f.photo}
                    days={f.daysUntilAnniversary}
                    date={f.spouse?.weddingAnniversary}
                    type="anniversary"
                    onClick={() => navigate(`/friends/${f._id}`)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                  👥 Recently Added
                </Typography>
                <Button size="small" endIcon={<MdArrowForward />} onClick={() => navigate('/friends')} sx={{ fontSize: '0.75rem' }}>
                  All
                </Button>
              </Box>
              {recentFriends.map((f) => (
                <Box
                  key={f._id}
                  onClick={() => navigate(`/friends/${f._id}`)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: 2, cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    mb: 0.5,
                  }}
                >
                  <Avatar
                    src={f.photo}
                    sx={{
                      width: 36, height: 36,
                      background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                      fontSize: '0.85rem', fontWeight: 700,
                    }}
                  >
                    {f.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{f.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {f.city || f.relationship || ''}
                    </Typography>
                  </Box>
                  <Chip
                    label={f.gender === 'male' ? '♂' : f.gender === 'female' ? '♀' : '—'}
                    size="small"
                    sx={{ fontSize: '0.75rem', height: 22 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
