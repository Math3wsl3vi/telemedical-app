"use client";

import Link from "next/link";
import React from "react";
import MobileNav from "./MobileNav";
import { SignedIn, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 shadow-sm font-poppins">
      <div className="flex-between mx-auto max-w-7xl px-6 py-4">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          <p className="text-2xl font-extrabold text-green-600">
          DaktariConnect
          </p>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/doctor-page"
            className="nav-link"
          >
            Find a Doctor
          </Link>
          <Link href="/" className="nav-link">
            Pharmacies
          </Link>
          <Link href="/" className="nav-link">
            Hospitals
          </Link>
          <Link href="/" className="nav-link">
            Contact
          </Link>
        </div>

        {/* User + Mobile Menu */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

