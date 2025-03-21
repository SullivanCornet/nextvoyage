import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/index.css";
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/app/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cornet de Voyage - Découvrez le monde",
  description: "Application de voyage pour découvrir et explorer des destinations à travers le monde",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <footer className="footer">
            <div className="footer-bottom">
              © {new Date().getFullYear()} Cornet de Voyage
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
