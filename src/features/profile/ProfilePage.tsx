import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@/services/api/profile';

export default function ProfilePage() {
  const { data } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [openEdit, setOpenEdit] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Profile</Typography>
      <Typography>Name: {data?.name ?? 'N/A'}</Typography>
      <Typography>Email: {data?.email ?? 'N/A'}</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => setOpenEdit(true)}>Edit Profile</Button>
        <Button variant="outlined" onClick={() => setOpenPwd(true)}>Change Password</Button>
      </Stack>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" defaultValue={data?.name} />
            <TextField label="Email" defaultValue={data?.email} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenEdit(false)}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPwd} onClose={() => setOpenPwd(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Current Password" type="password" />
            <TextField label="New Password" type="password" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPwd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenPwd(false)}>Change</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

