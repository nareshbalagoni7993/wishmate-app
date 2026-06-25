/**
 * WHY: Reminders are the core value prop of WishMate. Users need to see
 *      all upcoming events in one place, sorted by urgency.
 * HOW: Fetches all friends, computes upcoming birthdays/anniversaries client-side.
 *      Grouped by: Today / Tomorrow / Next 7 Days / Next 30 Days.
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  Divider, useTheme, alpha, Tabs, Tab, IconButton, Tooltip,
} from '@mui/material';
import { MdCake, MdWhatsapp, MdPhone } from 'react-icons/md';
import { FaRing } from 'react-icons/fa';
import { fetchFriends, selectFriends } from '../features/friends/friendsSlice';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { formatDate, getDaysUntil, getAge } from '../utils/dateUtils';
import { shareToWhatsApp } from '../utils/exportUtils';
import { getRandomQuote } from '../utils/quoteUtils';
import { useState } from 'react';

const ReminderRow = ({ name, photo, date, daysUntil, type, mobile, whatsapp, friendId, navigate }) => {
  const theme = useTheme();
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const color = type === 'birthday' ? '#FF6584' : '#6C63FF';

  const sendWish = () => {
    const category = type === 'birthday' ? 'birthday' : 'wedding_anniversary';
    const quote = getRandomQuote(category);
    const msg = `${type === 'birthday' ? '🎂 Happy Birthday' : '💍 Happy Anniversary'} ${name}!\n\n${quote}\n\n— Sent with WishMate`;
    const num = (whatsapp || mobile || '').replace(/\D/g, '');
    if (num) shareToWhatsApp(msg);
    else navigator.clipboard.writeText(msg);
  };

  return (
    <Box
      onClick={() => navigate(`/friends/${friendId}`)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2,
        border: `1px solid ${alpha(isToday ? color : theme.palette.divider, isToday ? 0.4 : 0.8)}`,
        background: isToday ? alpha(color, 0.06) : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { background: alpha(color, 0.06), transform: 'translateX(4px)' },
        mb: 1.5,
      }}
    >
      <Avatar src={photo} sx={{ width: 44, height: 44, background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`, fontWeight: 700 }}>
        {name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={700} noWrap>{name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {type === 'birthday' ? '🎂' : '💍'} {formatDate(date)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.8 }}>
        <Chip
          label={isToday ? '🎉 Today!' : isTomorrow ? '🔔 Tomorrow' : `📅 ${daysUntil} days`}
          size="small"
          color={isToday ? 'error' : isTomorrow ? 'warning' : 'default'}
          sx={{ fontWeight: 700 }}
        />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {(whatsapp || mobile) && (
            <Tooltip title="Send WhatsApp Wish">
              <IconButton
                size="small"
                sx={{ color: '#25D366' }}
                onClick={(e) => { e.stopPropagation(); sendWish(); }}
              >
                <MdWhatsapp style={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
          {mobile && (
            <Tooltip title="Call">
              <IconButton
                size="small"
                sx={{ color: '#6C63FF' }}
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${mobile}`); }}
              >
                <MdPhone style={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const Reminders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const friends = useSelector(selectFriends);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    dispatch(fetchFriends({ limit: 200, isArchived: 'false' }));
  }, [dispatch]);

  const { today, tomorrow, week, month, allAnniversaries } = useMemo(() => {
    const now = new Date();
    const today = [], tomorrow = [], week = [], month = [];
    const allAnn = [];

    friends.forEach((f) => {
      if (f.dateOfBirth) {
        const days = getDaysUntil(f.dateOfBirth);
        const entry = { ...f, daysUntil: days, type: 'birthday', date: f.dateOfBirth };
        if (days === 0) today.push(entry);
        else if (days === 1) tomorrow.push(entry);
        else if (days <= 7) week.push(entry);
        else if (days <= 30) month.push(entry);
      }
      if (f.spouse?.weddingAnniversary) {
        const days = getDaysUntil(f.spouse.weddingAnniversary);
        const entry = { ...f, daysUntil: days, type: 'anniversary', date: f.spouse.weddingAnniversary };
        allAnn.push(entry);
        if (days === 0) today.push(entry);
        else if (days === 1) tomorrow.push(entry);
        else if (days <= 7) week.push(entry);
        else if (days <= 30) month.push(entry);
      }
    });

    today.sort((a, b) => a.daysUntil - b.daysUntil);
    return { today, tomorrow, week, month, allAnniversaries: allAnn.sort((a, b) => a.daysUntil - b.daysUntil) };
  }, [friends]);

  const tabs = [
    { label: `Today (${today.length})`, data: today },
    { label: `Tomorrow (${tomorrow.length})`, data: tomorrow },
    { label: `This Week (${week.length})`, data: week },
    { label: `This Month (${month.length})`, data: month },
    { label: `Anniversaries (${allAnniversaries.length})`, data: allAnniversaries },
  ];

  const current = tabs[activeTab];

  return (
    <Box>
      <PageHeader
        title="Reminders"
        subtitle="Stay on top of every special occasion"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Reminders' }]}
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Today's Birthdays", value: today.filter(e => e.type === 'birthday').length, color: '#FF6584', icon: '🎂' },
          { label: "Today's Anniversaries", value: today.filter(e => e.type === 'anniversary').length, color: '#6C63FF', icon: '💍' },
          { label: 'This Week', value: week.length, color: '#FFB347', icon: '📅' },
          { label: 'This Month', value: month.length, color: '#43D4B0', icon: '🗓️' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ bgcolor: alpha(s.color, 0.08), border: `1px solid ${alpha(s.color, 0.2)}` }}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '1.8rem' }}>{s.icon}</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
          </Tabs>
        </Box>
        <CardContent sx={{ p: 2.5 }}>
          {current.data.length === 0 ? (
            <EmptyState
              icon={activeTab === 0 ? '🎉' : '📅'}
              title={`No ${tabs[activeTab].label.split('(')[0].trim().toLowerCase()} reminders`}
              description="Add friends with birthdays and anniversaries to see reminders here"
            />
          ) : (
            current.data.map((entry) => (
              <ReminderRow
                key={`${entry._id}-${entry.type}`}
                name={entry.name}
                photo={entry.photo}
                date={entry.date}
                daysUntil={entry.daysUntil}
                type={entry.type}
                mobile={entry.mobile}
                whatsapp={entry.whatsapp}
                friendId={entry._id}
                navigate={navigate}
              />
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reminders;
