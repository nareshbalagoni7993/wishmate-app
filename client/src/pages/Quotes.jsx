/**
 * WHY: Quotes page lets users copy/share festival and occasion wishes instantly.
 * HOW: Static quote data, categorized. Random quote per category on click.
 *      One-click copy + WhatsApp share.
 */

import React, { useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton,
  Tooltip, alpha, useTheme, Fade,
} from '@mui/material';
import { MdContentCopy, MdWhatsapp, MdRefresh, MdCheck } from 'react-icons/md';
import PageHeader from '../components/common/PageHeader';
import { QUOTES, QUOTE_CATEGORIES, getRandomQuote } from '../utils/quoteUtils';
import { shareToWhatsApp } from '../utils/exportUtils';

const QuoteCard = ({ category, quote, onRefresh, onCopy, copied }) => {
  const theme = useTheme();

  const handleWhatsApp = () => shareToWhatsApp(quote);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(category.color, 0.15)} 0%, rgba(255,255,255,0.03) 100%)`
          : `linear-gradient(135deg, ${alpha(category.color, 0.08)} 0%, rgba(255,255,255,0.95) 100%)`,
        border: `1px solid ${alpha(category.color, 0.2)}`,
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${category.color} 0%, ${alpha(category.color, 0.7)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            {category.icon}
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ color: category.color }}>
            {category.label}
          </Typography>
          <Tooltip title="New Quote">
            <IconButton size="small" onClick={onRefresh} sx={{ ml: 'auto', color: category.color }}>
              <MdRefresh style={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quote Text */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${alpha(category.color, 0.15)}`,
            mb: 2,
            position: 'relative',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.8,
              fontStyle: 'italic',
              color: 'text.primary',
              '&::before': { content: '"\\201C"', fontSize: '1.5rem', color: category.color, lineHeight: 0, verticalAlign: '-0.4em', mr: 0.3 },
              '&::after': { content: '"\\201D"', fontSize: '1.5rem', color: category.color, lineHeight: 0, verticalAlign: '-0.4em', ml: 0.3 },
            }}
          >
            {quote}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={copied ? <MdCheck /> : <MdContentCopy />}
            onClick={onCopy}
            sx={{
              flex: 1,
              borderColor: alpha(category.color, 0.4),
              color: category.color,
              '&:hover': { borderColor: category.color, bgcolor: alpha(category.color, 0.06) },
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<MdWhatsapp />}
            onClick={handleWhatsApp}
            sx={{
              flex: 1,
              background: '#25D366',
              '&:hover': { background: '#1EAE54' },
            }}
          >
            Share
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Quotes = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quotes, setQuotes] = useState(() =>
    Object.fromEntries(QUOTE_CATEGORIES.map((c) => [c.id, getRandomQuote(c.id)]))
  );
  const [copied, setCopied] = useState({});

  const handleRefresh = useCallback((categoryId) => {
    setQuotes((prev) => ({ ...prev, [categoryId]: getRandomQuote(categoryId) }));
  }, []);

  const handleCopy = useCallback((categoryId, quote) => {
    navigator.clipboard.writeText(quote);
    setCopied((prev) => ({ ...prev, [categoryId]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [categoryId]: false })), 2000);
  }, []);

  const displayedCategories = selectedCategory
    ? QUOTE_CATEGORIES.filter((c) => c.id === selectedCategory)
    : QUOTE_CATEGORIES;

  return (
    <Box>
      <PageHeader
        title="Quotes & Wishes"
        subtitle="Beautiful messages for every occasion"
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Quotes' }]}
      />

      {/* Category Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          label="All"
          onClick={() => setSelectedCategory(null)}
          color={!selectedCategory ? 'primary' : 'default'}
          variant={!selectedCategory ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
        {QUOTE_CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={`${c.icon} ${c.label}`}
            onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
            color={selectedCategory === c.id ? 'primary' : 'default'}
            variant={selectedCategory === c.id ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Box>

      <Grid container spacing={2.5}>
        {displayedCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Fade in timeout={400}>
              <div>
                <QuoteCard
                  category={category}
                  quote={quotes[category.id]}
                  onRefresh={() => handleRefresh(category.id)}
                  onCopy={() => handleCopy(category.id, quotes[category.id])}
                  copied={!!copied[category.id]}
                />
              </div>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Quotes;
