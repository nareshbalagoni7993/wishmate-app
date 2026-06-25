/**
 * WHY: One component handles both Add and Edit by checking if URL has an :id param.
 * WHAT: Multi-tab form covering Personal Info, Family (Spouse, Children, Parents).
 * HOW: MUI Tabs for sections. DatePicker from @mui/x-date-pickers for date fields.
 *      Field state managed with useState (no heavy form library for this use case).
 * PRODUCTION STANDARD: Validation is done before dispatch. Backend also validates (defense in depth).
 * INTERVIEW Q: react-hook-form vs useState for forms?
 *   react-hook-form: better for large forms (uncontrolled inputs = fewer re-renders).
 *   useState: simpler for medium forms where all fields needed simultaneously.
 */

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
  createFriend, updateFriend, fetchFriendById, selectCurrentFriend,
} from '../features/friends/friendsSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import PageHeader from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONSHIPS = ['friend', 'best friend', 'colleague', 'family', 'cousin', 'neighbor', 'classmate', 'mentor', 'relative', 'other'];

const EMPTY_FRIEND = {
  name: '', gender: 'prefer_not_to_say', dateOfBirth: null, email: '', mobile: '', whatsapp: '',
  address: '', city: '', state: '', country: 'India', pincode: '',
  occupation: '', company: '', bloodGroup: '', relationship: 'friend',
  favoriteColor: '', notes: '', photo: '',
  spouse: { name: '', birthday: null, weddingAnniversary: null, occupation: '', mobile: '', email: '', photo: '' },
  parents: { fatherName: '', fatherBirthday: null, fatherPhoto: '', motherName: '', motherBirthday: null, motherPhoto: '', parentsAnniversary: null },
  children: [],
};

const EMPTY_CHILD = { name: '', gender: 'male', birthday: null, school: '', photo: '' };

const SectionLabel = ({ children }) => (
  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2, mt: 1 }}>
    {children}
  </Typography>
);

