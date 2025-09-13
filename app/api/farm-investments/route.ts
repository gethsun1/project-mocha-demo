import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { scrollSepolia } from 'viem/chains'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI } from '@/lib/contracts'

// Create a public client for Scroll Sepolia
const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http('https://sepolia-rpc.scroll.io')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')

    if (!farmId) {
      return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 })
    }

    const farmIdNumber = parseInt(farmId)

    // Fetch farm investments from FarmManager contract
    const investments = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.FarmManager,
      abi: FARM_MANAGER_ABI,
      functionName: 'getFarmInvestments',
      args: [BigInt(farmIdNumber)]
    })

    // Format the investment data
    const formattedInvestments = investments.map((investment: any, index: number) => ({
      id: index,
      farmId: Number(investment.farmId),
      investor: investment.investor,
      treeCount: Number(investment.treeCount),
      totalInvestment: Number(investment.totalInvestment) / 1e18, // Convert from wei to MBT
      timestamp: Number(investment.timestamp),
      isActive: investment.isActive,
      investmentDate: new Date(Number(investment.timestamp) * 1000).toLocaleDateString(),
      investmentTime: new Date(Number(investment.timestamp) * 1000).toLocaleTimeString()
    }))

    return NextResponse.json(formattedInvestments)
  } catch (error) {
    console.error('Error fetching farm investments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farm investments' },
      { status: 500 }
    )
  }
}
