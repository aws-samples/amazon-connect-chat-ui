import React from 'react';
import ReactDOM from 'react-dom';
import App from './example/app';
export * as components from './components';
export * as client from './client';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);