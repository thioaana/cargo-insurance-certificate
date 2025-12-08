"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavBarClientProps {
  isLoggedIn: boolean;
}

export function NavBarClient({ isLoggedIn }: NavBarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary text-primary-foreground px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <Image src="/logo.png" alt="Agro Logo" width={32} height={32} />
          Agro
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/new-proposal"
            className="hover:text-accent transition-colors duration-200"
          >
            New Proposal
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-accent transition-colors duration-200"
          >
            Dashboard
          </Link>
          <ThemeToggle />
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
            className="p-2 rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 pb-2">
          <Link
            href="/new-proposal"
            className="px-2 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            New Proposal
          </Link>
          <Link
            href="/dashboard"
            className="px-2 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <div className="px-2 py-2">
            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
