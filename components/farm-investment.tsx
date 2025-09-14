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
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI, VAULT_ABI, BEAN_TOKEN_ABI, LAND_TOKEN_ABI, TREE_TOKEN_ABI } from '@/lib/contracts'

interface FarmInvestmentProps {
  farmId: number
  farmName: string
  farmLocation: string
  apy: number
  maturity: string
  totalInvestment: number
  totalTrees: number
  treeCapacity: number
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
  treeCapacity,
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

  // Get farm data to validate farm exists
  const { data: farmData, error: farmDataError } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaLandToken,
    abi: LAND_TOKEN_ABI,
    functionName: 'getFarmData',
    args: [BigInt(farmId)],
  })

  // Debug farm data loading
  console.log('Farm data loading status:', {
    farmId: farmId,
    farmData: farmData,
    farmDataError: farmDataError,
    isLoading: !farmData && !farmDataError
  })

  // If contract data is not available, use fallback data from props
  const effectiveFarmData = farmData || {
    name: farmName,
    isActive: true, // Assume active if we can't check
    currentTrees: BigInt(totalTrees || 0),
    treeCapacity: BigInt(treeCapacity || 1000), // Default capacity
    farmer: address || '0x0000000000000000000000000000000000000000'
  } as any

  // Get total farms count
  const { data: totalFarms } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaLandToken,
    abi: LAND_TOKEN_ABI,
    functionName: 'getTotalFarms',
  })

  // Check if FarmManager is paused
  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.FarmManager,
    abi: FARM_MANAGER_ABI,
    functionName: 'paused',
  })

  // Check if MochaTreeToken is paused
  const { data: isTreeTokenPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaTreeToken,
    abi: TREE_TOKEN_ABI,
    functionName: 'paused',
  })

  // Check if FarmManager is authorized to mint trees
  const { data: treeTokenFarmManager } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaTreeToken,
    abi: TREE_TOKEN_ABI,
    functionName: 'farmManager',
  })

  // Check if MochaBeanToken is paused
  const { data: isBeanTokenPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'paused',
  })

  // Check if FarmManager is authorized to call MBT functions
  const { data: beanTokenFarmManager } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'farmManager',
  })

  // Check if MochaLandToken is paused
  const { data: isLandTokenPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaLandToken,
    abi: LAND_TOKEN_ABI,
    functionName: 'paused',
  })

  // Check if FarmManager is authorized to call land token functions
  const { data: landTokenFarmManager } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaLandToken,
    abi: LAND_TOKEN_ABI,
    functionName: 'farmManager',
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

  // Get FarmManager's MBT balance
  const { data: farmManagerMBTBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MochaBeanToken,
    abi: BEAN_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.FarmManager],
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const [isApproving, setIsApproving] = useState(false)
  const [approvalHash, setApprovalHash] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [transactionType, setTransactionType] = useState<'approval' | 'purchase' | null>(null)

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
            timeout: 120000 // 2 minutes timeout
          })
          
          if (receipt.status === 'success') {
            console.log('Approval confirmed, proceeding with purchase...')
            setIsApproving(false)
            
            // Wait a bit longer to ensure the allowance is updated on-chain
            await new Promise(resolve => setTimeout(resolve, 5000))
            
            // Proceed with the purchase
            const treeCountNum = parseInt(treeCount)
            console.log('Proceeding with purchase after approval...', {
              farmId: farmId,
              treeCount: treeCountNum
            })
            
            // Proceed with purchase after approval
            setTransactionType('purchase')
            
            try {
              // Wait a bit more to ensure allowance is fully updated
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              // Use a more conservative approach with proper gas estimation
              console.log('Submitting purchase transaction after approval...')
              
              const contractCall: any = {
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FARM_MANAGER_ABI,
                functionName: 'purchaseTrees',
                args: [BigInt(farmId), BigInt(treeCountNum)] as const,
                gas: BigInt(600000) // Conservative gas limit
              }

              writeContract(contractCall)
              console.log('✅ Purchase transaction submitted after approval')
              
            } catch (purchaseError: any) {
              console.error('Error in purchase after approval:', purchaseError)
              
              let errorMessage = 'Error purchasing trees after approval: ' + (purchaseError?.message || 'Unknown error')
              
              if (purchaseError?.message?.includes('missing revert data')) {
                errorMessage = 'Contract call failed after approval. This might be due to:\n' +
                  '1. Farm not properly initialized\n' +
                  '2. Contract state issues\n' +
                  '3. Network connectivity problems\n\n' +
                  'Please try refreshing the page and ensure the farm exists.'
              } else if (purchaseError?.message?.includes('insufficient allowance')) {
                errorMessage = 'Insufficient allowance after approval. Please try again.'
              } else if (purchaseError?.message?.includes('exceeds farm capacity')) {
                errorMessage = 'Cannot purchase this many trees. Farm capacity exceeded.'
              }
              
              alert(errorMessage)
              setIsProcessing(false)
              setTransactionType(null)
            }
          } else {
            console.error('Approval transaction failed')
            setIsApproving(false)
            setIsProcessing(false)
            setTransactionType(null)
          }
        } catch (err) {
          console.error('Error waiting for approval:', err)
          setIsApproving(false)
          setIsProcessing(false)
          setTransactionType(null)
        }
      }
      
      waitForApproval()
    }
  }, [hash, isApproving, treeCount, farmId, writeContract])

  // Handle successful investment - refresh data and redirect to dashboard
  useEffect(() => {
    if (isSuccess && transactionType === 'purchase') {
      // Only redirect if this was a purchase transaction, not an approval
      console.log('Purchase transaction successful, refreshing data...')
      refreshFarmData()
      
      // Wait a moment for the transaction to be fully processed
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }, [isSuccess, transactionType, router])

  // Reset processing state on error
  useEffect(() => {
    if (error) {
      console.error('❌ WriteContract Error:', error)
      setIsProcessing(false)
      setIsApproving(false)
      setTransactionType(null)
    }
  }, [error])

  // Handle transaction receipt errors
  useEffect(() => {
    if (receiptError) {
      console.error('❌ Transaction Receipt Error:', receiptError)
      console.error('❌ Transaction failed with error:', receiptError.message)
      setIsProcessing(false)
      setIsApproving(false)
      setTransactionType(null)
    }
  }, [receiptError])


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

    // Validate farm exists and is properly loaded
    if (!farmData && farmDataError) {
      alert('Error loading farm data: ' + farmDataError.message)
      return
    }

    console.log('Using farm data:', {
      fromContract: !!farmData,
      fromProps: !farmData,
      effectiveFarmData: effectiveFarmData
    })

    // Debug farm data
    console.log('Farm data validation:', {
      effectiveFarmData: effectiveFarmData,
      currentTrees: effectiveFarmData?.currentTrees,
      treeCapacity: effectiveFarmData?.treeCapacity,
      isActive: effectiveFarmData?.isActive,
      hasCurrentTrees: effectiveFarmData?.currentTrees !== undefined,
      hasTreeCapacity: effectiveFarmData?.treeCapacity !== undefined
    })

    // Check if farm is active
    if (!effectiveFarmData.isActive) {
      alert('This farm is not active and cannot accept investments.')
      return
    }

    // Validate farm data structure - be more lenient with validation
    if (!effectiveFarmData) {
      alert('Farm data not found. Please refresh the page and try again.')
      return
    }
    
    // Check if required fields exist, but allow for 0 values
    if (effectiveFarmData.currentTrees === undefined || effectiveFarmData.treeCapacity === undefined) {
      console.error('Farm data missing required fields:', {
        currentTrees: effectiveFarmData.currentTrees,
        treeCapacity: effectiveFarmData.treeCapacity,
        fullFarmData: effectiveFarmData
      })
      alert('Farm data is incomplete. Please refresh the page and try again.')
      return
    }

    // Check farm capacity
    const currentTrees = Number(effectiveFarmData.currentTrees)
    const effectiveTreeCapacity = Number(effectiveFarmData.treeCapacity)
    
    if (isNaN(currentTrees) || isNaN(effectiveTreeCapacity)) {
      alert('Invalid farm data. Please refresh the page and try again.')
      return
    }
    
    if (currentTrees + treeCountNum > effectiveTreeCapacity) {
      alert(`Cannot purchase ${treeCountNum} trees. Farm capacity: ${effectiveTreeCapacity}, Current trees: ${currentTrees}, Available: ${effectiveTreeCapacity - currentTrees}`)
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

      console.log('🔍 COMPREHENSIVE DEBUG INFO:')
      console.log('Contract States:', {
        farmManagerPaused: isPaused,
        treeTokenPaused: isTreeTokenPaused,
        beanTokenPaused: isBeanTokenPaused,
        landTokenPaused: isLandTokenPaused,
        treeTokenFarmManager: treeTokenFarmManager,
        beanTokenFarmManager: beanTokenFarmManager,
        landTokenFarmManager: landTokenFarmManager,
        farmManagerAuthorizedForTrees: treeTokenFarmManager === CONTRACT_ADDRESSES.FarmManager,
        farmManagerAuthorizedForMBT: beanTokenFarmManager === CONTRACT_ADDRESSES.FarmManager,
        farmManagerAuthorizedForLand: landTokenFarmManager === CONTRACT_ADDRESSES.FarmManager
      })
      
      console.log('💰 MBT Balance Analysis:', {
        userMBTBalance: mbtBalance?.toString(),
        farmManagerMBTBalance: farmManagerMBTBalance?.toString(),
        userAllowance: currentAllowance?.toString(),
        totalCost: totalCost.toString(),
        userHasEnoughBalance: mbtBalance && mbtBalance >= BigInt(totalCost),
        farmManagerHasEnoughBalance: farmManagerMBTBalance && farmManagerMBTBalance >= BigInt(totalCost),
        userHasEnoughAllowance: currentAllowance && currentAllowance >= BigInt(totalCost)
      })
      
      console.log('Starting tree purchase process...', {
        farmId: farmId,
        treeCount: treeCountNum,
        totalCost: totalCost,
        userBalance: mbtBalance?.toString(),
        currentAllowance: currentAllowance?.toString(),
        farmData: {
          name: effectiveFarmData.name,
          isActive: effectiveFarmData.isActive,
          currentTrees: currentTrees,
          treeCapacity: effectiveTreeCapacity,
          availableCapacity: effectiveTreeCapacity - currentTrees,
          farmer: effectiveFarmData.farmer
        },
        totalFarms: totalFarms?.toString(),
        contractAddresses: {
          FarmManager: CONTRACT_ADDRESSES.FarmManager,
          MochaBeanToken: CONTRACT_ADDRESSES.MochaBeanToken,
          MochaTreeToken: CONTRACT_ADDRESSES.MochaTreeToken
        },
        contractStates: {
          farmManagerPaused: isPaused,
          treeTokenPaused: isTreeTokenPaused,
          beanTokenPaused: isBeanTokenPaused,
          landTokenPaused: isLandTokenPaused,
          treeTokenFarmManager: treeTokenFarmManager,
          beanTokenFarmManager: beanTokenFarmManager,
          landTokenFarmManager: landTokenFarmManager,
          farmManagerAuthorizedForTrees: treeTokenFarmManager === CONTRACT_ADDRESSES.FarmManager,
          farmManagerAuthorizedForMBT: beanTokenFarmManager === CONTRACT_ADDRESSES.FarmManager,
          farmManagerAuthorizedForLand: landTokenFarmManager === CONTRACT_ADDRESSES.FarmManager
        },
        contractRequirements: {
          TREE_PRICE: '4000000000000000000', // 4 MBT in wei
          MIN_INVESTMENT: '100000000000000000000', // 100 MBT in wei
          PILOT_INVESTMENT_CAP: '2000000000000000000000', // 2000 MBT in wei
          maxTreesPerPurchase: 500
        },
        validation: {
          treeCountValid: treeCountNum > 0 && treeCountNum <= 500,
          totalCostValid: totalCost >= 100000000000000000000 && totalCost <= 2000000000000000000000,
          hasEnoughBalance: mbtBalance && mbtBalance >= BigInt(totalCost),
          hasEnoughAllowance: currentAllowance && currentAllowance >= BigInt(totalCost),
          farmCapacityValid: currentTrees + treeCountNum <= effectiveTreeCapacity
        }
      })

      // Additional validation before proceeding
      if (!totalFarms || totalFarms < BigInt(farmId)) {
        alert(`Farm ID ${farmId} does not exist. Total farms: ${totalFarms?.toString() || 'Unknown'}`)
        setIsProcessing(false)
        return
      }

      // Check if contracts are paused
      if (isPaused) {
        alert('The FarmManager contract is currently paused. Please try again later.')
        setIsProcessing(false)
        return
      }

      if (isTreeTokenPaused) {
        alert('The MochaTreeToken contract is currently paused. Please try again later.')
        setIsProcessing(false)
        return
      }

      // Check if FarmManager is authorized to mint trees
      if (!treeTokenFarmManager || treeTokenFarmManager !== CONTRACT_ADDRESSES.FarmManager) {
        alert(`FarmManager is not authorized to mint trees. Expected: ${CONTRACT_ADDRESSES.FarmManager}, Got: ${treeTokenFarmManager || 'Not set'}`)
        setIsProcessing(false)
        return
      }

      // Check if MochaBeanToken is paused
      if (isBeanTokenPaused) {
        alert('The MochaBeanToken contract is currently paused. Please try again later.')
        setIsProcessing(false)
        return
      }

      // Check if FarmManager is authorized to call MBT functions
      if (!beanTokenFarmManager || beanTokenFarmManager !== CONTRACT_ADDRESSES.FarmManager) {
        alert(`FarmManager is not authorized to call MBT functions. Expected: ${CONTRACT_ADDRESSES.FarmManager}, Got: ${beanTokenFarmManager || 'Not set'}`)
        setIsProcessing(false)
        return
      }

      // Check if MochaLandToken is paused
      if (isLandTokenPaused) {
        alert('The MochaLandToken contract is currently paused. Please try again later.')
        setIsProcessing(false)
        return
      }

      // Check if FarmManager is authorized to call land token functions
      if (!landTokenFarmManager || landTokenFarmManager !== CONTRACT_ADDRESSES.FarmManager) {
        alert(`FarmManager is not authorized to call land token functions. Expected: ${CONTRACT_ADDRESSES.FarmManager}, Got: ${landTokenFarmManager || 'Not set'}`)
        setIsProcessing(false)
        return
      }

      // Check if there's a potential balance issue
      if (farmManagerMBTBalance && farmManagerMBTBalance < BigInt(totalCost)) {
        console.warn('⚠️ FarmManager has insufficient MBT balance:', {
          farmManagerBalance: farmManagerMBTBalance.toString(),
          requiredAmount: totalCost.toString(),
          userBalance: mbtBalance?.toString()
        })
        console.error('🚨 CONTRACT BUG DETECTED!')
        console.error('The contract is checking FarmManager balance instead of user balance!')
        console.error('This is a critical bug in the deployed contract.')
        console.error('FarmManager needs', (Number(totalCost) / 1e18).toFixed(2), 'MBT but only has', (Number(farmManagerMBTBalance) / 1e18).toFixed(2), 'MBT')
        
        // Ask user if they want to transfer MBT to FarmManager as a workaround
        const transferAmount = BigInt(totalCost) - farmManagerMBTBalance
        const transferAmountMBT = Number(transferAmount) / 1e18
        
        const shouldTransfer = confirm(
          `CONTRACT BUG DETECTED!\n\n` +
          `The contract has a bug and is checking FarmManager's balance instead of your balance.\n\n` +
          `FarmManager needs ${(Number(totalCost) / 1e18).toFixed(2)} MBT but only has ${(Number(farmManagerMBTBalance) / 1e18).toFixed(2)} MBT.\n\n` +
          `Would you like to transfer ${transferAmountMBT.toFixed(2)} MBT to FarmManager as a workaround?\n\n` +
          `This is a temporary fix for the contract bug.`
        )
        
        if (shouldTransfer) {
          console.log('🔄 Transferring MBT to FarmManager as workaround...')
          try {
            writeContract({
              address: CONTRACT_ADDRESSES.MochaBeanToken,
              abi: BEAN_TOKEN_ABI,
              functionName: 'transfer',
              args: [CONTRACT_ADDRESSES.FarmManager, transferAmount],
            } as any)
            console.log('✅ MBT transfer initiated to FarmManager')
            alert('MBT transfer initiated. Please wait for confirmation, then try the purchase again.')
            setIsProcessing(false)
            return
          } catch (transferError) {
            console.error('❌ Failed to transfer MBT to FarmManager:', transferError)
            alert('Failed to transfer MBT to FarmManager. Please try again.')
            setIsProcessing(false)
            return
          }
        } else {
          alert('Purchase cancelled due to contract bug. Please contact the contract owner to fix this issue.')
          setIsProcessing(false)
          return
        }
      }

      // Check if approval is needed and handle it automatically
      if (!currentAllowance || currentAllowance < BigInt(totalCost)) {
        console.log('Approval needed, requesting approval first...')
        setIsApproving(true)
        setTransactionType('approval')
        
        // Approve a bit more than needed to avoid multiple approvals
        const approvalAmount = BigInt(totalCost) + BigInt(1000 * 1e18) // Add 1000 MBT buffer
        
        try {
          writeContract({
            address: CONTRACT_ADDRESSES.MochaBeanToken,
            abi: BEAN_TOKEN_ABI,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.FarmManager, approvalAmount],
            gas: BigInt(150000), // Increased gas limit for approval
          })
          
          console.log('Approval transaction submitted for amount:', approvalAmount.toString())
        } catch (approvalError) {
          console.error('Error submitting approval:', approvalError)
          alert('Error submitting approval: ' + (approvalError as Error).message)
          setIsProcessing(false)
          setIsApproving(false)
          return
        }
        
        // Wait for approval to be confirmed before proceeding
        // The useEffect will handle the approval completion
        return
      }

      // If we have sufficient allowance, proceed with purchase
      console.log('Purchasing trees with existing allowance...', {
        farmId: farmId,
        treeCount: treeCountNum,
        totalCost: totalCost,
        allowance: currentAllowance?.toString()
      })
      
      setTransactionType('purchase')
      
      try {
        // Use conservative gas estimation for purchase
        console.log('Submitting purchase transaction...')
        console.log('Contract call details:', {
          address: CONTRACT_ADDRESSES.FarmManager,
          functionName: 'purchaseTrees',
          args: [farmId, treeCountNum],
          gas: 600000
        })
        
        // Verify the transaction data matches what we expect
        const expectedData = '0x81b0dc52' + 
          BigInt(farmId).toString(16).padStart(64, '0') + 
          BigInt(treeCountNum).toString(16).padStart(64, '0')
        console.log('Expected transaction data:', expectedData)
        console.log('This should match the data in the error message')
        
        const contractCall: any = {
          address: CONTRACT_ADDRESSES.FarmManager,
          abi: FARM_MANAGER_ABI,
          functionName: 'purchaseTrees',
          args: [BigInt(farmId), BigInt(treeCountNum)] as const,
          gas: BigInt(600000) // Conservative gas limit
        }

        console.log('About to call writeContract with:', contractCall)
        
        // First, let's check if the contract exists and is properly deployed
        try {
          console.log('🔍 Checking contract deployment...')
          const contractCode = await publicClient.getBytecode({
            address: CONTRACT_ADDRESSES.FarmManager
          })
          console.log('Contract bytecode exists:', !!contractCode)
          console.log('Contract bytecode length:', contractCode?.length || 0)
          
          if (!contractCode || contractCode === '0x') {
            throw new Error('Contract not deployed at address: ' + CONTRACT_ADDRESSES.FarmManager)
          }

          // Check if the function exists in the ABI
          const purchaseTreesFunction = FARM_MANAGER_ABI.find(fn => fn.name === 'purchaseTrees')
          console.log('purchaseTrees function in ABI:', !!purchaseTreesFunction)
          console.log('Function signature:', purchaseTreesFunction)
          
          if (!purchaseTreesFunction) {
            throw new Error('purchaseTrees function not found in ABI')
          }
        } catch (contractError: any) {
          console.error('❌ Contract deployment check failed:', contractError)
          alert('Contract not properly deployed. Please check the contract address.')
          setIsProcessing(false)
          return
        }

        // Try to simulate the transaction first to get better error info
        try {
          console.log('🔍 Attempting to simulate transaction...')
          console.log('Simulation parameters:', {
            address: CONTRACT_ADDRESSES.FarmManager,
            functionName: 'purchaseTrees',
            args: [farmId, treeCountNum],
            account: address,
            userBalance: mbtBalance?.toString(),
            farmManagerBalance: farmManagerMBTBalance?.toString(),
            allowance: currentAllowance?.toString()
          })
          
          const simulationResult = await publicClient.simulateContract({
            address: CONTRACT_ADDRESSES.FarmManager,
            abi: FARM_MANAGER_ABI,
            functionName: 'purchaseTrees',
            args: [BigInt(farmId), BigInt(treeCountNum)],
            account: address as `0x${string}`,
          })
          console.log('✅ Transaction simulation successful:', simulationResult)
        } catch (simulationError: any) {
          console.error('❌ Transaction simulation failed:', simulationError)
          console.error('❌ Simulation error details:', {
            message: simulationError.message,
            cause: simulationError.cause,
            details: simulationError.details,
            shortMessage: simulationError.shortMessage
          })
          
          // Check if it's a balance issue
          if (simulationError.message?.includes('Insufficient MBT balance')) {
            console.error('🚨 BALANCE ISSUE DETECTED!')
            console.error('This suggests the contract is checking the wrong balance or there\'s a contract bug.')
            console.error('User balance:', mbtBalance?.toString())
            console.error('FarmManager balance:', farmManagerMBTBalance?.toString())
            console.error('Required amount:', totalCost.toString())
          }
          
          throw simulationError
        }
        
        // Try to submit the transaction with explicit gas estimation disabled
        try {
          console.log('Attempting to submit transaction...')
          writeContract(contractCall)
          console.log('✅ Purchase transaction submitted')
        } catch (writeError: any) {
          console.error('❌ WriteContract failed:', writeError)
          
          // If gas estimation fails, try with a different approach
          if (writeError.message?.includes('missing revert data') || writeError.message?.includes('estimateGas')) {
            console.log('🔄 Trying alternative approach without gas estimation...')
            
            const alternativeCall = {
              address: CONTRACT_ADDRESSES.FarmManager,
              abi: FARM_MANAGER_ABI,
              functionName: 'purchaseTrees',
              args: [BigInt(farmId), BigInt(treeCountNum)] as const,
              // Don't specify gas to let the wallet handle it
            } as any
            
            console.log('Alternative contract call:', alternativeCall)
            writeContract(alternativeCall as any)
            console.log('✅ Alternative transaction submitted')
          } else {
            throw writeError
          }
        }
        
      } catch (purchaseError: any) {
        console.error('Error submitting purchase:', purchaseError)
        
        // Provide more specific error messages
        let errorMessage = 'Error submitting purchase: ' + (purchaseError?.message || 'Unknown error')
        
        if (purchaseError?.message?.includes('missing revert data')) {
          errorMessage = 'Contract call failed during gas estimation. This might be due to:\n' +
            '1. Farm not properly initialized\n' +
            '2. Contract state issues\n' +
            '3. Network connectivity problems\n\n' +
            'Please try refreshing the page and ensure the farm exists.'
        } else if (purchaseError?.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH for gas fees. Please add more ETH to your wallet.'
        } else if (purchaseError?.message?.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.'
        } else if (purchaseError?.message?.includes('insufficient allowance')) {
          errorMessage = 'Insufficient MBT allowance. Please approve more MBT tokens.'
        } else if (purchaseError?.message?.includes('exceeds farm capacity')) {
          errorMessage = 'Cannot purchase this many trees. Farm capacity exceeded.'
        }
        
        alert(errorMessage)
        setIsProcessing(false)
        setTransactionType(null)
      }
    } catch (err) {
      console.error('Error in investment process:', err)
      alert('Error: ' + (err as Error).message)
      setIsProcessing(false)
      setIsApproving(false)
      setTransactionType(null)
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

  // Check if user has sufficient MBT balance
  const hasSufficientBalance = () => {
    if (!mbtBalance || !treeCount) return false
    const requiredAmount = getTreeCount() * 4 * 1e18
    return mbtBalance >= BigInt(requiredAmount)
  }

  // Get MBT balance in a more readable format
  const getMBTBalance = () => {
    if (!mbtBalance) return 0
    return Number(mbtBalance) / 1e18
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

  // Show MBT token info if user has no balance
  if (mbtBalance && mbtBalance === BigInt(0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TreePine className="h-5 w-5 mr-2" />
            Investment Options
          </CardTitle>
          <CardDescription>
            You need MBT tokens to invest in coffee farms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">No MBT Tokens Found</h3>
              <p className="text-amber-700 mb-4">
                You need MBT (Mocha Bean Tokens) to purchase coffee trees. 
                Each tree costs 4 MBT tokens.
              </p>
              <div className="text-sm text-amber-600">
                <p>To get MBT tokens:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Contact the admin to receive test MBT tokens</li>
                  <li>Or participate in the token distribution program</li>
                  <li>MBT tokens are required for all coffee farm investments</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => window.open('https://sepolia.scrollscan.com/address/0x868BE05289CC245be73e8A461597893f6cb55b70', '_blank')}
              variant="outline"
              className="coffee-hover"
            >
              View MBT Contract on ScrollScan
            </Button>
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
          
          {/* Farm Validation Status */}
          {farmData ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">✅</span>
                <span className="text-sm font-semibold text-green-800">Farm Validated (Contract Data)</span>
              </div>
              <div className="text-xs text-green-700">
                <div>Name: {farmData.name}</div>
                <div>Status: {farmData.isActive ? 'Active' : 'Inactive'}</div>
                <div>Location: {farmData.location}</div>
                <div>Total Farms: {totalFarms?.toString() || 'Loading...'}</div>
              </div>
            </div>
          ) : farmDataError ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-sm font-semibold text-yellow-800">Using Fallback Data</span>
              </div>
              <div className="text-xs text-yellow-700">
                Contract data unavailable, using props data. Error: {farmDataError.message}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 mr-2">⏳</span>
                <span className="text-sm font-semibold text-yellow-800">Loading Farm Data...</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-coffee-mocha">Current Trees:</span>
              <span className="ml-1 font-semibold">{farmData ? Number(farmData.currentTrees || 0) : Number(effectiveFarmData?.currentTrees || 0)}</span>
            </div>
            <div>
              <span className="text-coffee-mocha">Capacity:</span>
              <span className="ml-1 font-semibold">{farmData ? Number(farmData.treeCapacity || 0).toLocaleString() : Number(effectiveFarmData?.treeCapacity || 0).toLocaleString()}</span>
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
          
          {/* Transaction Status */}
          {(isProcessing || isApproving) && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <div className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                <span>
                  {isApproving ? 'Approving MBT...' : 'Processing purchase...'}
                </span>
              </div>
            </div>
          )}
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
          <div className={`p-4 rounded-lg ${hasSufficientBalance() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your MBT Balance</span>
              <span className={`font-semibold ${hasSufficientBalance() ? 'text-green-700' : 'text-red-700'}`}>
                {formatBalance(mbtBalance)} MBT
              </span>
            </div>
            {treeCount && (
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Required for {getTreeCount()} trees:</span>
                  <span className={hasSufficientBalance() ? 'text-green-600' : 'text-red-600'}>
                    {(getTreeCount() * 4).toFixed(2)} MBT
                  </span>
                </div>
                {!hasSufficientBalance() && (
                  <div className="mt-1 text-red-600">
                    ⚠️ Insufficient MBT balance. You need {(getTreeCount() * 4).toFixed(2)} MBT to purchase {getTreeCount()} trees.
                  </div>
                )}
              </div>
            )}
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
                  disabled={
                    isPending || 
                    isConfirming || 
                    isProcessing || 
                    isApproving || 
                    !treeCount || 
                    !hasSufficientBalance()
                  }
                >
                  {isPending || isConfirming || isProcessing || isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isApproving ? 'Approving MBT...' : isPending ? 'Purchasing Trees...' : 'Processing...'}
                    </>
                  ) : !hasSufficientBalance() ? (
                    'Insufficient MBT Balance'
                  ) : (
                    `Purchase ${getTreeCount()} Trees (${(getTreeCount() * 4).toFixed(2)} MBT)`
                  )}
                </Button>
                {!hasSufficientBalance() && treeCount && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    You need {(getTreeCount() * 4).toFixed(2)} MBT to purchase {getTreeCount()} trees
                  </p>
                )}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              <div className="font-semibold mb-2">Transaction Error:</div>
              <div className="mb-2">{error.message}</div>
              <div className="text-xs text-red-600">
                This might be due to insufficient MBT balance, network issues, or contract state problems.
                Please check your MBT balance and try again.
              </div>
            </div>
          )}

          {approvalHash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
              <div className="font-semibold mb-2">Approval Transaction Submitted:</div>
              <div className="mb-2 break-all">{approvalHash}</div>
              <div className="text-xs text-blue-600">
                Approving {(getTreeCount() * 4).toFixed(2)} MBT for purchase...
                <br />
                Please wait for confirmation before the purchase proceeds automatically.
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
              <div className="font-semibold mb-2">Investment Successful!</div>
              <div className="mb-2 break-all">Transaction hash: {hash}</div>
              <div className="text-xs text-green-600">
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
              <div className="font-semibold mb-2">Debug Information:</div>
              <div>Farm ID: {farmId}</div>
              <div>Tree Count: {treeCount}</div>
              <div>Total Cost: {(getTreeCount() * 4).toFixed(2)} MBT</div>
              <div>User Balance: {formatBalance(mbtBalance)} MBT</div>
              <div>Current Allowance: {formatBalance(currentAllowance)} MBT</div>
              <div>Is Processing: {isProcessing ? 'Yes' : 'No'}</div>
              <div>Is Approving: {isApproving ? 'Yes' : 'No'}</div>
              <div>Transaction Type: {transactionType || 'None'}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
