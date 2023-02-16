import type { ListAllMyBuckets } from './data_model/bucket';
import type { BucketContents } from './data_model/object';
import type { GutBucketParameters, PutBucketParameters } from './data_model/parameters';

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

  headObject(bucket: string, cosPath: string,
    versionId?: string, region?: string): Promise<object>{
      return this.cosServiceModule.headObject(this.serviceKey, bucket, cosPath, region, versionId)
  }

  deleteObject(bucket: string, cosPath: string,
    versionId?: string, region?: string): Promise<void> {
      return this.cosServiceModule.deleteObject(this.serviceKey, bucket, cosPath, region, versionId)
    }
  preBuildConnection(bucket: string): Promise<void>{
    return this.cosServiceModule.preBuildConnection(this.serviceKey, bucket)
  }
  async getService(): Promise<ListAllMyBuckets>{
    let jsonString = await this.cosServiceModule.getService(this.serviceKey)
    return JSON.parse(jsonString)
  }
  async getBucket(bucket: string, parameters: GutBucketParameters): Promise<BucketContents>{
      let jsonString = await this.cosServiceModule.getBucket(
        this.serviceKey, 
        bucket, 
        parameters.region, 
        parameters.prefix, 
        parameters.delimiter, 
        parameters.encodingType, 
        parameters.marker, 
        parameters.maxKeys?parameters.maxKeys.toString():parameters.maxKeys
      )    
    return JSON.parse(jsonString)
  }
  
  putBucket(bucket: string, parameters: PutBucketParameters): Promise<void>{
      return this.cosServiceModule.putBucket(
        this.serviceKey, 
        bucket, 
        parameters.region, 
        parameters.enableMAZ?parameters.enableMAZ.toString():parameters.enableMAZ,
        parameters.cosacl, 
        parameters.readAccount, 
        parameters.writeAccount, 
        parameters.readWriteAccount
      )
  }

  headBucket(bucket: string, region?: string): Promise<object>{
    return this.cosServiceModule.headBucket(this.serviceKey, bucket, region)
  }
  deleteBucket(bucket: string, region?: string): Promise<void>{
    return this.cosServiceModule.deleteBucket(this.serviceKey, bucket, region)
  }
  getBucketAccelerate(bucket: string, region?: string): Promise<boolean>{
    return this.cosServiceModule.getBucketAccelerate(this.serviceKey, bucket, region)
  }
  putBucketAccelerate(bucket: string, enable: boolean, region?: string): Promise<void>{
    return this.cosServiceModule.putBucketAccelerate(this.serviceKey, bucket, enable, region)
  }
  getBucketVersioning(bucket: string, region?: string): Promise<boolean>{
    return this.cosServiceModule.getBucketVersioning(this.serviceKey, bucket, region)
  }
  putBucketVersioning(bucket: string, enable: boolean, region?: string): Promise<void>{
    return this.cosServiceModule.putBucketVersioning(this.serviceKey, bucket, enable, region)
  }
  getBucketLocation(bucket: string, region?: string): Promise<string>{
    return this.cosServiceModule.getBucketLocation(this.serviceKey, bucket, region)
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