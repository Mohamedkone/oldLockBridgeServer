import { HttpRequest } from './../../node_modules/@smithy/protocol-http/dist-types/httpRequest.d';
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
} from '@loopback/rest';
import {Signedurl} from '../models';
import {DefaultStorageRepository, SignedurlRepository, StorageRepository} from '../repositories';
import { ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl, S3RequestPresigner } from '@aws-sdk/s3-request-presigner';

export class SignedurlController {
  constructor(
    @repository(SignedurlRepository)
    public signedurlRepository : SignedurlRepository,
    @repository(StorageRepository)
    public storageRepository : StorageRepository,
    @repository(DefaultStorageRepository)
    public defaultStorageRepository : DefaultStorageRepository,
  ) {}

  @post('/signedurls')
  @response(200, {
    description: 'Signedurl model instance',
    content: {'application/json': {schema: getModelSchemaRef(Signedurl)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Signedurl, {
            title: 'NewSignedurl',
            
          }),
        },
      },
    })
    signedurl: Signedurl,
  ): Promise<Signedurl> {
    return this.signedurlRepository.create(signedurl);
  }



  @post('/signedurls/{type}/{id}')
  @response(200, {
    description: 'Generate Signed URLs',
    content: {'application/json': {schema: {type: 'object'}}},
  })
  async generateSignedUrls(
    @param.path.string('id') id: string,
    @param.path.string('type') type: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              fileNames: {
                type: 'array',
                items: {type: 'string'},
              },
            },
            required: ['fileNames'],
          },
        },
      },
    })
    body: {fileNames: string[]},
  ): Promise<{signedUrls: {[fileName: string]: string}}> {
    try {
      // Fetch storage information from the storage repository
      let storageInfo
      if(type==='s')
        storageInfo = await this.storageRepository.findById(id);
      
      else if(type==='d')
        storageInfo = await this.defaultStorageRepository.findById(id);
      
      else 
      throw new Error('S3 access information is missing in storage info.');

      // Extract S3 access information from the `access` field
      const s3Access = storageInfo.access;

      if (!s3Access) {
        throw new Error('S3 access information is missing in storage info.');
      }

      const {endpoint, accessKeyId, secretAccessKey, bucketName, region} = s3Access;

      // Configure the S3 client
      const s3Client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      // Generate signed URLs for each file name
      const signedUrls: {[fileName: string]: string} = {};

      for (const fileName of body.fileNames) {
        const params = {
          Bucket: bucketName,
          Key: fileName,
        };

        const command = new PutObjectCommand(params);

        const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 3600});
        signedUrls[fileName] = signedUrl;
      }

      return {signedUrls};
    } catch (err) {
      console.error('Error generating pre-signed URL:', err);
      throw err;
    }
  }

  @get('/s3/buckets/{id}')
  @response(200, {
    description: 'List all S3 buckets',
    content: {'application/json': {schema: {type: 'array', items: {type: 'string'}}}},
  })
  async listBuckets(
    @param.path.string('id') id: string
  ): Promise<{buckets: string[]}> {
    try {
      // Fetch storage information from the storage repository
      const storageInfo = await this.storageRepository.findById(id);

      // Extract S3 access information from the `access` field
      const s3Access = storageInfo.access;

      if (!s3Access) {
        throw new Error('S3 access information is missing in storage info.');
      }

      const {endpoint, accessKeyId, secretAccessKey, region} = s3Access;

      // Configure the S3 client
      const s3Client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      // Create command to list buckets
      const command = new ListBucketsCommand({});

      // Fetch bucket list
      const response = await s3Client.send(command);

      // Ensure only defined bucket names are returned
      const bucketNames: string[] = (response.Buckets || [])
        .map(bucket => bucket.Name)
        .filter((name): name is string => typeof name === 'string'); 


      return {buckets: bucketNames};
    } catch (err) {
      console.error('Error listing S3 buckets:', err);
      throw err;
    }
  }


  @get('/s3/bucket-contents/{id}/{bucketName}')
  @response(200, {
    description: 'List all objects in an S3 bucket',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {type: 'string'},
              size: {type: 'number'},
              lastModified: {type: 'string', format: 'date-time'},
            },
          },
        },
      },
    },
  })
  async listBucketContents(
    @param.path.string('id') id: string,
    @param.path.string('bucketName') bucketName: string
  ): Promise<{files: {key: string; size: number; lastModified: string}[]}> {
    try {
      // Fetch storage information from the storage repository
      const storageInfo = await this.storageRepository.findById(id);

      // Extract S3 access information from the `access` field
      const s3Access = storageInfo.access;

      if (!s3Access) {
        throw new Error('S3 access information is missing in storage info.');
      }

      const {endpoint, accessKeyId, secretAccessKey, region} = s3Access;

      // Configure the S3 client
      const s3Client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      // Create command to list bucket objects
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
      });

      // Fetch objects from the bucket
      const response = await s3Client.send(command);

      // Format response data
      const files = (response.Contents || []).map(obj => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || '',
      }));

      return {files};
    } catch (err) {
      console.error('Error listing S3 bucket contents:', err);
      throw err;
    }
  }

  @get('/signedurls/count')
  @response(200, {
    description: 'Signedurl model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Signedurl) where?: Where<Signedurl>,
  ): Promise<Count> {
    return this.signedurlRepository.count(where);
  }

  @get('/signedurls')
  @response(200, {
    description: 'Array of Signedurl model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Signedurl, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Signedurl) filter?: Filter<Signedurl>,
  ): Promise<Signedurl[]> {
    return this.signedurlRepository.find(filter);
  }

  @patch('/signedurls')
  @response(200, {
    description: 'Signedurl PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Signedurl, {partial: true}),
        },
      },
    })
    signedurl: Signedurl,
    @param.where(Signedurl) where?: Where<Signedurl>,
  ): Promise<Count> {
    return this.signedurlRepository.updateAll(signedurl, where);
  }

  @get('/signedurls/{id}')
  @response(200, {
    description: 'Signedurl model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Signedurl, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Signedurl, {exclude: 'where'}) filter?: FilterExcludingWhere<Signedurl>
  ): Promise<Signedurl> {
    return this.signedurlRepository.findById(id, filter);
  }

  @patch('/signedurls/{id}')
  @response(204, {
    description: 'Signedurl PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Signedurl, {partial: true}),
        },
      },
    })
    signedurl: Signedurl,
  ): Promise<void> {
    await this.signedurlRepository.updateById(id, signedurl);
  }

  @put('/signedurls/{id}')
  @response(204, {
    description: 'Signedurl PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() signedurl: Signedurl,
  ): Promise<void> {
    await this.signedurlRepository.replaceById(id, signedurl);
  }

  @del('/signedurls/{id}')
  @response(204, {
    description: 'Signedurl DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.signedurlRepository.deleteById(id);
  }
}
