/**
 * WHY: Image gallery gives users beautiful greeting card backgrounds.
 * HOW: Curated Unsplash image categories. Click to download/share.
 *      Using public Unsplash Source API for random themed images.
 */

import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Button, Chip,
  useTheme, alpha, IconButton, Tooltip,
} from '@mui/material';
import { MdDownload, MdShare, MdRefresh } from 'react-icons/md';
import PageHeader from '../components/common/PageHeader';

const CATEGORIES = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂', keywords: 'birthday,cake,celebration', color: '#FF6584' },
  { id: 'flowers', label: 'Flowers', emoji: '🌸', keywords: 'flowers,bouquet', color: '#FF4081' },
  { id: 'balloons', label: 'Balloons', emoji: '🎈', keywords: 'balloons,colorful', color: '#FFB347' },
  { id: 'anniversary', label: 'Anniversary', emoji: '💍', keywords: 'wedding,love,couple', color: '#6C63FF' },
  { id: 'kids', label: 'Kids', emoji: '👶', keywords: 'children,kids,cute', color: '#43D4B0' },
  { id: 'nature', label: 'Nature', emoji: '🌿', keywords: 'nature,beautiful', color: '#4CAF50' },
  { id: 'greeting', label: 'Greeting Cards', emoji: '💌', keywords: 'greeting,gift', color: '#E91E63' },
  { id: 'sunrise', label: 'Good Morning', emoji: '☀️', keywords: 'sunrise,morning', color: '#FF9800' },
];

const ImageCard = ({ category, seed }) => {
  const theme = useTheme();
  const [currentSeed, setCurrentSeed] = useState(seed);

  const imgUrl = `https://source.unsplash.com/400x300/?${category.keywords}&sig=${currentSeed}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wishmate-${category.id}-${currentSeed}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `WishMate — ${category.label}`, url: imgUrl });
    } else {
      navigator.clipboard.writeText(imgUrl);
    }
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={180}
          image={imgUrl}
          alt={category.label}
          sx={{ objectFit: 'cover', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.04)' } }}
          loading="lazy"
        />
        {/* Overlay Actions */}
        <Box
          sx={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 1, opacity: 0, transition: 'all 0.2s ease',
            '&:hover': { background: 'rgba(0,0,0,0.4)', opacity: 1 },
          }}
        >
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }} onClick={handleDownload}>
            <MdDownload style={{ fontSize: '1.2rem' }} />
          </IconButton>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }} onClick={handleShare}>
            <MdShare style={{ fontSize: '1.2rem' }} />
          </IconButton>
          <IconButton
            sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
            onClick={() => setCurrentSeed(Date.now())}
          >
            <MdRefresh style={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>
      </Box>
      <CardContent sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '1.2rem' }}>{category.emoji}</Typography>
        <Typography variant="body2" fontWeight={600}>{category.label}</Typography>
        <Chip
          label="HD"
          size="small"
          sx={{ ml: 'auto', bgcolor: alpha(category.color, 0.12), color: category.color, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
        />
      </CardContent>
    </Card>
  );
};

const Images = () => {
  const [selected, setSelected] = useState(null);

  const display = selected ? CATEGORIES.filter((c) => c.id === selected) : CATEGORIES;
  // Show 2 images per category
  const cards = display.flatMap((cat) => [
    { cat, seed: cat.id + '1' },
    { cat, seed: cat.id + '2' },
    { cat, seed: cat.id + '3' },
  ]);

  return (
    <Box>
      <PageHeader
        title="Images & Cards"
        subtitle="Beautiful greeting card images for every occasion"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Images' }]}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip label="All" onClick={() => setSelected(null)} color={!selected ? 'primary' : 'default'} variant={!selected ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={`${c.emoji} ${c.label}`} onClick={() => setSelected(selected === c.id ? null : c.id)}
            color={selected === c.id ? 'primary' : 'default'} variant={selected === c.id ? 'filled' : 'outlined'} />
        ))}
      </Box>

      <Grid container spacing={2.5}>
        {cards.map(({ cat, seed }, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`${cat.id}-${seed}`}>
            <ImageCard category={cat} seed={i + 100} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Images;
