import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { useRegisterMutation } from '@/services/api/auth';
import { Link, useNavigate } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [registerApi, { isLoading } ] = useRegisterMutation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    await registerApi(values).unwrap().catch(() => null);
    navigate('/login');
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h5" textAlign="center">Register</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <Button type="submit" variant="contained" disabled={isLoading}>Create Account</Button>
            <Typography variant="body2">Have an account? <Button component={Link} to="/login">Login</Button></Typography>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

