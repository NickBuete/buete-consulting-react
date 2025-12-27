import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';

interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

interface TokenCache {
  [userId: string]: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

/**
 * Microsoft Graph API client for calendar integration
 * Handles OAuth2 flow and calendar operations
 */
export class GraphService {
  private config: MicrosoftConfig;
  private msalClient: ConfidentialClientApplication;
  private tokenCache: TokenCache = {};

  constructor() {
    this.config = {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(
        'Microsoft Graph API credentials not configured. Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET'
      );
    }

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.config.clientId,
        authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
        clientSecret: this.config.clientSecret,
      },
    });
  }

  /**
   * Get authorization URL for OAuth2 flow
   */
  getAuthUrl(state?: string): string {
    const scopes = ['Calendars.ReadWrite', 'User.Read', 'offline_access'];

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${this.config.clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(this.config.redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&response_mode=query` +
      (state ? `&state=${encodeURIComponent(state)}` : '');
  }

  /**
   * Exchange authorization code for access token
   */
  async getTokenFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const tokenResponse = await this.msalClient.acquireTokenByCode({
        code,
        scopes: ['Calendars.ReadWrite', 'User.Read', 'offline_access'],
        redirectUri: this.config.redirectUri,
      });

      if (!tokenResponse.accessToken) {
        throw new Error('No access token received');
      }

      return {
        accessToken: tokenResponse.accessToken,
        refreshToken: '', // MSAL doesn't return refresh tokens in the response
        expiresIn: tokenResponse.expiresOn
          ? Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000)
          : 3600,
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to authenticate with Microsoft');
    }
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const tokenResponse = await this.msalClient.acquireTokenByRefreshToken({
        refreshToken,
        scopes: ['Calendars.ReadWrite', 'User.Read', 'offline_access'],
      });

      if (!tokenResponse || !tokenResponse.accessToken) {
        throw new Error('No access token received');
      }

      return {
        accessToken: tokenResponse.accessToken,
        refreshToken: refreshToken, // Keep the original refresh token
        expiresIn: tokenResponse.expiresOn
          ? Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000)
          : 3600,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Microsoft access token');
    }
  }

  /**
   * Get authenticated Graph client
   */
  private getClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(
    accessToken: string,
    event: {
      subject: string;
      body: string;
      startDateTime: string; // ISO 8601
      endDateTime: string; // ISO 8601
      attendees?: Array<{ emailAddress: string; name: string }>;
      location?: string;
    }
  ): Promise<string> {
    const client = this.getClient(accessToken);

    try {
      const calendarEvent = {
        subject: event.subject,
        body: {
          contentType: 'HTML',
          content: event.body,
        },
        start: {
          dateTime: event.startDateTime,
          timeZone: 'Australia/Sydney',
        },
        end: {
          dateTime: event.endDateTime,
          timeZone: 'Australia/Sydney',
        },
        location: event.location
          ? {
              displayName: event.location,
            }
          : undefined,
        attendees: event.attendees?.map((attendee) => ({
          emailAddress: {
            address: attendee.emailAddress,
            name: attendee.name,
          },
          type: 'required',
        })),
      };

      const result = await client.api('/me/events').post(calendarEvent);

      return result.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(
    accessToken: string,
    eventId: string,
    updates: {
      subject?: string;
      body?: string;
      startDateTime?: string;
      endDateTime?: string;
      location?: string;
    }
  ): Promise<void> {
    const client = this.getClient(accessToken);

    try {
      const eventUpdate: any = {};

      if (updates.subject) {
        eventUpdate.subject = updates.subject;
      }

      if (updates.body) {
        eventUpdate.body = {
          contentType: 'HTML',
          content: updates.body,
        };
      }

      if (updates.startDateTime) {
        eventUpdate.start = {
          dateTime: updates.startDateTime,
          timeZone: 'Australia/Sydney',
        };
      }

      if (updates.endDateTime) {
        eventUpdate.end = {
          dateTime: updates.endDateTime,
          timeZone: 'Australia/Sydney',
        };
      }

      if (updates.location) {
        eventUpdate.location = {
          displayName: updates.location,
        };
      }

      await client.api(`/me/events/${eventId}`).patch(eventUpdate);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(
    accessToken: string,
    eventId: string
  ): Promise<void> {
    const client = this.getClient(accessToken);

    try {
      await client.api(`/me/events/${eventId}`).delete();
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get user's calendar events for a date range
   */
  async getCalendarEvents(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    id: string;
    subject: string;
    start: string;
    end: string;
    location?: string;
  }>> {
    const client = this.getClient(accessToken);

    try {
      const result = await client
        .api('/me/calendarView')
        .query({
          startDateTime: startDate,
          endDateTime: endDate,
        })
        .select('id,subject,start,end,location')
        .get();

      return result.value.map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: event.start.dateTime,
        end: event.end.dateTime,
        location: event.location?.displayName,
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<{
    id: string;
    displayName: string;
    email: string;
  }> {
    const client = this.getClient(accessToken);

    try {
      const user = await client.api('/me').select('id,displayName,mail').get();

      return {
        id: user.id,
        displayName: user.displayName,
        email: user.mail || user.userPrincipalName,
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Failed to fetch user information');
    }
  }
}

export const graphService = new GraphService();
