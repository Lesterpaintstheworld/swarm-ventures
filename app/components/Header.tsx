"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold gold-gradient">SwarmVentures</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#learn-more"
            className="text-white hover:text-[#d4af37] transition-colors"
          >
            About
          </Link>
          <Link
            href="#investment"
            className="text-white hover:text-[#d4af37] transition-colors"
          >
            Invest
          </Link>
          <Link
            href="#team"
            className="text-white hover:text-[#d4af37] transition-colors"
          >
            Team
          </Link>
          <Link
            href="#contact"
            className="text-white hover:text-[#d4af37] transition-colors"
          >
            Contact
          </Link>
          <Link
            href="#register"
            className="gold-button px-5 py-2 rounded-full font-medium"
          >
            Register Interest
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute w-full bg-black/95 backdrop-blur-md transition-all duration-300 ${
          menuOpen ? "max-h-64 py-4" : "max-h-0 overflow-hidden"
        }`}
      >
        <nav className="container mx-auto px-4 flex flex-col space-y-4">
          <Link
            href="#learn-more"
            className="text-white hover:text-[#d4af37] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="#investment"
            className="text-white hover:text-[#d4af37] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Invest
          </Link>
          <Link
            href="#team"
            className="text-white hover:text-[#d4af37] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Team
          </Link>
          <Link
            href="#contact"
            className="text-white hover:text-[#d4af37] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="#register"
            className="gold-button px-5 py-2 rounded-full font-medium text-center"
            onClick={() => setMenuOpen(false)}
          >
            Register Interest
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
