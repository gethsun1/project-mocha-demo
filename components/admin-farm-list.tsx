'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, TreePine, DollarSign, Users, Calendar, Settings } from 'lucide-react'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI, LAND_TOKEN_ABI } from '@/lib/contracts'

export function AdminFarmList() {
  const { address, isConnected } = useAccount()
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get all farm IDs from the contract
  const { data: farmIds, isLoading: farmIdsLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FarmManager,
    abi: FARM_MANAGER_ABI,
    functionName: 'getAllFarms',
  })

  // Fetch detailed farm data for each farm
  useEffect(() => {
    const fetchFarmDetails = async () => {
      if (!farmIds || farmIds.length === 0) {
        setFarms([])
        setLoading(false)
        return
      }

      setLoading(true)
      const farmsData = []

      for (const farmId of farmIds) {
        try {
          // Fetch farm data from Land Token contract
          const farmDataResponse = await fetch(`/api/farm-data?farmId=${farmId}`)
          if (farmDataResponse.ok) {
            const farmData = await farmDataResponse.json()
            farmsData.push(farmData)
          } else {
            // Fallback: create basic farm object if API fails
            const farm = {
              id: Number(farmId),
              name: `Coffee Farm #${farmId}`,
              location: "Blockchain Farm",
              gpsCoordinates: "0.0000, 0.0000",
              totalArea: 1000,
              treeCapacity: 1000,
              currentTrees: 0,
              totalInvestment: 0,
              investorCount: 0,
              isActive: true,
              creationTime: Math.floor(Date.now() / 1000),
              farmer: "0x0000...0000",
              metadataURI: ""
            }
            farmsData.push(farm)
          }
        } catch (error) {
          console.error(`Error fetching data for farm ${farmId}:`, error)
          // Create fallback farm data
          const farm = {
            id: Number(farmId),
            name: `Coffee Farm #${farmId}`,
            location: "Blockchain Farm",
            gpsCoordinates: "0.0000, 0.0000",
            totalArea: 1000,
            treeCapacity: 1000,
            currentTrees: 0,
            totalInvestment: 0,
            investorCount: 0,
            isActive: true,
            creationTime: Math.floor(Date.now() / 1000),
            farmer: "0x0000...0000",
            metadataURI: ""
          }
          farmsData.push(farm)
        }
      }

      setFarms(farmsData)
      setLoading(false)
    }

    if (!farmIdsLoading) {
      fetchFarmDetails()
    }
  }, [farmIds, farmIdsLoading])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getUtilizationPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Management</CardTitle>
          <CardDescription>Connect your wallet to manage farms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please connect your wallet to access admin features</p>
            <Button>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Management</CardTitle>
          <CardDescription>Loading farms from blockchain...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-espresso mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching farm data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Farm Management</h3>
        <div className="text-sm text-gray-500">
          {farms.length} farm{farms.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{farm.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farm.location}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={farm.isActive ? "default" : "secondary"}>
                    {farm.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Farm Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Farm Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">GPS:</span>
                      <span className="text-sm font-mono">{farm.gpsCoordinates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area:</span>
                      <span className="text-sm">{(farm.totalArea || 0).toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Farmer:</span>
                      <span className="text-sm font-mono">{formatAddress(farm.farmer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{formatDate(farm.creationTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Tree Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Trees</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="text-sm font-semibold">{(farm.currentTrees || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm">{(farm.treeCapacity || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Utilization:</span>
                      <span className="text-sm font-semibold">
                        {getUtilizationPercentage(farm.currentTrees || 0, farm.treeCapacity || 1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${getUtilizationPercentage(farm.currentTrees || 0, farm.treeCapacity || 1)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Investment Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Investment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-semibold">${(farm.totalInvestment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investors:</span>
                      <span className="text-sm">{farm.investorCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Investor:</span>
                      <span className="text-sm">
                        ${Math.round((farm.totalInvestment || 0) / (farm.investorCount || 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Manage Trees
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Distribute Yield
                    </Button>
                    <Button 
                      size="sm" 
                      variant={farm.isActive ? "destructive" : "default"}
                      className="w-full"
                    >
                      {farm.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {farms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Farms Yet</h3>
            <p className="text-gray-600 mb-4">Create your first coffee farm to get started</p>
            <Button>Create Farm</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
