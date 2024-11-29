import { render } from '@testing-library/react';
import RootLayout from '../layout';

jest.mock('next/font/local', () => ({
  __esModule: true,
  default: () => ({
    variable: 'mock-font-variable',
  }),
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
  });

  it('applies font classes correctly', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('mock-font-variable', 'mock-font-variable', 'antialiased');
  });

  it('sets correct language attribute', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
  });
}); 