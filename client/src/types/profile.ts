export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface StorageQuota {
  cache: number;
  library: number;
}

export interface StorageUsage {
  quota: StorageQuota;
  used: StorageQuota;
  available: StorageQuota;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  hobbies: string[];
  avatarUrl?: string;
  bio?: string;
  location?: string;
  voiceSampleUrl?: string;
  address: Address;
  storageQuota: StorageQuota;
  storageUsed: StorageQuota;
}

export interface ProfileUpdateData {
  email: string;
  phoneNumber: string;
  address: Address;
} 