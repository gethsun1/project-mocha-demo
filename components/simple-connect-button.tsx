'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'

export function SimpleConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="flex items-center space-x-1"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center space-x-2"
        >
          <Wallet className="h-4 w-4" />
          <span>
            {isPending ? 'Connecting...' : `Connect ${connector.name}`}
          </span>
        </Button>
      ))}
    </div>
  )
}
