import type { Owner } from "./owner";

export type Bucket = {
    /// 存储桶的名称
    name: string;

    /// 存储桶所在地域
    location?: string;
  
    /// 存储桶的创建时间，为 ISO8601 格式，例如2019-05-24T10:56:40Z
    createDate?: string;
    type?: string;
}

export type ListAllMyBuckets = {
  /// 存储桶持有者信息
  owner: Owner;

  /// 存储桶列表
  buckets: Array<Bucket>;
}