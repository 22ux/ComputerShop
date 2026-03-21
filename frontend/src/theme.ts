import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  shape: {
    borderRadius: 18,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8',
      dark: '#153ba8',
      light: '#4f7cf1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
      dark: '#0b5b55',
      light: '#2aa39a',
    },
    background: {
      default: '#eef3f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#102033',
      secondary: '#5f7086',
    },
    success: {
      main: '#1f9d61',
    },
    warning: {
      main: '#d88a0d',
    },
    error: {
      main: '#d9485f',
    },
    info: {
      main: '#2563eb',
    },
  },
  typography: {
    fontFamily: ['Manrope', 'Segoe UI', 'sans-serif'].join(','),
    h1: {
      fontFamily: ['Space Grotesk', 'Manrope', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontFamily: ['Space Grotesk', 'Manrope', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontFamily: ['Space Grotesk', 'Manrope', 'sans-serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 24%),
            radial-gradient(circle at top right, rgba(15, 118, 110, 0.1), transparent 26%),
            linear-gradient(180deg, #f5f8fc 0%, #edf3f9 100%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 18px 40px rgba(16, 32, 51, 0.08)',
          border: `1px solid ${alpha('#102033', 0.06)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 24,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 999,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: 'medium',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: alpha('#ffffff', 0.92),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#5f7086',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
        },
      },
    },
  },
})
