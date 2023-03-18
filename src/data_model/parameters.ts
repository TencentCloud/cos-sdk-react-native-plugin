import type { InitMultipleUploadCallBack, ProgressCallBack, ResultListener, StateCallBack } from "src/cos_transfer"

export type PutBucketParameters= {
    region?: string, 
    enableMAZ?: boolean, 
    cosacl?: string, 
    readAccount?: string, 
    writeAccount?: string, 
    readWriteAccount?: string
}

export type GetBucketParameters= {
    region?: string, 
    prefix?: string, 
    delimiter?: string, 
    encodingType?: string, 
    marker?: string, 
    maxKeys?: number
}

export type PresignedUrlParameters= {
    signValidTime?: number,
    signHost?: boolean,
    parameters?: object,
    region?: string
}

export type UploadParameters= {
    uploadId?: string,
    resultListener?: ResultListener,
    stateCallback?: StateCallBack,
    progressCallback?: ProgressCallBack,
    initMultipleUploadCallback?: InitMultipleUploadCallBack,
    stroageClass?: string,
    trafficLimit?: number,
    region?: string
}

export type DownloadParameters= {
    resultListener?: ResultListener,
    stateCallback?: StateCallBack,
    progressCallback?: ProgressCallBack,
    versionId?: string,
    trafficLimit?: number,
    region?: string
}

