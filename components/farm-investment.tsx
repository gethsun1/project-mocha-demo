'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TreePine, DollarSign, TrendingUp } from 'lucide-react'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI, VAULT_ABI, BEAN_TOKEN_ABI } from '@/lib/contracts'

interface FarmInvestmentProps {
  farmId: number
  farmName: string
  farmLocation: string
  apy: number
  maturity: string
  totalInvestment: number
  totalTrees: number
  investorCount: number
}

export function FarmInvestment({ 
  farmId, 
  farmName, 
  farmLocation, 
  apy, 
  maturity, 
  totalInvestment, 
  totalTrees, 
  investorCount 
}: FarmInvestmentProps) {
  const { address, isConnected } = useAccount()
  const [investmentType, setInvestmentType] = useState<'trees' | 'vault'>('trees')
  const [amount, setAmount] = useState('')
  const [treeCount, setTreeCount] = useState('')

  // Get user's MBT balance
  const { data: mbtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get vault tranche info
  const { data: vaultInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaVault,
    abi: VAULT_ABI,
    functionName: 'getTrancheInfo',
    args: [BigInt(farmId)],
  })

  // Get user's vault shares
  const { data: userShares } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaVault,
    abi: VAULT_ABI,
    functionName: 'getUserShares',
    args: address ? [address, BigInt(farmId)] : undefined,
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleTreeInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const treeCountNum = parseInt(treeCount)
    if (treeCountNum <= 0) {
      alert('Please enter a valid number of trees')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FARM_MANAGER_ABI,
        functionName: 'purchaseTrees',
        args: [BigInt(farmId), BigInt(treeCountNum)],
      })
    } catch (err) {
      console.error('Error purchasing trees:', err)
    }
  }

  const handleVaultInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      alert('Please enter a valid investment amount')
      return
    }

    const amountWei = BigInt(Math.floor(amountNum * 1e18))

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FARM_MANAGER_ABI,
        functionName: 'investInVault',
        args: [BigInt(farmId), amountWei],
      })
    } catch (err) {
      console.error('Error investing in vault:', err)
    }
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return (Number(balance) / 1e18).toFixed(2)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Options</CardTitle>
          <CardDescription>Connect your wallet to invest in this farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please connect your wallet to start investing</p>
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
          <TreePine className="h-5 w-5 mr-2" />
          Investment Options
        </CardTitle>
        <CardDescription>
          Choose how you want to invest in {farmName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Investment Type Selection */}
          <div className="flex space-x-2">
            <Button
              variant={investmentType === 'trees' ? 'default' : 'outline'}
              onClick={() => setInvestmentType('trees')}
              className="flex-1"
            >
              <TreePine className="h-4 w-4 mr-2" />
              Buy Trees
            </Button>
            <Button
              variant={investmentType === 'vault' ? 'default' : 'outline'}
              onClick={() => setInvestmentType('vault')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Vault Investment
            </Button>
          </div>

          {/* MBT Balance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your MBT Balance</span>
              <span className="font-semibold">{formatBalance(mbtBalance)} MBT</span>
            </div>
          </div>

          {/* Tree Investment Form */}
          {investmentType === 'trees' && (
            <form onSubmit={handleTreeInvestment} className="space-y-4">
              <div>
                <Label htmlFor="treeCount">Number of Trees</Label>
                <Input
                  id="treeCount"
                  type="number"
                  value={treeCount}
                  onChange={(e) => setTreeCount(e.target.value)}
                  placeholder="Enter number of trees (4 MBT per tree)"
                  min="1"
                  max="500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Cost: {treeCount ? (parseInt(treeCount) * 4).toFixed(2) : '0'} MBT
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending || isConfirming || !treeCount}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? 'Purchasing Trees...' : 'Confirming...'}
                  </>
                ) : (
                  'Purchase Trees'
                )}
              </Button>
            </form>
          )}

          {/* Vault Investment Form */}
          {investmentType === 'vault' && vaultInfo && (
            <form onSubmit={handleVaultInvestment} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">APY</span>
                  <Badge variant="secondary">{apy}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maturity</span>
                  <span className="text-sm font-medium">{maturity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Min Investment</span>
                  <span className="text-sm font-medium">
                    {Number(vaultInfo.minInvestment) / 1e18} MBT
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Investment</span>
                  <span className="text-sm font-medium">
                    {Number(vaultInfo.maxInvestment) / 1e18} MBT
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Investment Amount (MBT)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in MBT"
                  min={Number(vaultInfo.minInvestment) / 1e18}
                  max={Number(vaultInfo.maxInvestment) / 1e18}
                  step="1"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending || isConfirming || !amount}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? 'Investing...' : 'Confirming...'}
                  </>
                ) : (
                  'Invest in Vault'
                )}
              </Button>
            </form>
          )}

          {/* User's Current Investment */}
          {userShares && Number(userShares) > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Your Vault Shares</span>
                <span className="font-semibold text-green-800">
                  {Number(userShares).toFixed(2)} shares
                </span>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.message}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm">
              Investment successful! Transaction hash: {hash}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
