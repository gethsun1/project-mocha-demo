'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { config } from './config'
import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

const rainbowKitConfig = getDefaultConfig({
  appName: 'Project Mocha',
  projectId: 'project-mocha-demo', // This is just for demo purposes
  chains: [config.chains[0]],
  ssr: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider config={rainbowKitConfig}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
