import { Request, Response, NextFunction } from 'express';

export const checkMobilePermissions = (req: Request, res: Response, next: NextFunction) => {
  // Check if request is from a mobile device
  const isMobile = /mobile|android|iphone|ipad/i.test(req.headers['user-agent'] || '');
  
  if (isMobile) {
    // For mobile devices, check if permissions are granted in the headers
    const permissions = req.headers['x-device-permissions'];
    
    if (!permissions) {
      return res.status(403).json({
        error: 'Device permissions required',
        requiredPermissions: ['CAMERA', 'PHOTO_LIBRARY', 'MICROPHONE', 'STORAGE'],
        message: 'Please grant the necessary permissions to access device features'
      });
    }
  }
  
  // For non-mobile devices or if permissions are granted, proceed
  return next();
}; 