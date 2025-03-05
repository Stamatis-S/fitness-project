
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add global error handler for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', {
    message,
    source,
    lineno,
    colno,
    error,
    userAgent: navigator.userAgent,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });
  return false;
};

// Add handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    userAgent: navigator.userAgent,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });
});

// Add detailed logging for initialization
console.log('Initializing app with:', {
  userAgent: navigator.userAgent,
  isMobile: /Mobi|Android/i.test(navigator.userAgent),
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

try {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Error during app initialization:', error);
  // Display a user-friendly error message
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page. If the problem persists, please contact support.</p>
    </div>
  `;
}
