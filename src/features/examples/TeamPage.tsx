import { Avatar, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

export default function TeamPage() {
  return (
    <Grid container spacing={2}>
      {['Alice','Bob','Carol','Dave'].map((name, i) => (
        <Grid item xs={12} sm={6} md={3} key={name}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Avatar>{name[0]}</Avatar>
                <Typography>{name}</Typography>
                <Typography color="text.secondary">Engineer</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

