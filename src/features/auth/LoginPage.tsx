import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { useLoginMutation } from '@/services/api/auth';
import { useAppDispatch } from '@/app/store';
import { setCredentials } from '@/app/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const dispatch = useAppDispatch();
  const [login, { isLoading } ] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    const res = await login(values).unwrap().catch(() => null);
    if (res) {
      dispatch(setCredentials({ user: res.user, token: res.accessToken }));
      navigate(from, { replace: true });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h5" textAlign="center">Login</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <Button type="submit" variant="contained" disabled={isLoading}>Sign In</Button>
            <Typography variant="body2">No account? <Button component={Link} to="/register">Register</Button></Typography>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

