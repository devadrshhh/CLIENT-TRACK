import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './AuthContext.jsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#059669' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: { textTransform: 'none' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', padding: '10px 24px', fontWeight: 600 }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
