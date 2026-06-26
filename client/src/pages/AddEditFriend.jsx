import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Tabs, Tab, Typography, Divider,
  IconButton, CircularProgress, Alert, useTheme, alpha, useMediaQuery, Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { MdAdd, MdDelete, MdSave, MdArrowBack, MdPerson, MdFamilyRestroom } from 'react-icons/md';
import { FaRing } from 'react-icons/fa';
import {
  createFriend, updateFriend, fetchFriendById,
} from '../features/friends/friendsSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import PageHeader from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const GENDERS     = ['male', 'female', 'other', 'prefer_not_to_say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONSHIPS = [
  'friend', 'best friend', 'colleague', 'family', 'cousin',
  'neighbor', 'classmate', 'mentor', 'relative', 'other',
];

const EMPTY_FRIEND = {
  name: '', gender: 'prefer_not_to_say', dateOfBirth: null,
  email: '', mobile: '', whatsapp: '',
  address: '', city: '', state: '', country: 'India', pincode: '',
  occupation: '', company: '', bloodGroup: '', relationship: 'friend',
  favoriteColor: '', notes: '', photo: '',
  spouse:  { name: '', birthday: null, weddingAnniversary: null, occupation: '', mobile: '', email: '', photo: '' },
  parents: { fatherName: '', fatherBirthday: null, fatherPhoto: '', motherName: '', motherBirthday: null, motherPhoto: '', parentsAnniversary: null },
  children: [],
};

const EMPTY_CHILD = { name: '', gender: 'male', birthday: null, school: '', photo: '' };

// FIX: SectionLabel must be a Grid item so it sits correctly inside Grid container
const SectionLabel = ({ children }) => (
  <Grid item xs={12}>
    <Typography
      variant="caption"
      sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mt: 1 }}
    >
      {children}
    </Typography>
  </Grid>
);

// Returns true if the spouse object has at least one meaningful field
const hasSpouseData = (s) =>
  !!(s.name || s.email || s.mobile || s.occupation || s.birthday || s.weddingAnniversary || s.photo);

// Returns true if the parents object has at least one meaningful field
const hasParentsData = (p) =>
  !!(p.fatherName || p.fatherBirthday || p.fatherPhoto || p.motherName || p.motherBirthday || p.motherPhoto || p.parentsAnniversary);

