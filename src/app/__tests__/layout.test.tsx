import { render } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the local fonts
jest.mock('next/font/local', () => ({
  __esModule: true,
  default: () => ({
    variable: '--font-geist-sans',
  }),
}));

// Next.js의 RootLayout을 위한 테스트 래퍼
const renderWithRootLayout = (ui: React.ReactElement) => {
  const { container, ...rest } = render(ui);
  // container의 첫 번째 자식이 html 요소
  const html = container.firstChild as HTMLElement;
  // html의 첫 번째 자식이 body 요소
  const body = html?.firstChild as HTMLElement;
  
  return {
    container,
    html,
    body,
    ...rest,
  };
};

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { getByTestId } = renderWithRootLayout(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('applies font classes correctly', () => {
    const { body } = renderWithRootLayout(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(body.className).toContain('--font-geist-sans');
    expect(body.className).toContain('antialiased');
  });

  it('sets correct language attribute', () => {
    const { html } = renderWithRootLayout(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(html.getAttribute('lang')).toBe('en');
  });
}); 