import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatUnits } from 'viem'
import { scrollSepolia } from 'viem/chains'
import { CONTRACT_ADDRESSES, LAND_TOKEN_ABI, FARM_MANAGER_ABI } from '@/lib/contracts'

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

    // Fetch farm data from Land Token contract
    const farmData = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.MochaLandToken,
      abi: LAND_TOKEN_ABI,
      functionName: 'getFarmData',
      args: [BigInt(farmIdNumber)]
    })

    // Fetch farm stats from Farm Manager contract
    let farmStats = {
      totalInvestment: 0,
      totalTrees: 0,
      investorCount: 0
    }

    try {
      const stats = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FARM_MANAGER_ABI,
        functionName: 'getFarmStats',
        args: [BigInt(farmIdNumber)]
      })
      farmStats = {
        totalInvestment: Number(formatUnits(stats[0], 18)), // Convert from wei to MBT
        totalTrees: Number(stats[1]),
        investorCount: Number(stats[2])
      }
    } catch (error) {
      console.error('Error fetching farm stats:', error)
    }

    // Format the farm data
    const formattedFarm = {
      id: farmIdNumber,
      name: farmData.name || `Coffee Farm #${farmId}`,
      location: farmData.location || 'Unknown Location',
      gpsCoordinates: farmData.gpsCoordinates || '0.0000, 0.0000',
      totalArea: Number(farmData.totalArea),
      treeCapacity: Number(farmData.treeCapacity),
      currentTrees: Number(farmData.currentTrees),
      totalTrees: Number(farmData.currentTrees), // Add totalTrees for compatibility
      totalInvestment: farmStats.totalInvestment,
      investorCount: farmStats.investorCount,
      isActive: farmData.isActive,
      creationTime: Number(farmData.creationTime),
      farmer: farmData.farmer,
      metadataURI: farmData.metadataURI || '',
      apy: 12, // Default APY
      maturity: "5 years" // Default maturity
    }

    return NextResponse.json(formattedFarm)
  } catch (error) {
    console.error('Error fetching farm data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farm data' },
      { status: 500 }
    )
  }
}
