import { Card as MuiCard, CardContent, CardHeader, Typography } from '@mui/material';
import styles from './Card.module.css';

type Props = { title: string; children?: React.ReactNode };

export default function Card({ title, children }: Props) {
  return (
    <MuiCard className={styles.card} sx={{ mb: 2 }}>
      <CardHeader title={<Typography variant="h6">{title}</Typography>} />
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
}

