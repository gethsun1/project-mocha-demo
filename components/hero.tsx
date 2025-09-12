import { Button } from '@/components/ui/button'
import { Coffee, TreePine, DollarSign, Shield } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Tokenized Coffee Farming
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Invest in sustainable coffee farms through blockchain technology. 
          Own coffee trees, earn yields, and support farmers worldwide.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild>
            <Link href="#farms">Explore Farms</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2,000+</h3>
            <p className="text-gray-600">Coffee Trees</p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">12-16%</h3>
            <p className="text-gray-600">Annual Yield</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">150%</h3>
            <p className="text-gray-600">Collateralization</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">5 Years</h3>
            <p className="text-gray-600">Maturity</p>
          </div>
        </div>
      </div>
    </section>
  )
}
