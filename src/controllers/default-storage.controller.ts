import { ProviderRepository } from './../repositories/provider.repository';
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
  HttpErrors,
  RestBindings,
  Response,
  Request,
} from '@loopback/rest';
import {DefaultStorage} from '../models';
import {DefaultStorageRepository, VaultDataRepository} from '../repositories';
import { inject } from '@loopback/core';
import multer from 'multer';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export class DefaultStorageController {
  constructor(
    @repository(DefaultStorageRepository)
    public defaultStorageRepository : DefaultStorageRepository,
    @repository(ProviderRepository)
    public providerRepository : ProviderRepository,
    @repository(VaultDataRepository)
    public vaultDataRepository : VaultDataRepository,
  ) {}
  private multerMiddleware = multer().array('files');

  @post('/ds')
  @response(200, {
    description: 'DefaultStorage model instance',
    content: {'application/json': {schema: getModelSchemaRef(DefaultStorage)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DefaultStorage, {
            title: 'NewDefaultStorage',
            
          }),
        },
      },
    })
    defaultStorage: DefaultStorage,
  ): Promise<DefaultStorage> {
    return this.defaultStorageRepository.create(defaultStorage);
  }

  @post('/ds-upload/{id}', {
      responses: {
        '200': {
          description: 'File upload and cloud storage receipt',
          content: { 'application/json': { schema: { type: 'object' } } },
        },
      },
    })
    async uploadToDefault(
      @inject(RestBindings.Http.RESPONSE) response: Response,
      @param.path.string('id') id: string,
      @requestBody.file() req: Request,
    ) {
      return new Promise(async(resolve, reject) => {
        const storageInfo = await this.defaultStorageRepository.findById(id);
        if (!storageInfo) throw new HttpErrors.NotFound('Storage issue')
        const s3Access = storageInfo.access;

        if (!s3Access) {
          throw new Error('Access information missing in storage');
        }
        const {accessKeyId, secretAccessKey, bucketName, endpoint, region} = s3Access
        const s3Client = new S3Client({
                endpoint,
                region,
                credentials: {
                  accessKeyId,
                  secretAccessKey,
                },
              });

        this.multerMiddleware(req, response, async (err: any) => {
          if (err) {
            reject(err);
            return;
          }
  
          // Extract files from the request
          const files = (req as any).files; // 'files' corresponds to the field name in the form
          if (!files || files.length === 0) {
            reject(new Error('No files uploaded'));
            return;
          }
  
          try {
            // Map files to promises for uploading to S3
            const uploadPromises = files.map(async (file: { originalname: any; buffer: any; mimetype: any; size: any; }) => {
              const fileKey = `${Date.now()}_${file.originalname}`;
    
              try {
                await s3Client.send(
                  new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                  })
                );
                return {
                  fileName: file.originalname,
                  s3Key: fileKey,
                  size: file.size,
                  status: 'success',
                };
              } catch (error) {
                return {
                  fileName: file.originalname,
                  error: error.message,
                  status: 'failed',
                };
              }
            });
    
            // Use Promise.allSettled to handle all uploads
        const uploadResults = await Promise.allSettled(uploadPromises);

        // Separate successful and failed uploads
        const successfulUploads = uploadResults
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map((result) => result.value);

        const failedUploads = uploadResults
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result) => result.reason);

        // Handle the response based on the results
        if (successfulUploads.length) {
          successfulUploads.forEach((x)=>{
            const id = uuidv4()
            const now = new Date();
            const formatted = now.toISOString().slice(0, 19).replace("T", " ");
            this.vaultDataRepository.create({
              id:id,
              ownerId: storageInfo.ownerId,
              name: x.fileName,
              key:x.s3Key,
              size: 0,
              type:'File',
              createdAt: formatted,
              parentId: 'root',
            })
          })
          resolve({
            message: failedUploads.length ?'Some files uploaded successfully': 'All files were uploaded successfully',
            failedFiles: failedUploads.length ? failedUploads : undefined,
          });
        } else {
          reject({
            message: 'All file uploads failed',
            failedFiles: failedUploads,
          });
        }
          } catch (uploadErr) {
            reject(uploadErr);
          }
        });
      });
    }



  @get('/ds/count')
  @response(200, {
    description: 'DefaultStorage model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(DefaultStorage) where?: Where<DefaultStorage>,
  ): Promise<Count> {
    return this.defaultStorageRepository.count(where);
  }

  @get('/ds')
  @response(200, {
    description: 'Array of DefaultStorage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DefaultStorage, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(DefaultStorage) filter?: Filter<DefaultStorage>,
  ): Promise<DefaultStorage[]> {
    return this.defaultStorageRepository.find(filter);
  }

  @patch('/ds')
  @response(200, {
    description: 'DefaultStorage PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DefaultStorage, {partial: true}),
        },
      },
    })
    defaultStorage: DefaultStorage,
    @param.where(DefaultStorage) where?: Where<DefaultStorage>,
  ): Promise<Count> {
    return this.defaultStorageRepository.updateAll(defaultStorage, where);
  }

  @get('/ds/{id}')
  @response(200, {
    description: 'DefaultStorage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DefaultStorage, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<Object | null> {
    const res = await this.defaultStorageRepository.findOne({
      where:{
        ownerId:id
      },
      fields:{
        access:false,
        ownerId:false,
    }});
    if(res?.providerId){
      
      const type = await this.providerRepository.findById(res?.providerId,{
        fields:{
          id: false,
          name:false,
          type:true
        }})
        delete res?.providerId
      return {...res,...type}
    }
    else{
      throw new HttpErrors.NotFound("Something went wrong")
    }
  }
  @get('/ds/livebridge/{id}')
  @response(200, {
    description: 'DefaultStorage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DefaultStorage, {includeRelations: true}),
      },
    },
  })
  async findBridgeSource(
    @param.path.string('id') id: string,
  ): Promise<Object | null> {
    const res = await this.defaultStorageRepository.findOne({
      where:{
        ownerId:id
      },
      fields:{
        access:false,
        ownerId:false,
    }});
    if(res?.providerId){
      
      const type = await this.providerRepository.findById(res?.providerId,{
        fields:{
          id: false,
          name:false,
          type:true
        }})
        delete res?.providerId
      return {id: res.id, alias:'Vault', type: 'vault'}
    }
    else{
      throw new HttpErrors.NotFound("Something went wrong")
    }
  }

  @patch('/ds/{id}')
  @response(204, {
    description: 'DefaultStorage PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DefaultStorage, {partial: true}),
        },
      },
    })
    defaultStorage: DefaultStorage,
  ): Promise<void> {
    await this.defaultStorageRepository.updateById(id, defaultStorage);
  }

  @put('/ds/{id}')
  @response(204, {
    description: 'DefaultStorage PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() defaultStorage: DefaultStorage,
  ): Promise<void> {
    await this.defaultStorageRepository.replaceById(id, defaultStorage);
  }

  @del('/ds/{id}')
  @response(204, {
    description: 'DefaultStorage DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.defaultStorageRepository.deleteById(id);
  }
}
