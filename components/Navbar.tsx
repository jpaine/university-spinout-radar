"use client";

import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Left: brand + primary nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-bold text-gray-900">
              Oxford Deal Flow
            </Link>
            <SignedIn>
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/u/oxford/feed"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/u/oxford/directory"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href="/u/oxford/technologies"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  IP Pipeline
                </Link>
              </div>
            </SignedIn>
          </div>

          {/* Right: user controls */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <SignInButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* Secondary nav — desktop dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                >
                  More
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link
                      href="/pricing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
