import "./globals.css";

export const metadata = {
  title: "My Projects | Portfolio 2026",
  description:
    "Explore my latest projects — a portfolio showcasing web, mobile, and full-stack development work.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="https://www.svgrepo.com/show/506715/fire.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