const AddEditFriend = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY_FRIEND);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchFriendById(id)).then((res) => {
        if (res.payload) {
          const f = res.payload;
          setForm({
            ...EMPTY_FRIEND, ...f,
            dateOfBirth: f.dateOfBirth ? dayjs(f.dateOfBirth) : null,
            spouse: f.spouse
              ? {
                  ...EMPTY_FRIEND.spouse, ...f.spouse,
                  birthday: f.spouse.birthday ? dayjs(f.spouse.birthday) : null,
                  weddingAnniversary: f.spouse.weddingAnniversary ? dayjs(f.spouse.weddingAnniversary) : null,
                }
              : EMPTY_FRIEND.spouse,
            parents: f.parents
              ? {
                  ...EMPTY_FRIEND.parents, ...f.parents,
                  fatherBirthday: f.parents.fatherBirthday ? dayjs(f.parents.fatherBirthday) : null,
                  motherBirthday: f.parents.motherBirthday ? dayjs(f.parents.motherBirthday) : null,
                  parentsAnniversary: f.parents.parentsAnniversary ? dayjs(f.parents.parentsAnniversary) : null,
                }
              : EMPTY_FRIEND.parents,
            children: (f.children || []).map((c) => ({
              ...c,
              birthday: c.birthday ? dayjs(c.birthday) : null,
            })),
          });
        }
        setLoadingData(false);
      });
    }
  }, [id, isEdit, dispatch]);

  // Generic top-level field setter — works for text inputs AND DatePicker (passes dayjs directly)
  const set = useCallback((field) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e; // dayjs passes value directly
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setSaveError('');
  }, [errors]);

  // Nested field setter for spouse / parents
  const setNested = useCallback((parent, field) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e; // dayjs passes value directly
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: val } }));
    setSaveError('');
  }, []);

  // Children helpers
  const addChild = () =>
    setForm((prev) => ({ ...prev, children: [...prev.children, { ...EMPTY_CHILD }] }));

  const setChild = (idx, field) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e;
    setForm((prev) => {
      const kids = [...prev.children];
      kids[idx] = { ...kids[idx], [field]: val };
      return { ...prev, children: kids };
    });
  };

  const removeChild = (idx) =>
    setForm((prev) => ({ ...prev, children: prev.children.filter((_, i) => i !== idx) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email address';
    if (form.spouse.email && !/^\S+@\S+\.\S+$/.test(form.spouse.email)) e.spouseEmail = 'Invalid spouse email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toISO = (d) => (d && dayjs(d).isValid() ? dayjs(d).toISOString() : null);

  const handleSave = async () => {
    if (!validate()) {
      setTab(0);
      setSaveError('Please fix the highlighted errors before saving.');
      return;
    }

    setSaving(true);
    setSaveError('');

    // FIX: Only send spouse/parents if they actually have data — empty objects trigger Mongoose validators
    const spousePayload = hasSpouseData(form.spouse)
      ? { ...form.spouse, birthday: toISO(form.spouse.birthday), weddingAnniversary: toISO(form.spouse.weddingAnniversary) }
      : null;

    const parentsPayload = hasParentsData(form.parents)
      ? { ...form.parents, fatherBirthday: toISO(form.parents.fatherBirthday), motherBirthday: toISO(form.parents.motherBirthday), parentsAnniversary: toISO(form.parents.parentsAnniversary) }
      : null;

    const payload = {
      ...form,
      dateOfBirth: toISO(form.dateOfBirth),
      spouse: spousePayload,
      parents: parentsPayload,
      children: form.children
        .filter((c) => c.name?.trim()) // skip blank child rows
        .map((c) => ({ ...c, birthday: toISO(c.birthday) })),
    };

    const action = isEdit
      ? updateFriend({ id, updates: payload })
      : createFriend(payload);

    const res = await dispatch(action);
    setSaving(false);

    if (!res.error) {
      dispatch(showSnackbar({ message: isEdit ? 'Friend updated successfully!' : 'Friend added successfully!', severity: 'success' }));
      navigate(isEdit ? `/friends/${id}` : '/friends');
    } else {
      const errMsg = res.payload || 'Failed to save. Please try again.';
      setSaveError(errMsg);
      dispatch(showSnackbar({ message: errMsg, severity: 'error' }));
    }
  };

  if (loadingData) return <LoadingSpinner message="Loading friend details..." />;

  const ip = { size: 'small', fullWidth: true }; // shared inputProps shorthand

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Friend' : 'Add New Friend'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Friends', path: '/friends' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
        actions={
          <>
            <Button startIcon={<MdArrowBack />} onClick={() => navigate(-1)} variant="outlined" size="small">
              Back
            </Button>
            {!isMobile && (
              <Button
                startIcon={saving ? <CircularProgress size={16} /> : <MdSave />}
                onClick={handleSave}
                variant="contained"
                disabled={saving}
              >
                {isEdit ? 'Save Changes' : 'Add Friend'}
              </Button>
            )}
          </>
        }
      />

      {saveError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSaveError('')}>
          {saveError}
        </Alert>
      )}

      <Card>
        {/* Tabs — Tab must be DIRECT children of Tabs (no Fragment wrapper).
              React.Children.map treats Fragments as one opaque child, breaking value matching. */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab
              label={isMobile ? 'Info' : 'Personal Info'}
              icon={isMobile ? null : <MdPerson />}
              iconPosition="start"
            />
            <Tab
              label={isMobile ? 'Spouse' : 'Spouse & Anniversary'}
              icon={isMobile ? null : <FaRing />}
              iconPosition="start"
            />
            <Tab
              label="Children"
              icon={isMobile ? null : <MdFamilyRestroom />}
              iconPosition="start"
            />
            <Tab
              label="Parents"
              icon={isMobile ? null : <MdFamilyRestroom />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

          {/* ── TAB 0: Personal Info ───────────────────────────────────── */}
          {tab === 0 && (
            <Grid container spacing={2}>
              <SectionLabel>Basic Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Full Name *" value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...ip}>
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender} label="Gender" onChange={set('gender')}>
                    {GENDERS.map((g) => (
                      <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>
                        {g.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Birth"
                  value={form.dateOfBirth}
                  onChange={set('dateOfBirth')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...ip}>
                  <InputLabel>Relationship</InputLabel>
                  <Select value={form.relationship} label="Relationship" onChange={set('relationship')}>
                    {RELATIONSHIPS.map((r) => (
                      <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...ip}>
                  <InputLabel>Blood Group</InputLabel>
                  <Select value={form.bloodGroup} label="Blood Group" onChange={set('bloodGroup')}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {BLOOD_GROUPS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Favorite Color" value={form.favoriteColor} onChange={set('favoriteColor')} />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>
              <SectionLabel>Contact Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Email" value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Mobile" value={form.mobile} onChange={set('mobile')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="WhatsApp Number" value={form.whatsapp} onChange={set('whatsapp')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Photo URL" value={form.photo} onChange={set('photo')} />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>
              <SectionLabel>Address</SectionLabel>

              <Grid item xs={12}>
                <TextField {...ip} label="Street Address" value={form.address} onChange={set('address')} multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...ip} label="City" value={form.city} onChange={set('city')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...ip} label="State" value={form.state} onChange={set('state')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...ip} label="Country" value={form.country} onChange={set('country')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Pincode" value={form.pincode} onChange={set('pincode')} />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>
              <SectionLabel>Professional</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Occupation" value={form.occupation} onChange={set('occupation')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Company" value={form.company} onChange={set('company')} />
              </Grid>
              <Grid item xs={12}>
                <TextField {...ip} label="Notes" value={form.notes} onChange={set('notes')} multiline rows={3} />
              </Grid>
            </Grid>
          )}

          {/* ── TAB 1: Spouse ─────────────────────────────────────────── */}
          {tab === 1 && (
            <Grid container spacing={2}>
              <SectionLabel>Spouse / Partner Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Spouse Name" value={form.spouse.name} onChange={setNested('spouse', 'name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...ip}
                  label="Spouse Email"
                  value={form.spouse.email}
                  onChange={setNested('spouse', 'email')}
                  error={!!errors.spouseEmail}
                  helperText={errors.spouseEmail}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Spouse Mobile" value={form.spouse.mobile} onChange={setNested('spouse', 'mobile')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Spouse Occupation" value={form.spouse.occupation} onChange={setNested('spouse', 'occupation')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Spouse Birthday"
                  value={form.spouse.birthday}
                  onChange={setNested('spouse', 'birthday')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Wedding Anniversary"
                  value={form.spouse.weddingAnniversary}
                  onChange={setNested('spouse', 'weddingAnniversary')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...ip} label="Spouse Photo URL" value={form.spouse.photo} onChange={setNested('spouse', 'photo')} />
              </Grid>

              {/* Live preview of what will be saved */}
              {hasSpouseData(form.spouse) && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Spouse details will be saved with this friend.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* ── TAB 2: Children ───────────────────────────────────────── */}
          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Children ({form.children.length})
                </Typography>
                <Button startIcon={<MdAdd />} onClick={addChild} variant="outlined" size="small">
                  Add Child
                </Button>
              </Box>

              {form.children.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ fontSize: '3rem' }}>👶</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>No children added yet</Typography>
                  <Button variant="outlined" startIcon={<MdAdd />} onClick={addChild}>
                    Add First Child
                  </Button>
                </Box>
              ) : (
                form.children.map((child, idx) => (
                  <Card
                    key={idx}
                    sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Child {idx + 1}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => removeChild(idx)}>
                          <MdDelete />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField {...ip} label="Child Name" value={child.name} onChange={setChild(idx, 'name')} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl {...ip}>
                            <InputLabel>Gender</InputLabel>
                            <Select value={child.gender} label="Gender" onChange={setChild(idx, 'gender')}>
                              <MenuItem value="male">Male</MenuItem>
                              <MenuItem value="female">Female</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Birthday"
                            value={child.birthday}
                            onChange={setChild(idx, 'birthday')}
                            slotProps={{ textField: { ...ip } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField {...ip} label="School / College" value={child.school} onChange={setChild(idx, 'school')} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField {...ip} label="Photo URL" value={child.photo} onChange={setChild(idx, 'photo')} />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}

          {/* ── TAB 3: Parents ────────────────────────────────────────── */}
          {tab === 3 && (
            <Grid container spacing={2}>
              <SectionLabel>Father's Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Father's Name" value={form.parents.fatherName} onChange={setNested('parents', 'fatherName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Father's Birthday"
                  value={form.parents.fatherBirthday}
                  onChange={setNested('parents', 'fatherBirthday')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...ip} label="Father's Photo URL" value={form.parents.fatherPhoto} onChange={setNested('parents', 'fatherPhoto')} />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>
              <SectionLabel>Mother's Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...ip} label="Mother's Name" value={form.parents.motherName} onChange={setNested('parents', 'motherName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Mother's Birthday"
                  value={form.parents.motherBirthday}
                  onChange={setNested('parents', 'motherBirthday')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...ip} label="Mother's Photo URL" value={form.parents.motherPhoto} onChange={setNested('parents', 'motherPhoto')} />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>
              <SectionLabel>Parents' Anniversary</SectionLabel>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Parents' Wedding Anniversary"
                  value={form.parents.parentsAnniversary}
                  onChange={setNested('parents', 'parentsAnniversary')}
                  slotProps={{ textField: { ...ip } }}
                />
              </Grid>

              {hasParentsData(form.parents) && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Parents' details will be saved with this friend.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* Desktop Save Bar */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : <MdSave />}
              >
                {isEdit ? 'Save Changes' : 'Add Friend'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Mobile sticky save bar — sits above the bottom nav */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 60,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.drawer,
            p: 1.5,
            display: 'flex',
            gap: 1.5,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button fullWidth variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <MdSave />}
          >
            {isEdit ? 'Save' : 'Add Friend'}
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default AddEditFriend;
