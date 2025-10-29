import { Grid, Card, CardMedia, CardContent, Typography } from '@mui/material';

export default function GalleryPage() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <CardMedia component="img" height="140" image={`https://picsum.photos/seed/${i}/400/200`} />
            <CardContent>
              <Typography>Image {i + 1}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

