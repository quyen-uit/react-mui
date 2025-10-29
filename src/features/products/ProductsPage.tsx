import { useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import type { Product } from '@/types/product';

const MOCK: Product[] = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.round(Math.random() * 10000) / 100,
  inStock: Math.random() > 0.5,
}));

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>(MOCK);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Product>>({});

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', enableColumnPinning: true, size: 60 },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'price', header: 'Price', Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}` },
      { accessorKey: 'inStock', header: 'In Stock', Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No') },
    ],
    [],
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Products</Typography>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableRowActions
        enableColumnPinning
        enableColumnFilters
        enableSorting
        enableDensityToggle
        renderTopToolbarCustomActions={() => (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => { setDraft({}); setOpen(true); }}>Create</Button>
            <Button variant="outlined" onClick={() => {
              const rows = data.map((d) => ({ ...d }));
              const csv = [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'products.csv';
              a.click();
            }}>Export CSV</Button>
          </Stack>
        )}
        renderRowActions={({ row }) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => { setDraft(row.original); setOpen(true); }}>Edit</Button>
            <Button size="small" color="error" onClick={() => setData((d) => d.filter((x) => x.id !== row.original.id))}>Delete</Button>
          </Stack>
        )}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{draft?.id ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={draft.name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <TextField label="Price" type="number" value={draft.price ?? 0} onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (draft.id) {
              setData((d) => d.map((x) => (x.id === draft.id ? ({ ...x, ...draft } as Product) : x)));
            } else {
              setData((d) => d.concat({ id: Date.now(), name: draft.name ?? '', price: draft.price ?? 0, inStock: true }));
            }
            setOpen(false);
          }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
