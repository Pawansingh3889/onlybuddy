import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ── Global reset — fixes mobile horizontal scroll on ALL pages
const style = document.createElement('style');
style.innerHTML = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    overflow-x: hidden;
    max-width: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  img, video { max-width: 100%; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
