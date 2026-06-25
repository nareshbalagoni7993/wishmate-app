/**
 * WHY: Entry point for React. Sets up Redux store, Router, MUI ThemeProvider.
 * HOW: StrictMode catches side-effects in dev. Provider wraps everything for Redux.
 *      ThemeProvider wraps for MUI. BrowserRouter for client-side routing.
 * PRODUCTION STANDARD: StrictMode is dev-only (double renders), removed in prod build.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import App from './App';
import { store } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <App />
        </LocalizationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
