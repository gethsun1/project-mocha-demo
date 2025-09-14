"use client"

import { AdminHeader } from '@/components/admin-header'
import { CreateFarmForm } from '@/components/create-farm-form'
import { AdminFarmList } from '@/components/admin-farm-list'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { isAdminAddress } from '@/lib/admin'

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = mounted && address && isAdminAddress(address)

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-3">Connect your wallet</h1>
            <p className="text-gray-600 mb-6">Connect to access admin features.</p>
            <div className="inline-block"><ConnectButton /></div>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-3">Access restricted</h1>
            <p className="text-gray-600">This page is only available to admin wallets.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage coffee farms and monitor investments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Farm</h2>
            <CreateFarmForm />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Existing Farms</h2>
            <AdminFarmList />
          </div>
        </div>
      </main>
    </div>
  )
}
