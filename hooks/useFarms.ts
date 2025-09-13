import { useState, useEffect } from 'react'

export function useFarms() {
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // For now, let's hardcode the farm IDs to test the API
  const farmIds = [1, 2, 3] // This should match the actual farm IDs from the contract

  // Fetch detailed farm data for each farm
  useEffect(() => {
    let isMounted = true

    const fetchFarmDetails = async () => {
      console.log('useFarms: Starting to fetch farm details, farmIds:', farmIds)
      
      if (!farmIds || farmIds.length === 0) {
        console.log('useFarms: No farm IDs, setting empty farms')
        if (isMounted) {
          setFarms([])
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
      }
      
      const farmsData = []

      for (const farmId of farmIds) {
        if (!isMounted) break // Stop if component unmounted
        
        try {
          console.log(`useFarms: Fetching data for farm ${farmId}...`)
          // Fetch farm data from API
          const farmDataResponse = await fetch(`/api/farm-data?farmId=${farmId}`)
          console.log(`useFarms: Farm ${farmId} API response status:`, farmDataResponse.status)
          
          if (farmDataResponse.ok) {
            const farmData = await farmDataResponse.json()
            console.log(`useFarms: Farm ${farmId} data:`, farmData)
            // Add additional fields for the public farm list
            const farm = {
              ...farmData,
              apy: 12, // Default APY
              maturity: "5 years", // Default maturity
              image: "/api/placeholder/400/300",
              totalArea: `${farmData.totalArea} m²`
            }
            farmsData.push(farm)
            console.log(`useFarms: Added farm ${farmId} to farmsData`)
          } else {
            console.error(`useFarms: API failed for farm ${farmId}:`, farmDataResponse.status)
            // Fallback: create basic farm object if API fails
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
          }
        } catch (error) {
          console.error(`useFarms: Error fetching data for farm ${farmId}:`, error)
          // Create fallback farm data
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
        }
      }

      if (isMounted) {
        console.log('useFarms: Final farmsData:', farmsData)
        setFarms(farmsData)
        setLoading(false)
      }
    }

    fetchFarmDetails()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array to run only once

  return { farms, loading, farmCount: farms.length }
}
