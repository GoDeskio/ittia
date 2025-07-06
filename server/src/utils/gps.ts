interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// This is a mock implementation. In a real application, you would:
// 1. Use a proper geolocation service or device GPS
// 2. Handle permissions and errors
// 3. Return real location data

export const getLocation = async (): Promise<Location> => {
  // Mock location data (random coordinates within reasonable bounds)
  const latitude = (Math.random() * 180) - 90;  // -90 to 90
  const longitude = (Math.random() * 360) - 180; // -180 to 180

  return {
    latitude,
    longitude,
    timestamp: new Date()
  };
};

export function validateGPSCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 && 
    latitude <= 90 && 
    longitude >= -180 && 
    longitude <= 180
  );
} 