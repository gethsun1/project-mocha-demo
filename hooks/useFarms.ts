import { useReadContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { CONTRACT_ADDRESSES, FARM_MANAGER_ABI, LAND_TOKEN_ABI, VAULT_ABI } from '@/lib/contracts'

export function useFarms() {
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
          // For now, create a basic farm object
          // In a full implementation, you'd fetch detailed data from multiple contracts
          const farm = {
            id: Number(farmId),
            name: `Coffee Farm #${farmId}`,
            location: "Blockchain Farm",
            apy: 12, // Default APY
            maturity: "5 years", // Default maturity
            totalInvestment: 0,
            totalTrees: 0,
            investorCount: 0,
            isActive: true,
            image: "/api/placeholder/400/300",
            gpsCoordinates: "0.0000, 0.0000",
            totalArea: "1000 m²",
            treeCapacity: 1000,
            farmer: "0x0000...0000"
          }
          farmsData.push(farm)
        } catch (error) {
          console.error(`Error fetching data for farm ${farmId}:`, error)
        }
      }

      setFarms(farmsData)
      setLoading(false)
    }

    if (!farmIdsLoading) {
      fetchFarmDetails()
    }
  }, [farmIds, farmIdsLoading])

  return { farms, loading, farmCount: farms.length }
}
