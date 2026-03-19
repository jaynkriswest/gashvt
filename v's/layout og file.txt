import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#010409] text-white antialiased"
      suppressHydrationWarning={true}
      >
        <div className="flex flex-col min-h-screen">
          <Navbar /> {/* This puts the menu at the very top */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}