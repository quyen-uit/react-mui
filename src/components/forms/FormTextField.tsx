import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

interface FormTextFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
}

export const FormTextField = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: FormTextFieldProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
};
