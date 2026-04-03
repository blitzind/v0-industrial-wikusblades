"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const utilityLinks = [
  { label: "Partner Portal", href: "https://www.wikus.de" },
  { label: "WIkademy", href: "https://www.wikus.de" },
  { label: "Contact", href: "https://www.wikussawtech.com/en/contact/" },
]

const primaryLinks = [
  { label: "Products", href: "https://www.wikussawtech.com/en/products/" },
  { label: "Why WIKUS", href: "https://www.wikussawtech.com/en/" },
  { label: "About WIKUS", href: "https://www.wikussawtech.com/en/about-wikus/" },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full">
      {/* Utility Bar */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <nav
            className="hidden md:flex items-center justify-end gap-6 h-8"
            aria-label="Utility navigation"
          >
            {utilityLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {/* Mobile utility bar spacer */}
          <div className="md:hidden h-2" />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <a
              href="https://www.wikussawtech.com/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              aria-label="WIKUS Saw Technology Home"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/csm_wikus-logo_en_a9f9a4a369-1-JupSPZCqqgbkFh9HtCS4Dz4f1ePjCs.png"
                alt="WIKUS Saw Technology"
                className="h-9 w-auto"
              />
            </a>

            {/* Desktop Primary Navigation */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Primary navigation"
            >
              {primaryLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#333333] hover:text-[#003366] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 text-[#333333] hover:text-[#003366] transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-white p-0">
                <SheetHeader className="border-b border-[#e0e0e0] p-4">
                  <SheetTitle className="text-left text-[#003366]">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col" aria-label="Mobile navigation">
                  {/* Primary Links */}
                  <div className="border-b border-[#e0e0e0]">
                    {primaryLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 text-sm font-medium text-[#333333] hover:bg-[#f5f5f5] hover:text-[#003366] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  {/* Utility Links */}
                  <div className="bg-[#f9f9f9]">
                    <div className="px-4 py-2 text-xs font-semibold text-[#666666] uppercase tracking-wide">
                      Quick Links
                    </div>
                    {utilityLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 text-sm text-[#555555] hover:bg-[#eeeeee] hover:text-[#003366] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
