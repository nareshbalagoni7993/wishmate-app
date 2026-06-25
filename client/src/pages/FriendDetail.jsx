import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Card, CardContent, Box, Typography, Avatar, Chip, Button,
  Divider, Tabs, Tab, IconButton, Tooltip, useTheme, alpha, List,
  ListItem, ListItemIcon, ListItemText, useMediaQuery,
} from '@mui/material';
import {
  MdEdit, MdDelete, MdFavorite, MdFavoriteBorder, MdWhatsapp, MdPhone,
  MdEmail, MdLocationOn, MdWork, MdCake, MdArrowBack,
} from 'react-icons/md';
import { FaRing, FaTint } from 'react-icons/fa';
import {
  fetchFriendById, toggleFavorite, deleteFriend,
  selectCurrentFriend,
} from '../features/friends/friendsSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, getAge, getDaysUntil, getZodiacSign, getAnniversaryYears, getBirthdayBadge } from '../utils/dateUtils';
import { shareToWhatsApp } from '../utils/exportUtils';
import { getRandomQuote } from '../utils/quoteUtils';

const InfoRow = ({ icon: Icon, label, value, color }) => {
  if (!value) return null;
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Icon style={{ fontSize: '1.1rem', color: color || '#6B7280' }} />
      </ListItemIcon>
      <ListItemText
        primary={<Typography variant="caption" color="text.secondary">{label}</Typography>}
        secondary={<Typography variant="body2" fontWeight={500}>{value}</Typography>}
        sx={{ my: 0 }}
      />
    </ListItem>
  );
};

const FamilyMemberCard = ({ name, photo, label, birthday, extra }) => {
  const theme = useTheme();
  if (!name) return null;
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, mb: 1.5,
      }}
    >
      <Avatar src={photo} sx={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)', fontWeight: 700, flexShrink: 0 }}>
        {name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{name}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {birthday && <Typography variant="caption" color="text.secondary" display="block">🎂 {formatDate(birthday)}</Typography>}
        {extra && <Typography variant="caption" color="primary">{extra}</Typography>}
      </Box>
    </Box>
  );
};

const FriendDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const friend = useSelector(selectCurrentFriend);
  const [tab, setTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchFriendById(id)).finally(() => setLoading(false));
  }, [id, dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteFriend(id));
    dispatch(showSnackbar({ message: 'Friend moved to recycle bin', severity: 'info' }));
    navigate('/friends');
  };

  const handleWishBirthday = () => {
    if (!friend) return;
    const quote = getRandomQuote('birthday');
    const msg = `🎂 Happy Birthday ${friend.name}!\n\n${quote}\n\n— Sent with WishMate`;
    if (friend.whatsapp || friend.mobile) {
      shareToWhatsApp(msg);
    } else {
      navigator.clipboard.writeText(msg);
      dispatch(showSnackbar({ message: 'Birthday wish copied!', severity: 'success' }));
    }
  };

  if (loading) return <LoadingSpinner message="Loading friend profile..." />;
  if (!friend) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography>Friend not found.</Typography>
      <Button onClick={() => navigate('/friends')} sx={{ mt: 2 }}>Back to Friends</Button>
    </Box>
  );

  const age = getAge(friend.dateOfBirth);
  const birthdayBadge = getBirthdayBadge(friend.dateOfBirth);
  const zodiac = getZodiacSign(friend.dateOfBirth);
  const anniversaryYears = getAnniversaryYears(friend.spouse?.weddingAnniversary);
  const daysUntilBirthday = getDaysUntil(friend.dateOfBirth);
  const genderColor = friend.gender === 'male' ? '#6C63FF' : friend.gender === 'female' ? '#FF6584' : '#43D4B0';

  // Mobile: show icon buttons only; Desktop: full text buttons
  const mobileActions = (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="Back">
        <IconButton size="small" onClick={() => navigate('/friends')} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <MdArrowBack />
        </IconButton>
      </Tooltip>
      <Tooltip title="Send Birthday Wish">
        <IconButton size="small" onClick={handleWishBirthday} sx={{ bgcolor: '#25D36615', color: '#25D366', border: '1px solid #25D36640' }}>
          <MdWhatsapp />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => navigate(`/friends/${id}/edit`)} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <MdEdit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => setDeleteDialog(true)} sx={{ bgcolor: 'error.lighter', color: 'error.main', border: '1px solid', borderColor: 'error.light' }}>
          <MdDelete />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const desktopActions = (
    <>
      <Button startIcon={<MdArrowBack />} variant="outlined" size="small" onClick={() => navigate('/friends')}>Back</Button>
      <Button startIcon={<MdWhatsapp />} variant="outlined" size="small" color="success" onClick={handleWishBirthday}
        sx={{ color: '#25D366', borderColor: '#25D366' }}>
        Send Wish
      </Button>
      <Button startIcon={<MdEdit />} variant="outlined" size="small" onClick={() => navigate(`/friends/${id}/edit`)}>Edit</Button>
      <Button startIcon={<MdDelete />} variant="outlined" size="small" color="error" onClick={() => setDeleteDialog(true)}>Delete</Button>
    </>
  );

  return (
    <Box>
      <PageHeader
        title={friend.name}
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Friends', path: '/friends' }, { label: friend.name }]}
        actions={isMobile ? mobileActions : desktopActions}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={friend.photo}
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: { xs: 80, sm: 100 },
                    mx: 'auto',
                    background: `linear-gradient(135deg, ${genderColor} 0%, ${alpha(genderColor, 0.6)} 100%)`,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    fontWeight: 700,
                    border: `3px solid ${alpha(genderColor, 0.3)}`,
                    boxShadow: `0 8px 24px ${alpha(genderColor, 0.3)}`,
                  }}
                >
                  {friend.name?.[0]?.toUpperCase()}
                </Avatar>
                {birthdayBadge && (
                  <Box sx={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: '50%', bgcolor: 'error.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', border: `2px solid ${theme.palette.background.paper}`,
                  }}>
                    {birthdayBadge.icon}
                  </Box>
                )}
              </Box>

              <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>{friend.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {friend.relationship}{friend.occupation ? ` · ${friend.occupation}` : ''}
              </Typography>
              {zodiac && <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>{zodiac}</Typography>}

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {friend.gender && (
                  <Chip label={friend.gender.replace(/_/g, ' ')} size="small" sx={{ textTransform: 'capitalize', bgcolor: alpha(genderColor, 0.1), color: genderColor, fontWeight: 600 }} />
                )}
                {age !== null && <Chip label={`Age ${age}`} size="small" />}
                {friend.bloodGroup && <Chip label={friend.bloodGroup} size="small" color="error" variant="outlined" />}
              </Box>

              {daysUntilBirthday !== null && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(daysUntilBirthday === 0 ? '#FF6584' : '#6C63FF', 0.08), border: `1px solid ${alpha(daysUntilBirthday === 0 ? '#FF6584' : '#6C63FF', 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">
                    {daysUntilBirthday === 0 ? '🎉 Birthday is TODAY!' : `🎂 Birthday in ${daysUntilBirthday} days`}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={() => dispatch(toggleFavorite(friend._id))}
                  sx={{ border: `1px solid ${alpha('#FF6584', 0.3)}`, borderRadius: 2, px: 2 }}
                >
                  {friend.isFavorite
                    ? <MdFavorite style={{ color: '#FF6584', fontSize: '1.2rem' }} />
                    : <MdFavoriteBorder style={{ fontSize: '1.2rem' }} />
                  }
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {friend.isFavorite ? 'Favorited' : 'Favorite'}
                  </Typography>
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {(friend.whatsapp || friend.mobile) && (
                  <Tooltip title={`WhatsApp: ${friend.whatsapp || friend.mobile}`}>
                    <IconButton
                      sx={{ bgcolor: '#25D36618', color: '#25D366' }}
                      onClick={() => { const n = (friend.whatsapp || friend.mobile).replace(/\D/g, ''); window.open(`https://wa.me/${n}`, '_blank'); }}
                    >
                      <MdWhatsapp />
                    </IconButton>
                  </Tooltip>
                )}
                {friend.mobile && (
                  <Tooltip title={`Call: ${friend.mobile}`}>
                    <IconButton sx={{ bgcolor: alpha('#6C63FF', 0.1), color: '#6C63FF' }} onClick={() => window.open(`tel:${friend.mobile}`)}>
                      <MdPhone />
                    </IconButton>
                  </Tooltip>
                )}
                {friend.email && (
                  <Tooltip title={`Email: ${friend.email}`}>
                    <IconButton sx={{ bgcolor: alpha('#FF6584', 0.1), color: '#FF6584' }} onClick={() => window.open(`mailto:${friend.email}`)}>
                      <MdEmail />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detail Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
                <Tab label="Personal" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                <Tab label="Family" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                <Tab label="Notes" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
              </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {tab === 0 && (
                <Grid container spacing={{ xs: 1, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="primary" fontWeight={700}>Contact</Typography>
                    <List dense>
                      <InfoRow icon={MdEmail} label="Email" value={friend.email} color="#FF6584" />
                      <InfoRow icon={MdPhone} label="Mobile" value={friend.mobile} color="#6C63FF" />
                      <InfoRow icon={MdWhatsapp} label="WhatsApp" value={friend.whatsapp} color="#25D366" />
                    </List>
                    <Typography variant="overline" color="primary" fontWeight={700} sx={{ mt: 2, display: 'block' }}>Personal</Typography>
                    <List dense>
                      <InfoRow icon={MdCake} label="Date of Birth" value={`${formatDate(friend.dateOfBirth)}${age ? ` (Age ${age})` : ''}`} color="#FF6584" />
                      <InfoRow icon={FaTint} label="Blood Group" value={friend.bloodGroup} color="#FF5252" />
                      <InfoRow icon={MdWork} label="Occupation" value={friend.occupation ? `${friend.occupation}${friend.company ? ` at ${friend.company}` : ''}` : null} />
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="primary" fontWeight={700}>Address</Typography>
                    <List dense>
                      <InfoRow icon={MdLocationOn} label="Location" value={[friend.address, friend.city, friend.state, friend.country].filter(Boolean).join(', ')} color="#43D4B0" />
                    </List>
                    {friend.favoriteColor && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: friend.favoriteColor, border: '2px solid rgba(0,0,0,0.1)' }} />
                        <Typography variant="body2">Favorite Color: <strong>{friend.favoriteColor}</strong></Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <Box>
                  {friend.spouse?.name && (
                    <>
                      <Typography variant="overline" color="primary" fontWeight={700} gutterBottom display="block">Spouse</Typography>
                      <FamilyMemberCard
                        name={friend.spouse.name}
                        photo={friend.spouse.photo}
                        label={`Birthday: ${formatDate(friend.spouse.birthday) || '—'}`}
                        extra={friend.spouse.weddingAnniversary ? `💍 Anniversary: ${formatDate(friend.spouse.weddingAnniversary)}${anniversaryYears ? ` (${anniversaryYears}y)` : ''}` : null}
                      />
                    </>
                  )}
                  {friend.children?.length > 0 && (
                    <>
                      <Typography variant="overline" color="primary" fontWeight={700} gutterBottom display="block" sx={{ mt: 2 }}>
                        Children ({friend.children.length})
                      </Typography>
                      {friend.children.map((child, idx) => (
                        <FamilyMemberCard key={idx} name={child.name} photo={child.photo} label={`${child.gender || ''} · ${child.school || ''}`} birthday={child.birthday} />
                      ))}
                    </>
                  )}
                  {(friend.parents?.fatherName || friend.parents?.motherName) && (
                    <>
                      <Typography variant="overline" color="primary" fontWeight={700} gutterBottom display="block" sx={{ mt: 2 }}>Parents</Typography>
                      {friend.parents.fatherName && (
                        <FamilyMemberCard name={friend.parents.fatherName} photo={friend.parents.fatherPhoto} label="Father" birthday={friend.parents.fatherBirthday} />
                      )}
                      {friend.parents.motherName && (
                        <FamilyMemberCard name={friend.parents.motherName} photo={friend.parents.motherPhoto} label="Mother" birthday={friend.parents.motherBirthday} />
                      )}
                      {friend.parents.parentsAnniversary && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          💑 Parents' Anniversary: <strong>{formatDate(friend.parents.parentsAnniversary)}</strong>
                        </Typography>
                      )}
                    </>
                  )}
                  {!friend.spouse?.name && !friend.children?.length && !friend.parents?.fatherName && !friend.parents?.motherName && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography sx={{ fontSize: '3rem' }}>👨‍👩‍👧</Typography>
                      <Typography color="text.secondary">No family details added yet</Typography>
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(`/friends/${id}/edit`)}>
                        Add Family Details
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  {friend.notes ? (
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{friend.notes}</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography sx={{ fontSize: '3rem' }}>📝</Typography>
                      <Typography color="text.secondary">No notes added yet</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Friend"
        message={`Move "${friend.name}" to recycle bin?`}
      />
    </Box>
  );
};

export default FriendDetail;
