import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[]; // e.g. ['blog_articles', 'gallery', 'training_courses']
}

export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JwtService.SECRET}-refresh`;
  private static readonly ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '900'; // 15 min
  private static readonly REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '604800'; // 7 days
  private static readonly TEMP_EXPIRY = '300'; // 5 min for 2FA

  /**
   * Generate an access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: parseInt(this.ACCESS_EXPIRY, 10),
    });
  }

  /**
   * Generate a refresh token (uses separate secret)
   */
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: parseInt(this.REFRESH_EXPIRY, 10),
    });
  }

  /**
   * Generate both access and refresh tokens at once
   */
  static generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify an access token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.SECRET) as TokenPayload;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Verify a refresh token (uses separate secret)
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Generate a short-lived temp token for 2FA flow
   */
  static generateTempToken(payload: { id: string }): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: parseInt(this.TEMP_EXPIRY, 10),
    });
  }

  /**
   * Verify a temp token for 2FA flow
   */
  static verifyTempToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, this.SECRET) as { id: string };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Decode a token without verifying (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (_error) {
      return null;
    }
  }
}
