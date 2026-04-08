"use client";

import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_UNIVERSITY_SLUG } from "@/lib/university";

export function Navbar() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const u = DEFAULT_UNIVERSITY_SLUG;

  return (
    <nav className="bg-white border-b border-gray-200 relative z-40">
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
                  href={`/u/${u}/feed`}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href={`/u/${u}/directory`}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href={`/u/${u}/technologies`}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  IP Pipeline
                </Link>
                <Link
                  href={`/u/${u}/watchlist`}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Watchlist
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
              {/* Hamburger — mobile only */}
              <button
                className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

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

      {/* Mobile menu panel */}
      <SignedIn>
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link
                href={`/u/${u}/feed`}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Feed
              </Link>
              <Link
                href={`/u/${u}/directory`}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Companies
              </Link>
              <Link
                href={`/u/${u}/technologies`}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                IP Pipeline
              </Link>
              <Link
                href={`/u/${u}/watchlist`}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Watchlist
              </Link>
              <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
                <Link
                  href="/pricing"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/account"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Account
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </SignedIn>
    </nav>
  );
}
