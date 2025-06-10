import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/auth.config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { authConfig } from '../config/auth.config';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(authConfig.google.clientId);
  }

  async generateToken(user: IUser): Promise<string> {
    return jwt.sign(
      { userId: user._id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  async loginWithEmail(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user || !user.authMethods.email) {
      throw new Error('Invalid credentials');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async loginWithPinCode(email: string, pinCode: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user || !user.authMethods.pinCode) {
      throw new Error('Invalid credentials');
    }

    const isValid = await user.comparePinCode(pinCode);
    if (!isValid) {
      throw new Error('Invalid PIN code');
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async loginWithGoogle(idToken: string): Promise<{ user: IUser; token: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: authConfig.google.clientId
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        authMethods: { google: true },
        preferredAuthMethod: 'google'
      });
    } else if (!user.authMethods.google) {
      user.authMethods.google = true;
      await user.save();
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async loginWithFacebook(accessToken: string): Promise<{ user: IUser; token: string }> {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { email, name, picture } = response.data;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        profilePicture: picture?.data?.url,
        authMethods: { facebook: true },
        preferredAuthMethod: 'facebook'
      });
    } else if (!user.authMethods.facebook) {
      user.authMethods.facebook = true;
      await user.save();
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async loginWithLinkedIn(code: string): Promise<{ user: IUser; token: string }> {
    // Implementation similar to Facebook login
    // Would need to exchange code for access token and then get user info
    throw new Error('LinkedIn login not implemented');
  }

  async loginWithInstagram(code: string): Promise<{ user: IUser; token: string }> {
    // Implementation similar to Facebook login
    // Would need to exchange code for access token and then get user info
    throw new Error('Instagram login not implemented');
  }

  async verifyFingerprint(userId: string, fingerprintHash: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user || !user.authMethods.fingerprint) return false;
    return user.fingerPrintHash === fingerprintHash;
  }

  async updatePreferredAuthMethod(userId: string, method: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    if (!user.authMethods[method as keyof typeof user.authMethods]) {
      throw new Error('Authentication method not enabled for this user');
    }

    user.preferredAuthMethod = method;
    await user.save();
    return user;
  }
} 