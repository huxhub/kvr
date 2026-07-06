import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global API Interceptor for console logging all API calls with status codes
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const [resource, config] = args;
  const method = config?.method || 'GET';
  const url = typeof resource === 'string' ? resource : resource?.url || '';
  
  console.log(`%c[API Request] ${method} ${url}`, 'color: #3b82f6; font-weight: bold;');
  try {
    const response = await originalFetch(...args);
    const color = response.status >= 200 && response.status < 300 ? '#10b981' : '#ef4444';
    console.log(
      `%c[API Response] ${method} ${url} - Status: ${response.status} (${response.statusText})`,
      `color: ${color}; font-weight: bold;`
    );
    return response;
  } catch (error) {
    console.error(`%c[API Error] ${method} ${url} - Failed:`, 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
};

createRoot(document.getElementById('root')).render(
  <App />
)
