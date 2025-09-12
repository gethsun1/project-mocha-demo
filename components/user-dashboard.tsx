'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, TreePine, DollarSign, TrendingUp, Wallet, Award } from 'lucide-react'
import { CONTRACT_ADDRESSES, BEAN_TOKEN_ABI, FARM_MANAGER_ABI, VAULT_ABI } from '@/lib/contracts'

export function UserDashboard() {
  const { address, isConnected } = useAccount()
  const [userInvestments, setUserInvestments] = useState<any[]>([])
  const [userRewards, setUserRewards] = useState('0')

  // Get user's MBT balance
  const { data: mbtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get user's tree bonds
  const { data: treeBonds } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'treeBonds',
    args: address ? [address] : undefined,
  })

  // Get user's pending rewards
  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'calculateRewards',
    args: address ? [address] : undefined,
  })

  // Get user's investments from FarmManager
  const { data: investmentIndices } = useReadContract({
    address: CONTRACT_ADDRESSES.FarmManager,
    abi: FARM_MANAGER_ABI,
    functionName: 'getUserInvestments',
    args: address ? [address] : undefined,
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (pendingRewards) {
      setUserRewards((Number(pendingRewards) / 1e18).toFixed(2))
    }
  }, [pendingRewards])

  const handleClaimRewards = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.MochaBeanToken,
        abi: BEAN_TOKEN_ABI,
        functionName: 'claimRewards',
      })
    } catch (err) {
      console.error('Error claiming rewards:', err)
    }
  }

  const handlePurchaseTreeBonds = async (amount: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18))

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.MochaBeanToken,
        abi: BEAN_TOKEN_ABI,
        functionName: 'purchaseTreeBonds',
        args: [amountWei],
      })
    } catch (err) {
      console.error('Error purchasing tree bonds:', err)
    }
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return (Number(balance) / 1e18).toFixed(2)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to view your investments and rewards</p>
            <Button size="lg">Connect Wallet</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Manage your coffee farm investments and rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* MBT Balance & Tree Bonds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    MBT Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatBalance(mbtBalance)} MBT
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Available for investment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TreePine className="h-5 w-5 mr-2" />
                    Tree Bonds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatBalance(treeBonds)} trees
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Staked for rewards
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Rewards & Staking
                </CardTitle>
                <CardDescription>
                  Manage your tree bonds and claim rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-green-800">Pending Rewards</div>
                      <div className="text-2xl font-bold text-green-600">
                        {userRewards} MBT
                      </div>
                    </div>
                    <Button 
                      onClick={handleClaimRewards}
                      disabled={isPending || isConfirming || parseFloat(userRewards) === 0}
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        'Claim Rewards'
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>• Tree bonds earn 10% annual yield</p>
                    <p>• Rewards are calculated based on staking duration</p>
                    <p>• Unstaked MBTs older than 1 year are auto-redeemed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment History */}
            <Card>
              <CardHeader>
                <CardTitle>Investment History</CardTitle>
                <CardDescription>
                  Your coffee farm investments and vault shares
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investmentIndices && investmentIndices.length > 0 ? (
                  <div className="space-y-3">
                    {investmentIndices.map((index: bigint, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Investment #{Number(index)}</div>
                          <div className="text-sm text-gray-500">Active investment</div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No investments yet</p>
                    <p className="text-sm">Start investing in coffee farms to see your portfolio here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your investments and tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    const amount = prompt('Enter MBT amount to stake as tree bonds (minimum 4 MBT):')
                    if (amount && parseFloat(amount) >= 4) {
                      handlePurchaseTreeBonds(amount)
                    }
                  }}
                >
                  <TreePine className="h-4 w-4 mr-2" />
                  Stake MBT as Tree Bonds
                </Button>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // This would open a modal or navigate to unstaking
                    alert('Unstaking functionality coming soon!')
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Unstake Tree Bonds
                </Button>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // This would open a modal or navigate to farm list
                    window.location.href = '/#farms'
                  }}
                >
                  <TreePine className="h-4 w-4 mr-2" />
                  Browse Farms
                </Button>
              </CardContent>
            </Card>

            {/* Status Messages */}
            {error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-red-600 text-sm">
                    Error: {error.message}
                  </div>
                </CardContent>
              </Card>
            )}

            {isSuccess && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-green-600 text-sm">
                    Transaction successful! Hash: {hash?.slice(0, 10)}...
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
