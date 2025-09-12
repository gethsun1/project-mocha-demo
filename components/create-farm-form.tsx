'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI } from '@/lib/contracts'

export function CreateFarmForm() {
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    farmer: '',
    name: '',
    location: '',
    gpsCoordinates: '',
    totalArea: '',
    treeCapacity: '',
    metadataURI: '',
    apy: '12', // 12% (will convert to basis points)
    maturity: '5', // 5 years (will convert to seconds)
    minInvestment: '100', // 100 MBT (will convert to wei)
    maxInvestment: '2000' // 2000 MBT (will convert to wei)
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Convert user-friendly values to contract format
      const apyBasisPoints = BigInt(parseFloat(formData.apy) * 100) // Convert percentage to basis points
      const maturitySeconds = BigInt(parseFloat(formData.maturity) * 365 * 24 * 60 * 60) // Convert years to seconds
      const minInvestmentWei = BigInt(parseFloat(formData.minInvestment) * 1e18) // Convert MBT to wei
      const maxInvestmentWei = BigInt(parseFloat(formData.maxInvestment) * 1e18) // Convert MBT to wei

      writeContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FARM_MANAGER_ABI,
        functionName: 'createFarm',
        args: [
          (formData.farmer || address || '0x0000000000000000000000000000000000000000') as `0x${string}`, // Use connected address if farmer not specified
          formData.name,
          formData.location,
          formData.gpsCoordinates,
          BigInt(formData.totalArea),
          BigInt(formData.treeCapacity),
          formData.metadataURI,
          apyBasisPoints,
          maturitySeconds,
          minInvestmentWei,
          maxInvestmentWei
        ],
      })
    } catch (err) {
      console.error('Error creating farm:', err)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Farm</CardTitle>
          <CardDescription>Connect your wallet to create a new coffee farm</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create New Farm
        </CardTitle>
        <CardDescription>
          Add a new coffee farm to the platform. All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Farm Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ethiopian Highlands Farm"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Yirgacheffe, Ethiopia"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
              <Input
                id="gpsCoordinates"
                name="gpsCoordinates"
                value={formData.gpsCoordinates}
                onChange={handleInputChange}
                placeholder="e.g., 6.8417,38.2051"
                required
              />
            </div>

            <div>
              <Label htmlFor="metadataURI">Metadata URI</Label>
              <Input
                id="metadataURI"
                name="metadataURI"
                value={formData.metadataURI}
                onChange={handleInputChange}
                placeholder="https://metadata.projectmocha.com/farm/1"
                required
              />
            </div>
          </div>

          {/* Farm Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Farm Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalArea">Total Area (sq meters)</Label>
                <Input
                  id="totalArea"
                  name="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={handleInputChange}
                  placeholder="10000"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="treeCapacity">Tree Capacity</Label>
                <Input
                  id="treeCapacity"
                  name="treeCapacity"
                  type="number"
                  value={formData.treeCapacity}
                  onChange={handleInputChange}
                  placeholder="2000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Investment Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apy">Annual Percentage Yield (%)</Label>
                <Input
                  id="apy"
                  name="apy"
                  type="number"
                  value={formData.apy}
                  onChange={handleInputChange}
                  placeholder="12"
                  min="1"
                  max="50"
                  step="0.1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter APY as percentage (e.g., 12 for 12%)</p>
              </div>
              
              <div>
                <Label htmlFor="maturity">Maturity Period (years)</Label>
                <Input
                  id="maturity"
                  name="maturity"
                  type="number"
                  value={formData.maturity}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="1"
                  max="10"
                  step="0.5"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Investment maturity in years</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minInvestment">Minimum Investment (MBT)</Label>
                <Input
                  id="minInvestment"
                  name="minInvestment"
                  type="number"
                  value={formData.minInvestment}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  step="1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Minimum investment amount in MBT tokens</p>
              </div>
              
              <div>
                <Label htmlFor="maxInvestment">Maximum Investment (MBT)</Label>
                <Input
                  id="maxInvestment"
                  name="maxInvestment"
                  type="number"
                  value={formData.maxInvestment}
                  onChange={handleInputChange}
                  placeholder="2000"
                  min="1"
                  step="1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Maximum investment amount in MBT tokens</p>
              </div>
            </div>
          </div>

          {/* Farmer Address */}
          <div>
            <Label htmlFor="farmer">Farmer Address (optional)</Label>
            <Input
              id="farmer"
              name="farmer"
              value={formData.farmer}
              onChange={handleInputChange}
              placeholder="Leave empty to use connected address"
            />
            <p className="text-sm text-gray-500 mt-1">
              If left empty, the connected wallet address will be used as the farmer
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending ? 'Creating Farm...' : 'Confirming...'}
                </>
              ) : (
                'Create Farm'
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.message}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm">
              Farm created successfully! Transaction hash: {hash}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
