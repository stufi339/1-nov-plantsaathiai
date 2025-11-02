/**
 * Google Earth Engine Authentication Service
 * Handles OAuth2 JWT authentication for service accounts
 */

interface GEECredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class GEEAuthService {
  private credentials: GEECredentials;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.credentials = {
      projectId: import.meta.env.VITE_GEE_PROJECT_ID || '',
      clientEmail: import.meta.env.VITE_GEE_CLIENT_EMAIL || '',
      privateKey: (import.meta.env.VITE_GEE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    };
  }

  /**
   * Get a valid access token for GEE API calls
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token that hasn't expired
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Generate new JWT and exchange for access token
    const jwt = this.createJWT();
    this.accessToken = await this.exchangeJWTForAccessToken(jwt);
    this.tokenExpiry = Date.now() + 3600000; // 1 hour expiry

    return this.accessToken;
  }

  /**
   * Create a JWT for service account authentication
   */
  private createJWT(): string {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.credentials.clientEmail,
      scope: 'https://www.googleapis.com/auth/earthengine',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now
    };

    // Base64 encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    // Create signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = this.signMessage(message, this.credentials.privateKey);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Exchange JWT for access token
   */
  private async exchangeJWTForAccessToken(jwt: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Sign a message using RSA private key
   * Note: Browser-based JWT signing with service account keys is complex.
   * In production, consider using a server-side proxy or Google Auth Library.
   */
  private async signMessage(message: string, privateKey: string): Promise<string> {
    // Browser-based RSA signing with service account private keys is challenging
    // due to Web Crypto API limitations and key format requirements.
    //
    // For production applications, consider:
    // 1. Server-side JWT generation
    // 2. Using Google Auth Library (@google-cloud/local-auth)
    // 3. OAuth2 flow instead of service account keys
    //
    // For now, we'll throw an informative error

    console.warn('⚠️ GEE Authentication Limitation:');
    console.warn('Browser-based JWT signing with service account private keys requires complex crypto operations.');
    console.warn('This is a known limitation when running in browser environments.');
    console.warn('');
    console.warn('Recommended solutions:');
    console.warn('1. Use server-side authentication proxy');
    console.warn('2. Implement OAuth2 flow instead of service accounts');
    console.warn('3. Use Google Auth Library in a Node.js environment');

    throw new Error(
      'Browser-based service account authentication not supported. ' +
      'Use server-side proxy or OAuth2 flow for production GEE integration.'
    );
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(str: string): string {
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  }

  /**
   * Check if credentials are properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.credentials.projectId &&
      this.credentials.clientEmail &&
      this.credentials.privateKey
    );
  }
}

// Create singleton instance
export const geeAuthService = new GEEAuthService();
