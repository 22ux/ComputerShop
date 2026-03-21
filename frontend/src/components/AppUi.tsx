import type { ReactNode } from 'react'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import { Box, Button, Card, Chip, Stack, Typography, alpha, useTheme } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { mapStatusTone } from '../lib/utils'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      justifyContent="space-between"
      spacing={2}
    >
      <Box>
        <Chip label={eyebrow} color="secondary" variant="outlined" sx={{ mb: 1.5 }} />
        <Typography variant="h3" sx={{ mb: description ? 1 : 0 }}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        p: 5,
        textAlign: 'center',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)}, #fff)`,
      }}
    >
      <Inventory2RoundedIcon color="primary" sx={{ fontSize: 44, mb: 1.5 }} />
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: actionTo ? 2.5 : 0 }}>
        {description}
      </Typography>
      {actionLabel && actionTo ? (
        <Button component={RouterLink} to={actionTo} variant="contained">
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const tone = mapStatusTone(status)

  const props =
    tone === 'success'
      ? { color: 'success' as const, variant: 'filled' as const }
      : tone === 'warning'
        ? { color: 'warning' as const, variant: 'filled' as const }
        : tone === 'danger'
          ? { color: 'error' as const, variant: 'filled' as const }
          : tone === 'info'
            ? { color: 'info' as const, variant: 'filled' as const }
            : { color: 'default' as const, variant: 'outlined' as const }

  return <Chip size="small" label={status} {...props} />
}
