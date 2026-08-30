import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const linkElement = screen.getByText(/EduCore/i);
  expect(linkElement).toBeInTheDocument();
});
