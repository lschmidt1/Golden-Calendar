import { Button, ButtonProps } from '@mui/material'

interface MuiButtonProps extends ButtonProps {
  label: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function MuiButton({ label, ...props }: MuiButtonProps) {
  return (
    <Button
      variant="contained"
      sx={{
        textTransform: 'none',
        borderRadius: '4px',
        ...props.sx
      }}
      {...props}
    >
      {label}
    </Button>
  )
} 