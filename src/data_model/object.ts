import type { Owner } from "./owner";

export type Content = {
  /// 对象键
  key: string;

  /// 对象最后修改时间，为 ISO8601 格式，如2019-05-24T10:56:40Z
  lastModified: string;

  /// 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，
  /// 例如“8e0b617ca298a564c3331da28dcb50df”，此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同
  eTag: string;

  /// 对象大小，单位为 Byte
  size: number;

  /// 对象持有者信息
  owner: Owner;

  /// 对象存储类型
  storageClass: string;
}

export type CommonPrefixes = {
  /// Common Prefix 的前缀
  prefix: string;
}

export type BucketContents = {
  /// 存储桶的名称，格式为<BucketName-APPID>，例如examplebucket-1250000000
  name: string;

  /// 编码格式，对应请求中的 encoding-type 参数，且仅当请求中指定了 encoding-type 参数才会返回该节点
  encodingType?: string;

  /// 对象键匹配前缀，对应请求中的 prefix 参数
  prefix?: string;

  /// 起始对象键标记，从该标记之后（不含）按照 UTF-8 字典序返回对象键条目，对应请求中的 marker 参数
  marker?: string;

  /// 单次响应返回结果的最大条目数量，对应请求中的 max-keys 参数
  /// 注意：该参数会限制每一次 List 操作返回的最大条目数，COS 在每次 List 操作中将返回不超过 max-keys 所设定数值的条目。
  /// 如果由于您设置了 max-keys 参数，导致单次响应中未列出所有对象，COS 会返回一项 nextmarker 参数作为您下次 List 请求的入参，
  /// 以便您后续进行列出对象
  maxKeys: number;

  /// 响应条目是否被截断，布尔值，例如 true 或 false
  isTruncated: boolean;

  /// 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，
  /// 该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入
  nextMarker?: string;

  /// 对象条目
  contentsList: Array<Content>;

  /// 从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分，
  /// 定义为 Common Prefix。仅当请求中指定了 delimiter 参数才有可能返回该节点
  commonPrefixesList: Array<CommonPrefixes>;

  /// 分隔符，对应请求中的 delimiter 参数，且仅当请求中指定了 delimiter 参数才会返回该节点
  delimiter?: string;
}