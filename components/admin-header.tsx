'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Coffee, ArrowLeft } from 'lucide-react'

export function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Project Mocha</span>
            <span className="text-sm text-gray-500 ml-2">Admin</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Farms
              </Link>
            </Button>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}

