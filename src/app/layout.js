import "./globals.css";
import localFont from 'next/font/local'
import MainPage from "@/components/MainPage";

const monocraft = localFont({ src: 'Monocraft.otf' });


export const metadata = {
  title: "Minecraft Player Statistics",
  description: "Minecraft Player statistics on simple website",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${monocraft.className} antialiased bg-white overflow-y-scroll`}
      >
        <div className="relative min-h-screen">

          {/* Middle Background */}
          <div
            className="absolute inset-0 bg-repeat bg-top blur-[2px] brightness-50"
            style={{
              backgroundImage: 'url("assets/background/mid.webp")',
            }}
          ></div>

          {/* Top Background */}
          <div
            className="absolute top-0 left-0 w-full h-[384px] bg-top bg-repeat-x blur-[2px] brightness-50"
            style={{
              backgroundImage: 'url("assets/background/top.webp")',
            }}
          ></div>

          {/* Bottom Background */}
          <div
            className="absolute bottom-0 left-0 w-full h-[640px] bg-bottom bg-repeat-x blur-[2px] brightness-50"
            style={{
              backgroundImage: 'url("assets/background/bottom.webp")',
            }}
          ></div>

          {/* Page Content */}
          <MainPage>
            {children}
          </MainPage>

        </div>
      </body>
    </html>
  );
}
