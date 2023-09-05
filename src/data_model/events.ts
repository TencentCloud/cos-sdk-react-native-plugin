import type { CosXmlClientError, CosXmlServiceError } from "./errors";

// native to js: 更新临时秘钥
export const COS_EMITTER_UPDATE_SESSION_CREDENTIAL: string = "COSEmitterUpdateSessionCredential"
// native to js: 获取domain对应的ip数组
export const COS_EMITTER_DNS_FETCH: string = "COSEmitterDnsFetch"
// native to js: 回调结果成功
export const COS_EMITTER_RESULT_SUCCESS_CALLBACK: string = "COSEmitterResultSuccessCallback";
// native to js: 回调结果失败
export const COS_EMITTER_RESULT_FAIL_CALLBACK: string = "COSEmitterResultFailCallback";
// native to js: 回调进度
export const COS_EMITTER_PROGRESS_CALLBACK: string = "COSEmitterProgressCallback";
// native to js: 回调状态
export const COS_EMITTER_STATE_CALLBACK: string = "COSEmitterStateCallback";
// native to js: 回调分块上传初始化
export const COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK: string = "COSEmitterInitMultipleUploadCallback";

export type UpdateSessionCredentialEvent = {
    stsScopesArrayJson?: string;
}

export type TransferResultSuccessEvent = {
    transferKey: string;
    callbackKey: string;
    headers?: object;
}

export type TransferResultFailEvent = {
    transferKey: string;
    callbackKey: string;
    clientException?: CosXmlClientError;
    serviceException?: CosXmlServiceError;
}

export type TransferProgressEvent = {
    transferKey: string;
    callbackKey: string;
    complete: string;
    target: string;
}

export type TransferStateEvent = {
    transferKey: string;
    callbackKey: string;
    state: string;
}

export type InitMultipleUploadEvent = {
    transferKey: string;
    callbackKey: string;
    bucket: string;
    key: string;
    uploadId: string;
}