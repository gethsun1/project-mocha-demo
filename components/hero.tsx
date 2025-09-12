import { Button } from '@/components/ui/button'
import { Coffee, TreePine, DollarSign, Shield } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-coffee-cream/20"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-coffee-light/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-coffee-medium/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto text-center relative">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="coffee-text-gradient">Tokenized Coffee</span>
          <br />
          <span className="text-coffee-espresso">Farming</span>
        </h1>
        <p className="text-xl text-coffee-mocha mb-8 max-w-3xl mx-auto leading-relaxed">
          Invest in sustainable coffee farms through blockchain technology. 
          Own coffee trees, earn yields, and support farmers worldwide.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild className="coffee-hover">
            <Link href="#farms">Explore Farms</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="coffee-hover coffee-border">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center coffee-hover">
            <div className="bg-coffee-light/20 coffee-border rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-coffee-medium" />
            </div>
            <h3 className="text-2xl font-bold text-coffee-espresso">2,000+</h3>
            <p className="text-coffee-mocha">Coffee Trees</p>
          </div>
          
          <div className="text-center coffee-hover">
            <div className="bg-coffee-light/20 coffee-border rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-coffee-medium" />
            </div>
            <h3 className="text-2xl font-bold text-coffee-espresso">12-16%</h3>
            <p className="text-coffee-mocha">Annual Yield</p>
          </div>
          
          <div className="text-center coffee-hover">
            <div className="bg-coffee-light/20 coffee-border rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-coffee-medium" />
            </div>
            <h3 className="text-2xl font-bold text-coffee-espresso">150%</h3>
            <p className="text-coffee-mocha">Collateralization</p>
          </div>
          
          <div className="text-center coffee-hover">
            <div className="bg-coffee-light/20 coffee-border rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-coffee-medium" />
            </div>
            <h3 className="text-2xl font-bold text-coffee-espresso">5 Years</h3>
            <p className="text-coffee-mocha">Maturity</p>
          </div>
        </div>
      </div>
    </section>
  )
}
