import { Box, CircularProgress } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  adminOnly?: boolean
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
