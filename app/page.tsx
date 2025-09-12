import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { FarmList } from '@/components/farm-list'
import { Features } from '@/components/features'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <Header />
      <main>
        <Hero />
        <Features />
        <FarmList />
      </main>
      <Footer />
    </div>
  )
}
