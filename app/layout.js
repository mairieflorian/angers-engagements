import './globals.css';

export const metadata = {
  title: 'Angers - Suivi des Engagements',
  description: 'Observatoire citoyen du programme municipal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
