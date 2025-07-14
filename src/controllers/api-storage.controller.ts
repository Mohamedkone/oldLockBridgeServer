import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  RestBindings,
  Request,
  Response,
  HttpErrors,
} from '@loopback/rest';
import {ApiStorage} from '../models';
import {ApiStorageRepository} from '../repositories';
import { v4 as uuidv4 } from 'uuid'; 
import axios from 'axios';
import { inject } from '@loopback/core';
import { DriveOAuthService, DropboxService } from '../services';
import multer from 'multer';

export class ApiStorageController {
  constructor(
    @repository(ApiStorageRepository)
    public apiStorageRepository : ApiStorageRepository,
    @inject('services.DriveOAuthService')
    private driveOAuthService: DriveOAuthService,
    @inject('services.DropboxService')
    private dropboxService: DropboxService
  ) {}
  private multerMiddleware = multer().array('files');
  // @post('/api-storages/upload')
  // async uploadFile(@requestBody() fileData: any): Promise<any> {
  //   const { refreshToken, fileMetadata, media } = fileData;
  //   const accessToken = await this.driveOAuthService.getAccessToken(refreshToken);

  //   // Now you can use the access token and upload the file to Google Drive
  //   const uploadResult = await this.driveOAuthService.uploadFileFromBuffer(fileBuffer, fileMetadata);
  //   return uploadResult;
  // }

  @post('/upload/{id}', {
    responses: {
      '200': {
        description: 'File upload and cloud storage receipt',
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  async uploadFile(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.string('id') id: string,
    @requestBody.file() req: Request,
  ) {
    return new Promise((resolve, reject) => {
      this.multerMiddleware(req, response, async (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        const storage = await this.apiStorageRepository.findById(id);
        const refreshToken = storage.refreshToken;
        if (!refreshToken) {
          reject(new Error('No refresh token found'));
          return;
        }

        // Extract files from the request
        const files = (req as any).files; // 'files' corresponds to the field name in the form
        if (!files || files.length === 0) {
          reject(new Error('No files uploaded'));
          return;
        }

        try {
          for (const file of files) {
            const fileBuffer = file.buffer;
            const fileMetadata = {
              name: file.originalname, // Use the original file name
            };

            if (storage.system === 'Drive') {
              // Upload file to Google Drive
              const accessToken = await this.driveOAuthService.getAccessToken(refreshToken);
              if (!accessToken) {
                reject(new Error('Failed to obtain access token'));
                return;
              }

              await this.driveOAuthService.uploadFileFromBuffer(fileBuffer, fileMetadata);
            } else if (storage.system === 'Dropbox') {
              // Upload file to Dropbox
              const accessToken = await this.dropboxService.getAccessToken(refreshToken);
              if (!accessToken) {
                reject(new Error('Failed to obtain Dropbox access token'));
                return;
              }

              await this.dropboxService.uploadFileToDropbox(fileBuffer, fileMetadata.name, accessToken);
            } else {
              throw new HttpErrors.NotFound('Api system not found');
            }
          }

          // Return success response after uploading all files
          resolve({ message: 'Files uploaded successfully' });
        } catch (uploadErr) {
          reject(uploadErr);
        }
      });
    });
  }
  



  @post('/gd-api-storages')
  @response(200, {
    description: 'ApiStorage model instance',
    content: {'application/json': {schema: getModelSchemaRef(ApiStorage)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: {type: 'string'},
              redirectUri: {type: 'string'},
              userId: {type: 'string'},
            },
            required: ['code', 'redirectUri', 'userId'], // Only these fields are required from the frontend
          },
        },
      },
    })
    body: {
      code: string;
      redirectUri: string;
      userId: string;
      // apiStorage?: ApiStorage;
    },
  ): Promise<object> {
    const {code, redirectUri, userId} = body;

    try {
      const clientId = process.env.CLIENT_ID
      const clientSecret = process.env.CLIENT_SECRET
  
      const response = await axios.post('https://oauth2.googleapis.com/token', null, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      });
  
      const tokens = response.data;
  
      if (tokens.error) {
        console.error('Error exchanging code for tokens:', tokens.error_description);
        throw new Error(tokens.error_description);
      }
  
      // Generate unique ID for the storage entry
      let id = uuidv4();
      while (await this.apiStorageRepository.exists(id)) {
        id = uuidv4();
      }
  
      const apiStorage: Partial<ApiStorage> = {
      id,
      alias:"Drive Storage",
      ownerId: userId,
      system: 'Drive',
      refreshToken: tokens.refresh_token,
    };
  
      await this.apiStorageRepository.create(apiStorage as ApiStorage);
  
      return {message: 'Tokens successfully processed'};
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      throw error;
    }
  }

