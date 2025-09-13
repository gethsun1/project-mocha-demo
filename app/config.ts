import { scrollSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Project Mocha',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c0c1d40574c57d6e2b415701b5dc9ab8',
  chains: [scrollSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
