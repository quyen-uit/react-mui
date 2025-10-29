import { Card, CardContent, Grid, Typography } from '@mui/material';

export default function ServicesPage() {
  return (
    <Grid container spacing={2}>
      {['Design','Development','Deployment'].map((s) => (
        <Grid item xs={12} sm={6} md={4} key={s}>
          <Card>
            <CardContent>
              <Typography variant="h6">{s}</Typography>
              <Typography color="text.secondary">High-quality {s.toLowerCase()} services.</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

