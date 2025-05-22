import type { ListAllMyBuckets } from './data_model/bucket';
import type { SessionQCloudCredentials } from './data_model/credentials';
import type { BucketContents } from './data_model/object';
import type { GetBucketParameters, PutBucketParameters, PresignedUrlParameters } from './data_model/parameters';

export class CosService {
  private cosServiceModule: any;
  private serviceKey: string;

  constructor(serviceKey: string, cosServiceModule: any) {
    this.cosServiceModule = cosServiceModule;
    this.serviceKey = serviceKey;
  }

  getObjectUrl(bucket: string, cosPath: string, region: string): Promise<string> {
    return this.cosServiceModule.getObjectUrl(this.serviceKey, bucket, cosPath, region)
  }

  getPresignedUrl(
    bucket: string,
    cosPath: string,
    parameters?: PresignedUrlParameters
  ): Promise<string> {
    return this.cosServiceModule.getPresignedUrl(
      this.serviceKey, 
      bucket, 
      cosPath, 
      parameters?.signValidTime != undefined ?parameters.signValidTime.toString():parameters?.signValidTime,
      parameters?.signHost != undefined ?parameters.signHost.toString():parameters?.signHost,
      parameters?.parameters, 
      parameters?.region,
      parameters?.sessionCredentials
    );
  }


  headObject(bucket: string, cosPath: string,
    versionId?: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<object>{
      return this.cosServiceModule.headObject(this.serviceKey, bucket, cosPath, region, versionId, sessionCredentials)
  }

  deleteObject(bucket: string, cosPath: string,
    versionId?: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<void> {
      return this.cosServiceModule.deleteObject(this.serviceKey, bucket, cosPath, region, versionId, sessionCredentials)
    }
  preBuildConnection(bucket: string): Promise<void>{
    return this.cosServiceModule.preBuildConnection(this.serviceKey, bucket)
  }
  async getService(sessionCredentials?: SessionQCloudCredentials): Promise<ListAllMyBuckets>{
    let jsonString = await this.cosServiceModule.getService(this.serviceKey, sessionCredentials)
    return JSON.parse(jsonString)
  }
  async getBucket(bucket: string, parameters?: GetBucketParameters): Promise<BucketContents>{
      let jsonString = await this.cosServiceModule.getBucket(
        this.serviceKey, 
        bucket, 
        parameters?.region, 
        parameters?.prefix, 
        parameters?.delimiter, 
        parameters?.encodingType, 
        parameters?.marker, 
        parameters?.maxKeys != undefined ?parameters.maxKeys.toString():parameters?.maxKeys,
        parameters?.sessionCredentials
      )    
    return JSON.parse(jsonString)
  }
  
  putBucket(bucket: string, parameters?: PutBucketParameters): Promise<void>{
      return this.cosServiceModule.putBucket(
        this.serviceKey, 
        bucket, 
        parameters?.region, 
        parameters?.enableMAZ != undefined ?parameters.enableMAZ.toString():parameters?.enableMAZ,
        parameters?.cosacl, 
        parameters?.readAccount, 
        parameters?.writeAccount, 
        parameters?.readWriteAccount,
        parameters?.sessionCredentials
      )
  }

  headBucket(bucket: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<object>{
    return this.cosServiceModule.headBucket(this.serviceKey, bucket, region, sessionCredentials)
  }
  deleteBucket(bucket: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<void>{
    return this.cosServiceModule.deleteBucket(this.serviceKey, bucket, region, sessionCredentials)
  }
  getBucketAccelerate(bucket: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<boolean>{
    return this.cosServiceModule.getBucketAccelerate(this.serviceKey, bucket, region, sessionCredentials)
  }
  putBucketAccelerate(bucket: string, enable: boolean, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<void>{
    return this.cosServiceModule.putBucketAccelerate(this.serviceKey, bucket, enable, region, sessionCredentials)
  }
  getBucketVersioning(bucket: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<boolean>{
    return this.cosServiceModule.getBucketVersioning(this.serviceKey, bucket, region, sessionCredentials)
  }
  putBucketVersioning(bucket: string, enable: boolean, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<void>{
    return this.cosServiceModule.putBucketVersioning(this.serviceKey, bucket, enable, region, sessionCredentials)
  }
  getBucketLocation(bucket: string, region?: string, sessionCredentials?: SessionQCloudCredentials): Promise<string>{
    return this.cosServiceModule.getBucketLocation(this.serviceKey, bucket, region, sessionCredentials)
  }
  doesBucketExist(bucket: string): Promise<boolean>{
    return this.cosServiceModule.doesBucketExist(this.serviceKey, bucket)
  }
  doesObjectExist(bucket: string, cosPath: string): Promise<boolean>{
    return this.cosServiceModule.doesObjectExist(this.serviceKey, bucket, cosPath)
  }
  cancelAll(): Promise<void>{
    return this.cosServiceModule.cancelAll(this.serviceKey)
  }
}