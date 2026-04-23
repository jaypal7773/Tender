import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    CircularProgress
} from '@mui/material';
import { Logout, Cancel, CheckCircle } from '@mui/icons-material';

const LogoutDialog = ({ open, onClose, onConfirm, loading }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    padding: '10px',
                    minWidth: '380px',
                    animation: 'fadeIn 0.3s ease'
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            background: '#f4433620',
                            borderRadius: '50%',
                            padding: '12px',
                            display: 'inline-flex',
                            animation: 'pulse 0.5s ease'
                        }}
                    >
                        <Logout sx={{ fontSize: 48, color: '#f44336' }} />
                    </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Confirm Logout
                </Typography>
            </DialogTitle>

            <DialogContent>
                <DialogContentText textAlign="center" sx={{ mb: 2 }}>
                    Are you sure you want to logout? You'll need to login again to access your account.
                </DialogContentText>

                <Box sx={{
                    background: '#f5f5f5',
                    borderRadius: '10px',
                    p: 2,
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="caption" color="textSecondary">
                        Your session will be securely terminated
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<Cancel />}
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderColor: '#ccc',
                        color: '#666',
                        '&:hover': {
                            borderColor: '#999',
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={onConfirm}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Logout />}
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        background: '#f44336',
                        '&:hover': {
                            background: '#d32f2f'
                        }
                    }}
                >
                    {loading ? 'Logging out...' : 'Logout'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogoutDialog;