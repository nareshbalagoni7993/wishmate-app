/**
 * WHY: Date logic is scattered and error-prone. Centralizing here means
 *      one fix propagates everywhere.
 * HOW: Uses native JS Date (no library dep) for basic ops.
 *      dayjs is available for complex formatting.
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(format);
};

export const getAge = (dob) => {
  if (!dob) return null;
  const today = dayjs();
  const birth = dayjs(dob);
  return today.diff(birth, 'year');
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const today = dayjs();
  const d = dayjs(date);
  let next = dayjs().year(today.year()).month(d.month()).date(d.date());
  if (next.isBefore(today, 'day')) next = next.add(1, 'year');
  return next.diff(today, 'day');
};

export const isToday = (date) => {
  if (!date) return false;
  const d = dayjs(date);
  const today = dayjs();
  return d.month() === today.month() && d.date() === today.date();
};

export const isTomorrow = (date) => {
  if (!date) return false;
  const d = dayjs(date);
  const tomorrow = dayjs().add(1, 'day');
  return d.month() === tomorrow.month() && d.date() === tomorrow.date();
};

export const getZodiacSign = (dob) => {
  if (!dob) return '';
  const d = dayjs(dob);
  const month = d.month() + 1;
  const day = d.date();
  const signs = [
    { sign: 'Capricorn', emoji: '♑', end: [1, 19] },
    { sign: 'Aquarius', emoji: '♒', end: [2, 18] },
    { sign: 'Pisces', emoji: '♓', end: [3, 20] },
    { sign: 'Aries', emoji: '♈', end: [4, 19] },
    { sign: 'Taurus', emoji: '♉', end: [5, 20] },
    { sign: 'Gemini', emoji: '♊', end: [6, 20] },
    { sign: 'Cancer', emoji: '♋', end: [7, 22] },
    { sign: 'Leo', emoji: '♌', end: [8, 22] },
    { sign: 'Virgo', emoji: '♍', end: [9, 22] },
    { sign: 'Libra', emoji: '♎', end: [10, 22] },
    { sign: 'Scorpio', emoji: '♏', end: [11, 21] },
    { sign: 'Sagittarius', emoji: '♐', end: [12, 21] },
    { sign: 'Capricorn', emoji: '♑', end: [12, 31] },
  ];
  for (const s of signs) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return `${s.emoji} ${s.sign}`;
  }
  return '';
};

export const getBirthdayBadge = (dob) => {
  const days = getDaysUntil(dob);
  if (days === null) return null;
  if (days === 0) return { label: 'Today!', color: 'error', icon: '🎂' };
  if (days === 1) return { label: 'Tomorrow', color: 'warning', icon: '🎁' };
  if (days <= 7) return { label: `${days} days`, color: 'secondary', icon: '🎉' };
  if (days <= 30) return { label: `${days} days`, color: 'primary', icon: '📅' };
  return null;
};

export const getAnniversaryYears = (weddingDate) => {
  if (!weddingDate) return null;
  return dayjs().diff(dayjs(weddingDate), 'year');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};
