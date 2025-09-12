import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Zap, Globe, Lock } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-coffee-medium" />,
      title: "Sustainable Farming",
      description: "Support environmentally friendly coffee farming practices with real-time monitoring and verification."
    },
    {
      icon: <Zap className="h-8 w-8 text-coffee-medium" />,
      title: "High Yields",
      description: "Earn 12-16% annual returns through tokenized coffee tree investments with transparent yield distribution."
    },
    {
      icon: <Globe className="h-8 w-8 text-coffee-medium" />,
      title: "Global Access",
      description: "Invest in coffee farms worldwide from anywhere with just a crypto wallet and internet connection."
    },
    {
      icon: <Lock className="h-8 w-8 text-coffee-medium" />,
      title: "Secure & Transparent",
      description: "Blockchain technology ensures secure transactions and transparent farm operations with immutable records."
    }
  ]

  return (
    <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-espresso mb-4">
            Why Choose Project Mocha?
          </h2>
          <p className="text-xl text-coffee-mocha max-w-3xl mx-auto">
            We're revolutionizing coffee farming investment through blockchain technology, 
            making it accessible, transparent, and profitable for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center coffee-hover coffee-shadow border-coffee-light bg-white/90">
              <CardHeader>
                <div className="mx-auto mb-4 bg-coffee-light/10 p-4 rounded-full coffee-border">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-coffee-espresso">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-coffee-mocha leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
