import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box,
} from '@mui/material';
import { MdWarning } from 'react-icons/md';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', confirmColor = 'error' }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (t) => `${t.palette.error.main}18`,
          }}
        >
          <MdWarning style={{ fontSize: '1.3rem', color: '#FF5252' }} />
        </Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ flex: 1 }}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
