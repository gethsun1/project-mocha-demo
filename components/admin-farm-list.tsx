'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, TreePine, DollarSign, Users, Calendar, Settings } from 'lucide-react'

// Contract ABIs
const FARM_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "getAllFarms",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "farmId", "type": "uint256"}],
    "name": "getFarmStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalInvestment", "type": "uint256"},
      {"internalType": "uint256", "name": "totalTrees", "type": "uint256"},
      {"internalType": "uint256", "name": "investorCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const LAND_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getFarmData",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "string", "name": "gpsCoordinates", "type": "string"},
          {"internalType": "uint256", "name": "totalArea", "type": "uint256"},
          {"internalType": "uint256", "name": "treeCapacity", "type": "uint256"},
          {"internalType": "uint256", "name": "currentTrees", "type": "uint256"},
          {"internalType": "uint256", "name": "creationTime", "type": "uint256"},
          {"internalType": "address", "name": "farmer", "type": "address"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "internalType": "struct MochaLandToken.FarmData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// Mock data for demonstration
const mockFarms = [
  {
    id: 1,
    name: "Ethiopian Highlands Farm",
    location: "Yirgacheffe, Ethiopia",
    gpsCoordinates: "6.8417,38.2051",
    totalArea: 10000,
    treeCapacity: 2000,
    currentTrees: 1500,
    totalInvestment: 125000,
    investorCount: 45,
    isActive: true,
    creationTime: 1690123456,
    farmer: "0x742d35Cc6634C0532925a3b8D0C4E4C4C4C4C4C4C4",
    metadataURI: "https://metadata.projectmocha.com/farm/1"
  },
  {
    id: 2,
    name: "Colombian Mountain Farm",
    location: "Huila, Colombia",
    gpsCoordinates: "2.4600,-75.6000",
    totalArea: 8000,
    treeCapacity: 1500,
    currentTrees: 1200,
    totalInvestment: 87500,
    investorCount: 32,
    isActive: true,
    creationTime: 1690123456,
    farmer: "0x742d35Cc6634C0532925a3b8D0C4E4C4C4C4C4C4C4",
    metadataURI: "https://metadata.projectmocha.com/farm/2"
  },
  {
    id: 3,
    name: "Guatemalan Volcanic Farm",
    location: "Antigua, Guatemala",
    gpsCoordinates: "14.5500,-90.7333",
    totalArea: 12000,
    treeCapacity: 1800,
    currentTrees: 1800,
    totalInvestment: 95000,
    investorCount: 28,
    isActive: false,
    creationTime: 1690123456,
    farmer: "0x742d35Cc6634C0532925a3b8D0C4E4C4C4C4C4C4C4",
    metadataURI: "https://metadata.projectmocha.com/farm/3"
  }
]

export function AdminFarmList() {
  const { address, isConnected } = useAccount()
  const [farms, setFarms] = useState(mockFarms)
  const [loading, setLoading] = useState(false)

  // TODO: Replace with actual contract calls
  // const { data: farmIds } = useReadContract({
  //   address: '0x...', // Farm Manager contract address
  //   abi: FARM_MANAGER_ABI,
  //   functionName: 'getAllFarms',
  // })

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
                      <span className="text-sm">{farm.totalArea.toLocaleString()} m²</span>
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
                      <span className="text-sm font-semibold">{farm.currentTrees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm">{farm.treeCapacity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Utilization:</span>
                      <span className="text-sm font-semibold">
                        {getUtilizationPercentage(farm.currentTrees, farm.treeCapacity)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${getUtilizationPercentage(farm.currentTrees, farm.treeCapacity)}%` }}
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
                      <span className="text-sm font-semibold">${farm.totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investors:</span>
                      <span className="text-sm">{farm.investorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Investor:</span>
                      <span className="text-sm">
                        ${Math.round(farm.totalInvestment / farm.investorCount).toLocaleString()}
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
