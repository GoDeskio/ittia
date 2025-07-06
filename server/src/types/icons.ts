export type IconType = 'loading' | 'desktop' | 'mobile' | 'favicon';

export interface IconDimensions {
  width: number;
  height: number;
}

export interface IconMetadata {
  type: IconType;
  dimensions: IconDimensions;
  allowedTypes: string[];
} 