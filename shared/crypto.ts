import { webcrypto } from 'crypto';

export class CryptoService {
  private static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await webcrypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private static async generateAESKey(): Promise<CryptoKey> {
    return await webcrypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await webcrypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
  }

  static async importPublicKey(keyData: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyData);
    return await webcrypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  static async importPrivateKey(keyData: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyData);
    return await webcrypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['decrypt']
    );
  }

  static async importAESKey(keyData: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyData);
    return await webcrypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<{
    encryptedContent: string;
    encryptedKey: string;
    iv: string;
  }> {
    // Generate a one-time AES key for this message
    const aesKey = await this.generateAESKey();
    const iv = webcrypto.getRandomValues(new Uint8Array(12));

    // Encrypt the message with AES
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedContent = await webcrypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      aesKey,
      encodedMessage
    );

    // Export and encrypt the AES key with recipient's public key
    const exportedAesKey = await this.exportKey(aesKey);
    const encodedAesKey = new TextEncoder().encode(exportedAesKey);
    const encryptedKey = await webcrypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      recipientPublicKey,
      encodedAesKey
    );

    return {
      encryptedContent: Buffer.from(encryptedContent).toString('base64'),
      encryptedKey: Buffer.from(encryptedKey).toString('base64'),
      iv: Buffer.from(iv).toString('base64')
    };
  }

  static async decryptMessage(
    encryptedContent: string,
    encryptedKey: string,
    iv: string,
    privateKey: CryptoKey
  ): Promise<string> {
    // Decrypt the AES key
    const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');
    const decryptedKeyBuffer = await webcrypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      encryptedKeyBuffer
    );

    // Import the decrypted AES key
    const decryptedKeyString = new TextDecoder().decode(decryptedKeyBuffer);
    const aesKey = await this.importAESKey(decryptedKeyString);

    // Decrypt the content
    const encryptedContentBuffer = Buffer.from(encryptedContent, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const decryptedContent = await webcrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      aesKey,
      encryptedContentBuffer
    );

    return new TextDecoder().decode(decryptedContent);
  }

  static async generateAndExportKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    const keyPair = await this.generateKeyPair();
    const exportedPublicKey = await this.exportKey(keyPair.publicKey);
    const exportedPrivateKey = await this.exportKey(keyPair.privateKey);
    return {
      publicKey: exportedPublicKey,
      privateKey: exportedPrivateKey
    };
  }
} 