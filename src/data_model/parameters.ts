import type { InitMultipleUploadCallBack, ProgressCallBack, ResultListener, StateCallBack } from "src/cos_transfer"
import type { SessionQCloudCredentials } from "./credentials"

export type PutBucketParameters= {
    region?: string,
    enableMAZ?: boolean,
    cosacl?: string,
    readAccount?: string,
    writeAccount?: string,
    readWriteAccount?: string,
    sessionCredentials?: SessionQCloudCredentials
}

export type GetBucketParameters= {
    region?: string,
    prefix?: string,
    delimiter?: string,
    encodingType?: string,
    marker?: string,
    maxKeys?: number,
    sessionCredentials?: SessionQCloudCredentials
}

export type PresignedUrlParameters= {
    signValidTime?: number,
    signHost?: boolean,
    parameters?: object,
    region?: string,
    sessionCredentials?: SessionQCloudCredentials
}

export type UploadParameters= {
    uploadId?: string,
    resultListener?: ResultListener,
    stateCallback?: StateCallBack,
    progressCallback?: ProgressCallBack,
    initMultipleUploadCallback?: InitMultipleUploadCallBack,
    stroageClass?: string,
    trafficLimit?: number,
    region?: string,
    sessionCredentials?: SessionQCloudCredentials
}

export type DownloadParameters= {
    resultListener?: ResultListener,
    stateCallback?: StateCallBack,
    progressCallback?: ProgressCallBack,
    versionId?: string,
    trafficLimit?: number,
    region?: string,
    sessionCredentials?: SessionQCloudCredentials
}

export type DnsMapParameters= {
    domain: string,
    ips: Array<string>,
}
