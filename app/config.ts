import { http, createConfig } from 'wagmi'
import { scrollSepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [scrollSepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [scrollSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
