// Mock location service for development
export const getLocation = async (): Promise<{ latitude: number; longitude: number; timestamp: Date }> => {
  // In a real implementation, this would use a GPS module or geolocation service
  // For now, we'll return mock data
  return {
    latitude: Math.random() * 180 - 90, // Random latitude between -90 and 90
    longitude: Math.random() * 360 - 180, // Random longitude between -180 and 180
    timestamp: new Date()
  };
}; 