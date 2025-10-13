/**
 * Microsoft Graph API Client
 * 
 * Provides typed methods for calling Microsoft Graph API endpoints.
 * Uses acquired access tokens for authentication.
 * 
 * Requirements: US3 (FR-008)
 * Related: specs/002-add-single-sign/research.md R4 (Graph API patterns)
 */

import type { TokenResult } from '../utils/acquireToken';

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

export interface GraphUser {
  id: string;
  displayName: string | null;
  givenName: string | null;
  surname: string | null;
  userPrincipalName: string;
  mail: string | null;
  jobTitle: string | null;
  officeLocation: string | null;
  mobilePhone: string | null;
  businessPhones: string[];
  preferredLanguage: string | null;
}

export interface GraphManager {
  id: string;
  displayName: string | null;
  givenName: string | null;
  surname: string | null;
  userPrincipalName: string;
  mail: string | null;
  jobTitle: string | null;
}

export interface GraphDirectReport {
  id: string;
  displayName: string | null;
  givenName: string | null;
  surname: string | null;
  userPrincipalName: string;
  mail: string | null;
  jobTitle: string | null;
}

export interface GraphError {
  error: {
    code: string;
    message: string;
    innerError?: {
      'request-id': string;
      date: string;
    };
  };
}

/**
 * Microsoft Graph API Client
 */
export class GraphClient {
  private baseUrl: string;

  constructor(baseUrl: string = GRAPH_API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current user's profile
   * Requires scope: User.Read
   * 
   * @param tokenResult - Token result from acquireToken
   * @returns User profile data
   */
  async getUserProfile(tokenResult: TokenResult): Promise<GraphUser> {
    const endpoint = `${this.baseUrl}/me`;
    
    if (import.meta.env.DEV) {
      console.log('[GraphClient] Fetching user profile', {
        endpoint,
        scopes: tokenResult.scopes,
        account: tokenResult.account.username,
      });
    }

    const response = await this.fetchGraphAPI<GraphUser>(endpoint, tokenResult.accessToken);
    
    if (import.meta.env.DEV) {
      console.log('[GraphClient] ✅ User profile fetched', {
        userId: response.id,
        displayName: response.displayName,
      });
    }

    return response;
  }

  /**
   * Get current user's manager
   * Requires scope: User.Read.All or User.ReadBasic.All
   * 
   * @param tokenResult - Token result from acquireToken
   * @returns Manager profile data or null if no manager
   */
  async getManager(tokenResult: TokenResult): Promise<GraphManager | null> {
    const endpoint = `${this.baseUrl}/me/manager`;
    
    if (import.meta.env.DEV) {
      console.log('[GraphClient] Fetching user manager', {
        endpoint,
        scopes: tokenResult.scopes,
      });
    }

    try {
      const response = await this.fetchGraphAPI<GraphManager>(endpoint, tokenResult.accessToken);
      
      if (import.meta.env.DEV) {
        console.log('[GraphClient] ✅ Manager fetched', {
          managerId: response.id,
          displayName: response.displayName,
        });
      }

      return response;
    } catch (error) {
      // Manager may not exist - return null instead of throwing
      if (this.isNotFoundError(error)) {
        if (import.meta.env.DEV) {
          console.log('[GraphClient] ℹ️ No manager found');
        }
        return null;
      }
      throw error;
    }
  }

  /**
   * Get current user's direct reports
   * Requires scope: User.Read.All
   * 
   * @param tokenResult - Token result from acquireToken
   * @returns Array of direct report profiles
   */
  async getDirectReports(tokenResult: TokenResult): Promise<GraphDirectReport[]> {
    const endpoint = `${this.baseUrl}/me/directReports`;
    
    if (import.meta.env.DEV) {
      console.log('[GraphClient] Fetching direct reports', {
        endpoint,
        scopes: tokenResult.scopes,
      });
    }

    const response = await this.fetchGraphAPI<{ value: GraphDirectReport[] }>(
      endpoint,
      tokenResult.accessToken
    );
    
    if (import.meta.env.DEV) {
      console.log('[GraphClient] ✅ Direct reports fetched', {
        count: response.value.length,
      });
    }

    return response.value;
  }

  /**
   * Generic Graph API fetch with error handling
   */
  private async fetchGraphAPI<T>(endpoint: string, accessToken: string): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: GraphError = await response.json().catch(() => ({
        error: {
          code: 'UnknownError',
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      }));

      if (import.meta.env.DEV) {
        console.error('[GraphClient] ❌ API call failed', {
          endpoint,
          status: response.status,
          error: errorData.error,
        });
      }

      throw new GraphAPIError(
        errorData.error.message,
        errorData.error.code,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  /**
   * Check if error is a 404 Not Found
   */
  private isNotFoundError(error: unknown): boolean {
    return error instanceof GraphAPIError && error.statusCode === 404;
  }
}

/**
 * Custom error class for Graph API errors
 */
export class GraphAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: GraphError
  ) {
    super(message);
    this.name = 'GraphAPIError';
  }
}

/**
 * Default Graph Client instance
 */
export const graphClient = new GraphClient();
