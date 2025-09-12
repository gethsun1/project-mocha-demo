'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, TreePine, DollarSign, Clock, Users } from 'lucide-react'
import { useAccount, useReadContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI, LAND_TOKEN_ABI, VAULT_ABI } from '@/lib/contracts'
import { FarmInvestment } from './farm-investment'

// Mock data for demonstration
const mockFarms = [
  {
    id: 1,
    name: "Ethiopian Highlands Farm",
    location: "Yirgacheffe, Ethiopia",
    apy: 14,
    maturity: "5 years",
    totalInvestment: 125000,
    totalTrees: 2000,
    investorCount: 45,
    isActive: true,
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    name: "Colombian Mountain Farm",
    location: "Huila, Colombia",
    apy: 12,
    maturity: "3 years",
    totalInvestment: 87500,
    totalTrees: 1500,
    investorCount: 32,
    isActive: true,
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    name: "Guatemalan Volcanic Farm",
    location: "Antigua, Guatemala",
    apy: 16,
    maturity: "4 years",
    totalInvestment: 95000,
    totalTrees: 1800,
    investorCount: 28,
    isActive: true,
    image: "/api/placeholder/400/300"
  }
]

export function FarmList() {
  const { address, isConnected } = useAccount()
  const [farms, setFarms] = useState<any[]>([])

  // Get all farm IDs from the contract
  const { data: farmIds } = useReadContract({
    address: CONTRACT_ADDRESSES.FarmManager,
    abi: FARM_MANAGER_ABI,
    functionName: 'getAllFarms',
  })

  // Get farm data for each farm ID
  const { data: farmData } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaLandToken,
    abi: LAND_TOKEN_ABI,
    functionName: 'getFarmData',
    args: farmIds && farmIds.length > 0 ? [farmIds[0]] : undefined,
  })

  // Get farm stats for each farm ID
  const { data: farmStats } = useReadContract({
    address: CONTRACT_ADDRESSES.FarmManager,
    abi: FARM_MANAGER_ABI,
    functionName: 'getFarmStats',
    args: farmIds && farmIds.length > 0 ? [farmIds[0]] : undefined,
  })

  // Get vault info for each farm
  const { data: vaultInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaVault,
    abi: VAULT_ABI,
    functionName: 'getTrancheInfo',
    args: farmIds && farmIds.length > 0 ? [farmIds[0]] : undefined,
  })

  useEffect(() => {
    if (farmIds && farmIds.length > 0) {
      // For now, we'll use the first farm as an example
      // In a real implementation, you'd fetch data for all farms
      const farmId = farmIds[0]
      
      if (farmData && farmStats && vaultInfo) {
        const farm = {
          id: Number(farmId),
          name: farmData.name,
          location: farmData.location,
          apy: Number(vaultInfo.apy) / 100, // Convert from basis points
          maturity: `${Math.floor(Number(vaultInfo.maturity) / (365 * 24 * 60 * 60))} years`,
          totalInvestment: Number(farmStats.totalInvestment) / 1e18, // Convert from wei
          totalTrees: Number(farmStats.totalTrees),
          investorCount: Number(farmStats.investorCount),
          isActive: farmData.isActive,
          image: "/api/placeholder/400/300"
        }
        setFarms([farm])
      }
    } else {
      // Fallback to mock data if no farms found
      setFarms(mockFarms)
    }
  }, [farmIds, farmData, farmStats, vaultInfo])

  return (
    <section id="farms" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-espresso mb-4">
            Available Coffee Farms
          </h2>
          <p className="text-xl text-coffee-mocha max-w-3xl mx-auto">
            Choose from our carefully selected coffee farms around the world. 
            Each farm offers unique characteristics and investment opportunities.
          </p>
        </div>

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
                    <span className="font-semibold text-coffee-medium">{farm.apy}% APY</span>
                  </div>

                  {/* Maturity */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-mocha">Maturity</span>
                    <span className="font-semibold text-coffee-espresso">{farm.maturity}</span>
                  </div>

                  {/* Investment Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-coffee-light">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-coffee-medium mr-1" />
                        <span className="text-sm text-coffee-mocha">Investment</span>
                      </div>
                      <span className="font-semibold text-coffee-espresso">${farm.totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TreePine className="h-4 w-4 text-coffee-medium mr-1" />
                        <span className="text-sm text-coffee-mocha">Trees</span>
                      </div>
                      <span className="font-semibold text-coffee-espresso">{farm.totalTrees.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Investors */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-coffee-medium mr-1" />
                      <span className="text-sm text-coffee-mocha">{farm.investorCount} investors</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1 coffee-hover" 
                      disabled={!isConnected}
                      onClick={() => {
                        // This would open a modal or navigate to investment page
                        console.log('Invest in farm:', farm.id)
                      }}
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

        {!isConnected && (
          <div className="text-center mt-12">
            <p className="text-coffee-mocha mb-4">Connect your wallet to start investing in coffee farms</p>
            <Button size="lg" className="coffee-hover">Connect Wallet</Button>
          </div>
        )}
      </div>
    </section>
  )
}
