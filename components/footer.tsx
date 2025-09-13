'use client'

import Link from 'next/link'
import { Coffee, Github, Twitter, Mail } from 'lucide-react'
import { useAccount } from 'wagmi'
import { isAdminAddress } from '@/lib/admin'
import { useEffect, useState } from 'react'

export function Footer() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = mounted && address && isAdminAddress(address)
  return (
    <footer className="bg-coffee-espresso text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-coffee-medium" />
              <span className="text-xl font-bold">Project Mocha</span>
            </div>
            <p className="text-coffee-light mb-4 max-w-md">
              Revolutionizing coffee farming investment through blockchain technology. 
              Own coffee trees, earn sustainable yields, and support farmers worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Farms
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Dashboard
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <Link href="/docs" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Tokenomics
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  Smart Contracts
                </a>
              </li>
              <li>
                <a href="#" className="text-coffee-light hover:text-coffee-medium transition-colors coffee-hover">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-coffee-mocha mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-coffee-light text-sm">
              © 2024 Project Mocha. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-coffee-light hover:text-coffee-medium text-sm transition-colors coffee-hover">
                Privacy Policy
              </a>
              <a href="#" className="text-coffee-light hover:text-coffee-medium text-sm transition-colors coffee-hover">
                Terms of Service
              </a>
              <a href="#" className="text-coffee-light hover:text-coffee-medium text-sm transition-colors coffee-hover">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
