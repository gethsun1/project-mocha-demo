'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { useRouter } from 'next/navigation'
import { createPublicClient, http } from 'viem'
import { scrollSepolia } from 'viem/chains'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TreePine, DollarSign, TrendingUp } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
  const router = useRouter()
  const [investmentType, setInvestmentType] = useState<'trees' | 'vault'>('trees')
  const [amount, setAmount] = useState('')
  const [treeCount, setTreeCount] = useState('')

  // Create public client for transaction monitoring
  const publicClient = createPublicClient({
    chain: scrollSepolia,
    transport: http('https://sepolia-rpc.scroll.io')
  })

  // Helper function to safely parse tree count
  const getTreeCount = () => {
    if (!treeCount || isNaN(parseInt(treeCount))) return 0
    return parseInt(treeCount)
  }

  // Refresh farm data
  const refreshFarmData = async () => {
    try {
      const response = await fetch(`/api/farm-data?farmId=${farmId}&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Refreshed farm data:', data)
        setLastRefresh(Date.now())
      }
    } catch (error) {
      console.error('Error refreshing farm data:', error)
    }
  }

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

  // Get current MBT allowance for FarmManager
  const { data: currentAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.FarmManager] : undefined,
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const [isApproving, setIsApproving] = useState(false)
  const [approvalHash, setApprovalHash] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  // Handle approval transaction completion and auto-proceed with purchase
  useEffect(() => {
    if (hash && isApproving) {
      console.log('Approval transaction submitted, waiting for confirmation...')
      setApprovalHash(hash)
      
      // Use a more reliable approach - wait for the transaction receipt
      const waitForApproval = async () => {
        try {
          // Wait for the approval transaction to be mined
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: hash as `0x${string}`,
            timeout: 60000 // 60 seconds timeout
          })
          
          if (receipt.status === 'success') {
            console.log('Approval confirmed, proceeding with purchase...')
            setIsApproving(false)
            
            // Small delay to ensure the allowance is updated
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Proceed with the purchase
            const treeCountNum = parseInt(treeCount)
            console.log('Proceeding with purchase after approval...', {
              farmId: farmId,
              treeCount: treeCountNum
            })
            
            // Try with manual gas estimation as fallback
            try {
              console.log('Attempting purchase with manual gas estimation...')
              writeContract({
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FARM_MANAGER_ABI,
                functionName: 'purchaseTrees',
                args: [BigInt(farmId), BigInt(treeCountNum)],
                gas: BigInt(500000), // Manual gas limit
              })
            } catch (gasError) {
              console.error('First gas estimation failed, trying with higher gas limit:', gasError)
              try {
                // Try with higher gas limit
                writeContract({
                  address: CONTRACT_ADDRESSES.FarmManager,
                  abi: FARM_MANAGER_ABI,
                  functionName: 'purchaseTrees',
                  args: [BigInt(farmId), BigInt(treeCountNum)],
                  gas: BigInt(1000000), // Higher gas limit
                })
              } catch (finalError) {
                console.error('All gas estimation attempts failed:', finalError)
                alert('Transaction failed. Please try again or contact support.')
                setIsProcessing(false)
                setIsApproving(false)
              }
            }
          } else {
            console.error('Approval transaction failed')
            setIsApproving(false)
            setIsProcessing(false)
          }
        } catch (err) {
          console.error('Error waiting for approval:', err)
          setIsApproving(false)
          setIsProcessing(false)
        }
      }
      
      waitForApproval()
    }
  }, [hash, isApproving, treeCount, farmId, writeContract])

  // Handle successful investment - refresh data and redirect to dashboard
  useEffect(() => {
    if (isSuccess) {
      // Refresh farm data after successful transaction
      refreshFarmData()
      
      // Wait a moment for the transaction to be fully processed
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [isSuccess, router])

  // Reset processing state on error
  useEffect(() => {
    if (error) {
      setIsProcessing(false)
      setIsApproving(false)
    }
  }, [error])


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

    const totalCost = treeCountNum * 4 * 1e18 // 4 MBT per tree in wei

    try {
      setIsProcessing(true)
      
      // First, check if user has enough MBT
      if (!mbtBalance || mbtBalance < BigInt(totalCost)) {
        alert('Insufficient MBT balance. You need at least ' + (treeCountNum * 4) + ' MBT.')
        setIsProcessing(false)
        return
      }

      // Check if approval is needed and handle it automatically
      if (!currentAllowance || currentAllowance < BigInt(totalCost)) {
        console.log('Approval needed, requesting approval first...')
        setIsApproving(true)
        
        // Approve exactly the amount needed for this transaction
        const approvalAmount = BigInt(totalCost)
        
        writeContract({
          address: CONTRACT_ADDRESSES.MochaBeanToken,
          abi: BEAN_TOKEN_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.FarmManager, approvalAmount],
        })
        
        console.log('Approval transaction submitted for exact amount:', approvalAmount.toString())
        
        // Wait for approval to be confirmed before proceeding
        // The useEffect will handle the approval completion
        return
      }

      // If we have sufficient allowance, proceed with purchase
      console.log('Purchasing trees...', {
        farmId: farmId,
        treeCount: treeCountNum,
        totalCost: totalCost,
        allowance: currentAllowance?.toString()
      })
      
      // Try with manual gas estimation as fallback
      try {
        await writeContract({
          address: CONTRACT_ADDRESSES.FarmManager,
          abi: FARM_MANAGER_ABI,
          functionName: 'purchaseTrees',
          args: [BigInt(farmId), BigInt(treeCountNum)],
          gas: BigInt(500000), // Manual gas limit
        })
      } catch (gasError) {
        console.error('Gas estimation failed, trying with higher gas limit:', gasError)
        // Try with higher gas limit
        await writeContract({
          address: CONTRACT_ADDRESSES.FarmManager,
          abi: FARM_MANAGER_ABI,
          functionName: 'purchaseTrees',
          args: [BigInt(farmId), BigInt(treeCountNum)],
          gas: BigInt(1000000), // Higher gas limit
        })
      }
    } catch (err) {
      console.error('Error in investment process:', err)
      alert('Error: ' + (err as Error).message)
      setIsProcessing(false)
      setIsApproving(false)
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
            <ConnectButton />
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
        {/* Farm Data Display */}
        <div className="mb-6 p-4 bg-coffee-light/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-coffee-espresso">Current Farm Data</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshFarmData}
              className="text-xs"
            >
              🔄 Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-coffee-mocha">Current Trees:</span>
              <span className="ml-1 font-semibold">{totalTrees}</span>
            </div>
            <div>
              <span className="text-coffee-mocha">Capacity:</span>
              <span className="ml-1 font-semibold">2,800</span>
            </div>
            <div>
              <span className="text-coffee-mocha">Total Investment:</span>
              <span className="ml-1 font-semibold">${totalInvestment.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-coffee-mocha">Investors:</span>
              <span className="ml-1 font-semibold">{investorCount}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-coffee-medium">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </div>
        </div>

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
            <div className="space-y-4">
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
                  Cost: {(getTreeCount() * 4).toFixed(2)} MBT
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Note: Contract data may be corrupted. Transaction will use manual gas estimation.
                </p>
              </div>

              {/* Approval Status */}
              {currentAllowance && currentAllowance > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ MBT Approved: {Number(currentAllowance) / 1e18} MBT
                    {getTreeCount() > 0 && currentAllowance >= BigInt(getTreeCount() * 4 * 1e18) && (
                      <span className="block text-xs text-green-600 mt-1">
                        Sufficient allowance for {getTreeCount()} trees
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Purchase Button - Handles approval automatically */}
              <form onSubmit={handleTreeInvestment}>
                <Button 
                  type="submit" 
                  className="w-full coffee-hover" 
                  disabled={isPending || isConfirming || isProcessing || isApproving || !treeCount}
                >
                  {isPending || isConfirming || isProcessing || isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isApproving ? 'Approving MBT...' : isPending ? 'Purchasing Trees...' : 'Processing...'}
                    </>
                  ) : (
                    'Purchase Trees'
                  )}
                </Button>
              </form>
            </div>
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

          {approvalHash && (
            <div className="text-blue-600 text-sm">
              Approval transaction submitted: {approvalHash}
              <br />
              <span className="text-gray-600">
                Approving {(getTreeCount() * 4).toFixed(2)} MBT for purchase...
              </span>
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm">
              Investment successful! Transaction hash: {hash}
              <br />
              <span className="text-blue-600">Redirecting to dashboard...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
