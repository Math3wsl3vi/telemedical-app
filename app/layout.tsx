import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster"

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const poppins = Poppins({
  weight: ['400', '600', '700'], // Choose desired weights
  subsets: ['latin'],           // Subsets for language support
});


export const metadata: Metadata = {
  title: "Virtual Hospital",
  description: "Virtual Hospital for Consultations",
  icons:{
    icon:'/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <ClerkProvider 
    
    appearance={{
      layout:{
        logoImageUrl:'/icons/logo.png',
        socialButtonsVariant:'iconButton'
      },
        variables:{
        colorPrimary:'#007e6d',
        colorText:'#222'
      }
    }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} poppins.className text-black antialiased`}
      >
        {children}
        <Toaster/>
      </body>
    </ClerkProvider>
    </html>
  );
}
