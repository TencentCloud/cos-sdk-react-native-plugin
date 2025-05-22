import type { BucketContents, CommonPrefixes, Content } from 'react-native-cos-sdk';

export class ObjectEntity {
    private isFolder: boolean;
    private content: Content | undefined;
    private commonPrefixes: CommonPrefixes | undefined;

    constructor(isFolder: boolean, content: Content | undefined, commonPrefixes: CommonPrefixes | undefined) {
        this.isFolder = isFolder;
        this.content = content;
        this.commonPrefixes = commonPrefixes;
    }

  public getIsFolder(): boolean {
    return this.isFolder;
  }

  public getContent(): Content | undefined {
    return this.content;
  }

  public getCommonPrefixes(): CommonPrefixes | undefined {
    return this.commonPrefixes;
  }

  static bucketContents2ObjectList(bucketContents: BucketContents, prefix: string | undefined): Array<ObjectEntity> {
    let list = new Array<ObjectEntity>;
      if(bucketContents.commonPrefixesList && bucketContents.commonPrefixesList.length>0){
        for (let commonPrefixes of bucketContents.commonPrefixesList){
          if(commonPrefixes) {
            list.push(new ObjectEntity(true, undefined, commonPrefixes));
          }
        }
      }
      if(bucketContents.contentsList && bucketContents.contentsList.length>0){
        for (let content of bucketContents.contentsList){
          //文件夹内容过滤掉自身
          if(prefix == undefined || prefix.length == 0 || prefix != content!.key) {
            list.push(new ObjectEntity(false, content, undefined));
          }
        }
      }
    return list;
  }
}