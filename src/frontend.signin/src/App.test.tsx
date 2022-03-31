import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react submit btn', () => {
  render(<App />);
  const submitElement = screen.getByText(/Submit/i);
  expect(submitElement).toBeInTheDocument();
});
