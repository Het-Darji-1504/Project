import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata = {
  title: 'Nestora — Next-Gen PropTech & Transparent Living Platform',
  description: 'Nestora is a next-generation PropTech platform helping young adults and first-time renters find, compare, lease, share, and manage residential and commercial spaces with radical cost transparency.',
  themeColor: '#4F46E5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
