'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MapPin, TreePine, DollarSign, Clock, Users } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FarmInvestment } from './farm-investment'
import { useFarms } from '@/hooks/useFarms'


export function FarmList() {
  const { address, isConnected } = useAccount()
  const { farms, loading, farmCount } = useFarms()
  const [selectedFarm, setSelectedFarm] = useState<any>(null)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)

  const handleInvestClick = (farm: any) => {
    setSelectedFarm(farm)
    setIsInvestmentModalOpen(true)
  }

  // Show loading state
  if (loading) {
    return (
      <section id="farms" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-coffee-espresso mb-4">
              Available Coffee Farms
            </h2>
            <p className="text-xl text-coffee-mocha max-w-3xl mx-auto">
              Loading farms from blockchain...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-espresso"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="farms" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-espresso mb-4">
            Available Coffee Farms
          </h2>
          <p className="text-xl text-coffee-mocha max-w-3xl mx-auto mb-4">
            Choose from our carefully selected coffee farms around the world. 
            Each farm offers unique characteristics and investment opportunities.
          </p>
          <p className="text-lg text-coffee-medium font-semibold">
            {farmCount} farm{farmCount !== 1 ? 's' : ''} available
          </p>
        </div>

        {farms.length === 0 ? (
          <div className="text-center py-12">
            <TreePine className="h-16 w-16 text-coffee-light mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-coffee-espresso mb-2">No Farms Available</h3>
            <p className="text-coffee-mocha mb-6">
              No coffee farms have been created yet. Check back later or create a farm if you're an admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map((farm) => (
            <Card key={farm.id} className="overflow-hidden coffee-hover coffee-shadow border-coffee-light bg-white/90">
              <div className="h-48 coffee-gradient flex items-center justify-center relative">
                <div className="absolute inset-0 bg-coffee-espresso/20"></div>
                <TreePine className="h-16 w-16 text-white relative z-10" />
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{farm.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {farm.location}
                    </CardDescription>
                  </div>
                  <Badge variant={farm.isActive ? "default" : "secondary"}>
                    {farm.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* APY */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-mocha">Annual Yield</span>
                    <span className="font-semibold text-coffee-medium">{farm.apy || 12}% APY</span>
                  </div>

                  {/* Maturity */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-mocha">Maturity</span>
                    <span className="font-semibold text-coffee-espresso">{farm.maturity || "5 years"}</span>
                  </div>

                  {/* Investment Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-coffee-light">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-coffee-medium mr-1" />
                        <span className="text-sm text-coffee-mocha">Investment</span>
                      </div>
                      <span className="font-semibold text-coffee-espresso">${(farm.totalInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TreePine className="h-4 w-4 text-coffee-medium mr-1" />
                        <span className="text-sm text-coffee-mocha">Trees</span>
                      </div>
                      <span className="font-semibold text-coffee-espresso">{(farm.totalTrees || farm.currentTrees || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Investors */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-coffee-medium mr-1" />
                      <span className="text-sm text-coffee-mocha">{farm.investorCount || 0} investors</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1 coffee-hover" 
                      disabled={!isConnected}
                      onClick={() => handleInvestClick(farm)}
                    >
                      {isConnected ? "Invest Now" : "Connect Wallet"}
                    </Button>
                    <Button variant="outline" className="flex-1 coffee-hover coffee-border">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!isConnected && (
          <div className="text-center mt-12">
            <p className="text-coffee-mocha mb-4">Connect your wallet to start investing in coffee farms</p>
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Investment Modal */}
      <Dialog open={isInvestmentModalOpen} onOpenChange={setIsInvestmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invest in {selectedFarm?.name}</DialogTitle>
          </DialogHeader>
          {selectedFarm && (
            <FarmInvestment
              farmId={selectedFarm.id}
              farmName={selectedFarm.name}
              farmLocation={selectedFarm.location}
              apy={selectedFarm.apy || 12}
              maturity={selectedFarm.maturity || "5 years"}
              totalInvestment={selectedFarm.totalInvestment || 0}
              totalTrees={selectedFarm.totalTrees || selectedFarm.currentTrees || 0}
              treeCapacity={selectedFarm.treeCapacity || 0}
              investorCount={selectedFarm.investorCount || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