  @post('/dp-api-storages')
  @response(200, {
    description: 'ApiStorage model instance',
    content: {'application/json': {schema: getModelSchemaRef(ApiStorage)}},
  })
  async createDp(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              code: {type: 'string'},
              redirectUri: {type: 'string'},
              userId: {type: 'string'},
            },
            required: ['code', 'redirectUri', 'userId'], // Only these fields are required from the frontend
          },
        },
      },
    })
    body: {
      code: string;
      redirectUri: string;
      userId: string;
      // apiStorage?: ApiStorage;
    },
  ): Promise<object> {
    const {code, redirectUri, userId} = body;

    try {
      const clientId = 'hvrwt9jed00sv3v';
      const clientSecret = '39ftyj15936fo5j';
  
      const response = await axios.post('https://api.dropbox.com/oauth2/token', null, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      });
  
      const tokens = response.data;
  
      if (tokens.error) {
        console.error('Error exchanging code for tokens:', tokens.error_description);
        throw new Error(tokens.error_description);
      }
  
      // Generate unique ID for the storage entry
      let id = uuidv4();
      while (await this.apiStorageRepository.exists(id)) {
        id = uuidv4();
      }
  
      const apiStorage: Partial<ApiStorage> = {
      id,
      alias:"Dropbox Storage",
      ownerId: userId,
      system: 'Dropbox',
      refreshToken: tokens.refresh_token,
    };
  
      await this.apiStorageRepository.create(apiStorage as ApiStorage);
  
      return {message: 'Tokens successfully processed'};
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      throw error;
    }
  }
  
  
  
  @get('/api-storages/count')
  @response(200, {
    description: 'ApiStorage model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ApiStorage) where?: Where<ApiStorage>,
  ): Promise<Count> {
    return this.apiStorageRepository.count(where);
  }

  @get('/api-storages')
  @response(200, {
    description: 'Array of ApiStorage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ApiStorage, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ApiStorage) filter?: Filter<ApiStorage>,
  ): Promise<ApiStorage[]> {
    return this.apiStorageRepository.find(filter);
  }

  @patch('/api-storages')
  @response(200, {
    description: 'ApiStorage PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiStorage, {partial: true}),
        },
      },
    })
    apiStorage: ApiStorage,
    @param.where(ApiStorage) where?: Where<ApiStorage>,
  ): Promise<Count> {
    return this.apiStorageRepository.updateAll(apiStorage, where);
  }

  @get('/api-storages/{id}')
  @response(200, {
    description: 'ApiStorage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ApiStorage, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<Object | null> {
    const res = await this.apiStorageRepository.find({where:{
      ownerId: id
    }});
    
    if(res){
      const newRes = []
      for(let x of res){
        newRes.push({id:x.id, platform: x.system, alias: x.alias})
      }
      return newRes
    } 
    else return null
  }

  @patch('/api-storages/{id}')
  @response(204, {
    description: 'ApiStorage PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiStorage, {partial: true}),
        },
      },
    })
    apiStorage: ApiStorage,
  ): Promise<void> {
    await this.apiStorageRepository.updateById(id, apiStorage);
  }

  @put('/api-storages/{id}')
  @response(204, {
    description: 'ApiStorage PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() apiStorage: ApiStorage,
  ): Promise<void> {
    await this.apiStorageRepository.replaceById(id, apiStorage);
  }

  @del('/api-storages/{id}')
  @response(204, {
    description: 'ApiStorage DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.apiStorageRepository.deleteById(id);
  }
}
