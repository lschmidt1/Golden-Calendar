import { Card, CardContent, CardProps } from '@mui/material'

interface MuiCardProps extends CardProps {
  children: React.ReactNode
}

export function MuiCard({ children, ...props }: MuiCardProps) {
  return (
    <Card
      sx={{
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
} 