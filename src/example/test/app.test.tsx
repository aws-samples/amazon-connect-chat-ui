import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../app';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/welcome to chat/i);
  expect(linkElement).toBeInTheDocument();
});
