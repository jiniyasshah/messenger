import "./globals.css"; // Import the global CSS file for Tailwind classes and custom styles

export const metadata = {
  title: "Alihs",
  description:
    "A real-time messenger app with beautiful dark UI and responsive design.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white overflow-x-hidden">
        <main className="flex flex-col h-screen">{children}</main>
      </body>
    </html>
  );
}
