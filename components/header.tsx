'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Coffee, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { isAdminAddress } from '@/lib/admin'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = mounted && address && isAdminAddress(address)
  
  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('Admin check:', {
        mounted,
        isConnected,
        address,
        isAdminAddress: address ? isAdminAddress(address) : false,
        isAdmin
      })
    }
  }, [mounted, isConnected, address, isAdmin])

  return (
    <header className="bg-white/90 backdrop-blur-sm coffee-shadow border-b border-coffee-light">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 coffee-hover">
            <Coffee className="h-8 w-8 text-coffee-medium" />
            <span className="text-xl font-bold coffee-text-gradient">Project Mocha</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors">
              Farms
            </Link>
            <Link href="/dashboard" className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors">
              Dashboard
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-coffee-mocha hover:text-coffee-medium coffee-hover p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-coffee-light bg-coffee-cream/50">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Farms
              </Link>
              <Link 
                href="/dashboard" 
                className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-coffee-mocha hover:text-coffee-medium coffee-hover px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="pt-4">
                <ConnectButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
