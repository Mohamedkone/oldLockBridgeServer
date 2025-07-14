import {injectable, BindingScope} from '@loopback/core';
import axios from 'axios';
import {Dropbox} from 'dropbox';
import {Readable} from 'stream';

@injectable({scope: BindingScope.TRANSIENT})
export class DropboxService {
  private clientId = 'hvrwt9jed00sv3v';
  private clientSecret = '39ftyj15936fo5j';

  /**
   * Get Dropbox access token using the refresh token
   * @param refreshToken
   */
  async getAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await axios.post(
        'https://api.dropbox.com/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.access_token) {
        return response.data.access_token;
      }

      console.error('Failed to get access token:', response.data);
      return null;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }

  /**
   * Upload file to Dropbox using a buffer
   * @param fileBuffer
   * @param filename
   * @param accessToken
   */
  async uploadFileToDropbox(fileBuffer: Buffer, filename: string, accessToken: string) {
    const response = await axios.post(
      'https://content.dropboxapi.com/2/files/upload',
      fileBuffer,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: `/${filename}`,
            mode: 'add',
            autorename: true,
            mute: false,
          }),
          'Content-Type': 'application/octet-stream',
        },
      }
    );
  
    return response.data;
  }
}
