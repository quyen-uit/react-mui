import { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

type Person = { id: number; firstName: string; lastName: string; age: number; city: string };

const data: Person[] = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  firstName: `First${i + 1}`,
  lastName: `Last${i + 1}`,
  age: 18 + (i % 50),
  city: ['NYC','LA','SF','SEA'][i % 4],
}));

export default function MrtTablePage() {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' },
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'city', header: 'City' },
    ],
    [],
  );
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableColumnFilters
      enableColumnPinning
      enableRowActions
      enableSorting
      enableDensityToggle
      enableFullScreenToggle
    />
  );
}
