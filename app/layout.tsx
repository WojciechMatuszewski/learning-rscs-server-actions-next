export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Root layout</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
