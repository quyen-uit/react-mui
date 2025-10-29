import { useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { User } from '@/types/auth';

const MOCK: User[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 5 === 0 ? 'admin' : 'user',
}));

export default function UsersPage() {
  const [data] = useState<User[]>(MOCK);
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role', enableColumnFilter: true },
    ],
    [],
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Users</Typography>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnPinning
        enableColumnFilters
        enableSorting
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => {
              const rows = data.map((d) => ({ ...d }));
              const csv = [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'users.csv';
              a.click();
            }}>Export CSV</Button>
          </Stack>
        )}
      />
    </Box>
  );
}