const AddEditFriend = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentFriend = useSelector(selectCurrentFriend);

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY_FRIEND);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  // Load friend data for edit mode
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchFriendById(id)).then((res) => {
        if (res.payload) {
          const f = res.payload;
          setForm({
            ...EMPTY_FRIEND, ...f,
            dateOfBirth: f.dateOfBirth ? dayjs(f.dateOfBirth) : null,
            spouse: f.spouse ? {
              ...EMPTY_FRIEND.spouse, ...f.spouse,
              birthday: f.spouse.birthday ? dayjs(f.spouse.birthday) : null,
              weddingAnniversary: f.spouse.weddingAnniversary ? dayjs(f.spouse.weddingAnniversary) : null,
            } : EMPTY_FRIEND.spouse,
            parents: f.parents ? {
              ...EMPTY_FRIEND.parents, ...f.parents,
              fatherBirthday: f.parents.fatherBirthday ? dayjs(f.parents.fatherBirthday) : null,
              motherBirthday: f.parents.motherBirthday ? dayjs(f.parents.motherBirthday) : null,
              parentsAnniversary: f.parents.parentsAnniversary ? dayjs(f.parents.parentsAnniversary) : null,
            } : EMPTY_FRIEND.parents,
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

  const set = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const setNested = useCallback((parent, field) => (e) => {
    const val = e?.target?.value ?? e;
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: val } }));
  }, []);

  const addChild = () => {
    setForm((prev) => ({ ...prev, children: [...prev.children, { ...EMPTY_CHILD }] }));
  };

  const setChild = (idx, field) => (e) => {
    const val = e?.target?.value ?? e;
    setForm((prev) => {
      const kids = [...prev.children];
      kids[idx] = { ...kids[idx], [field]: val };
      return { ...prev, children: kids };
    });
  };

  const removeChild = (idx) => {
    setForm((prev) => ({ ...prev, children: prev.children.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toISO = (d) => (d && dayjs(d).isValid() ? dayjs(d).toISOString() : null);

  const handleSave = async () => {
    if (!validate()) { setTab(0); return; }
    setSaving(true);
    const payload = {
      ...form,
      dateOfBirth: toISO(form.dateOfBirth),
      spouse: {
        ...form.spouse,
        birthday: toISO(form.spouse.birthday),
        weddingAnniversary: toISO(form.spouse.weddingAnniversary),
      },
      parents: {
        ...form.parents,
        fatherBirthday: toISO(form.parents.fatherBirthday),
        motherBirthday: toISO(form.parents.motherBirthday),
        parentsAnniversary: toISO(form.parents.parentsAnniversary),
      },
      children: form.children.map((c) => ({ ...c, birthday: toISO(c.birthday) })),
    };

    const action = isEdit
      ? updateFriend({ id, updates: payload })
      : createFriend(payload);

    const res = await dispatch(action);
    setSaving(false);

    if (!res.error) {
      dispatch(showSnackbar({ message: isEdit ? 'Friend updated!' : 'Friend added!', severity: 'success' }));
      navigate(isEdit ? `/friends/${id}` : '/friends');
    } else {
      dispatch(showSnackbar({ message: res.payload || 'Save failed', severity: 'error' }));
    }
  };

  if (loadingData) return <LoadingSpinner message="Loading friend details..." />;

  const inputProps = { size: 'small', fullWidth: true };

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
            <Button startIcon={<MdArrowBack />} onClick={() => navigate(-1)} variant="outlined">
              Back
            </Button>
            <Button
              startIcon={saving ? <CircularProgress size={16} /> : <MdSave />}
              onClick={handleSave}
              variant="contained"
              disabled={saving}
            >
              {isEdit ? 'Save Changes' : 'Add Friend'}
            </Button>
          </>
        }
      />

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Please fix the errors before saving.
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {isMobile ? (
              <>
                <Tab label="Info" />
                <Tab label="Spouse" />
                <Tab label="Children" />
                <Tab label="Parents" />
              </>
            ) : (
              <>
                <Tab icon={<MdPerson />} iconPosition="start" label="Personal Info" />
                <Tab icon={<FaRing />} iconPosition="start" label="Spouse & Anniversary" />
                <Tab icon={<MdFamilyRestroom />} iconPosition="start" label="Children" />
                <Tab icon={<MdFamilyRestroom />} iconPosition="start" label="Parents" />
              </>
            )}
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* ── TAB 0: Personal Info ──────────────────────────────────────── */}
          {tab === 0 && (
            <Grid container spacing={2.5}>
              <SectionLabel>Basic Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Full Name *" value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...inputProps}>
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender} label="Gender" onChange={set('gender')}>
                    {GENDERS.map((g) => <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace(/_/g, ' ')}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Birth"
                  value={form.dateOfBirth}
                  onChange={set('dateOfBirth')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...inputProps}>
                  <InputLabel>Relationship</InputLabel>
                  <Select value={form.relationship} label="Relationship" onChange={set('relationship')}>
                    {RELATIONSHIPS.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl {...inputProps}>
                  <InputLabel>Blood Group</InputLabel>
                  <Select value={form.bloodGroup} label="Blood Group" onChange={set('bloodGroup')}>
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {BLOOD_GROUPS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Favorite Color" value={form.favoriteColor} onChange={set('favoriteColor')} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <SectionLabel>Contact Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Email" value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Mobile" value={form.mobile} onChange={set('mobile')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="WhatsApp Number" value={form.whatsapp} onChange={set('whatsapp')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Photo URL" value={form.photo} onChange={set('photo')} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <SectionLabel>Address</SectionLabel>

              <Grid item xs={12}>
                <TextField {...inputProps} label="Street Address" value={form.address} onChange={set('address')} multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...inputProps} label="City" value={form.city} onChange={set('city')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...inputProps} label="State" value={form.state} onChange={set('state')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField {...inputProps} label="Country" value={form.country} onChange={set('country')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Pincode" value={form.pincode} onChange={set('pincode')} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <SectionLabel>Professional</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Occupation" value={form.occupation} onChange={set('occupation')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Company" value={form.company} onChange={set('company')} />
              </Grid>

              <Grid item xs={12}>
                <TextField {...inputProps} label="Notes" value={form.notes} onChange={set('notes')} multiline rows={3} />
              </Grid>
            </Grid>
          )}

          {/* ── TAB 1: Spouse ──────────────────────────────────────────────── */}
          {tab === 1 && (
            <Grid container spacing={2.5}>
              <SectionLabel>Spouse Information</SectionLabel>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Spouse Name" value={form.spouse.name} onChange={setNested('spouse', 'name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Spouse Email" value={form.spouse.email} onChange={setNested('spouse', 'email')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Spouse Mobile" value={form.spouse.mobile} onChange={setNested('spouse', 'mobile')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Spouse Occupation" value={form.spouse.occupation} onChange={setNested('spouse', 'occupation')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Spouse Birthday"
                  value={form.spouse.birthday}
                  onChange={setNested('spouse', 'birthday')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Wedding Anniversary"
                  value={form.spouse.weddingAnniversary}
                  onChange={setNested('spouse', 'weddingAnniversary')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...inputProps} label="Spouse Photo URL" value={form.spouse.photo} onChange={setNested('spouse', 'photo')} />
              </Grid>
            </Grid>
          )}

          {/* ── TAB 2: Children ────────────────────────────────────────────── */}
          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Children ({form.children.length})</Typography>
                <Button startIcon={<MdAdd />} onClick={addChild} variant="outlined" size="small">
                  Add Child
                </Button>
              </Box>
              {form.children.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ fontSize: '3rem' }}>👶</Typography>
                  <Typography color="text.secondary">No children added yet</Typography>
                </Box>
              )}
              {form.children.map((child, idx) => (
                <Card key={idx} sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Child {idx + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeChild(idx)}>
                        <MdDelete />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField {...inputProps} label="Child Name" value={child.name} onChange={setChild(idx, 'name')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl {...inputProps}>
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
                          slotProps={{ textField: { ...inputProps } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField {...inputProps} label="School" value={child.school} onChange={setChild(idx, 'school')} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField {...inputProps} label="Photo URL" value={child.photo} onChange={setChild(idx, 'photo')} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* ── TAB 3: Parents ─────────────────────────────────────────────── */}
          {tab === 3 && (
            <Grid container spacing={2.5}>
              <SectionLabel>Father's Information</SectionLabel>
              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Father's Name" value={form.parents.fatherName} onChange={setNested('parents', 'fatherName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Father's Birthday"
                  value={form.parents.fatherBirthday}
                  onChange={setNested('parents', 'fatherBirthday')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...inputProps} label="Father's Photo URL" value={form.parents.fatherPhoto} onChange={setNested('parents', 'fatherPhoto')} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <SectionLabel>Mother's Information</SectionLabel>

              <Grid item xs={12} sm={6}>
                <TextField {...inputProps} label="Mother's Name" value={form.parents.motherName} onChange={setNested('parents', 'motherName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Mother's Birthday"
                  value={form.parents.motherBirthday}
                  onChange={setNested('parents', 'motherBirthday')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...inputProps} label="Mother's Photo URL" value={form.parents.motherPhoto} onChange={setNested('parents', 'motherPhoto')} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
              <SectionLabel>Parents' Anniversary</SectionLabel>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Parents' Anniversary"
                  value={form.parents.parentsAnniversary}
                  onChange={setNested('parents', 'parentsAnniversary')}
                  slotProps={{ textField: { ...inputProps } }}
                />
              </Grid>
            </Grid>
          )}

          {/* Action Buttons — desktop inline, mobile is sticky bar below */}
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

      {/* Mobile sticky save bar */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 60, // above bottom nav
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
