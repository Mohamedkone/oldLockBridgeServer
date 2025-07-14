import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { google } from 'googleapis';
import {Readable} from 'stream'

@injectable({scope: BindingScope.TRANSIENT})
export class DriveOAuthService {
  private oauth2Client
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'http://localhost:3000/callbackss'
    );
  }

  async getAccessToken(refreshToken: string): Promise<string | null>{
    this.oauth2Client.setCredentials({refresh_token: refreshToken})
    const { token } = await this.oauth2Client.getAccessToken()
    if(token)
      return token
    else 
      return null
  }

  async uploadFileFromBuffer(fileBuffer: Buffer, fileMetadata: any) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    // Convert the buffer to a readable stream
    const fileStream = Readable.from(fileBuffer);

    // Create media object for file upload
    const media = {
      body: fileStream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Return the result (receipt)
    return file.data;
  }

  /*
   * Add service methods here
   */
}
