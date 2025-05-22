import type { TransferState } from './data_model/enums';
import type { CosXmlClientError, CosXmlServiceError } from './data_model/errors';
import uuid from 'react-native-uuid';
import type { DownloadParameters, UploadParameters } from './data_model/parameters';

/// 成功回调
export type ResultSuccessCallBack = (header?: object) => void

/// 失败回调
export type ResultFailCallBack = (clientException?: CosXmlClientError, serviceException?: CosXmlServiceError) => void


/// 请求结果回调
export type ResultListener = {
  successCallBack: ResultSuccessCallBack;
  failCallBack: ResultFailCallBack;
}

/// 传输状态变化回调
/// @param state 传输状态
export type StateCallBack = (state: TransferState) => void

/// 进度回调方法
/// @param complete 已上传或者已下载的数据长度
/// @param target 总的数据长度
export type ProgressCallBack = (complete: number, target: number) => void

/// 分块上传初始化完成回调方法
/// @param bucket 分片上传的目标 Bucket，由用户自定义字符串和系统生成appid数字串由中划线连接而成，如：mybucket-1250000000.
/// @param cosKey Object 的名称
/// @param uploadId 在后续上传中使用的 ID
export type InitMultipleUploadCallBack = (bucket: string, cosKey: string, uploadId: string) => void

export class CosTransferManger {
  private cosTransferModule: any;
  private transferKey: string;

  //回调map
  private resultListeners: Map<string, ResultListener>;
  private stateCallBacks: Map<string, StateCallBack>;
  private progressCallBacks: Map<string, ProgressCallBack>;
  private initMultipleUploadCallbacks: Map<string, InitMultipleUploadCallBack>;

  constructor(transferKey: string, cosTransferModule: any) {
    this.cosTransferModule = cosTransferModule;
    this.transferKey = transferKey
    this.resultListeners = new Map()
    this.stateCallBacks = new Map()
    this.progressCallBacks = new Map()
    this.initMultipleUploadCallbacks = new Map()
  }

  async upload(
    bucket: string,
    cosPath: string,
    fileUri: string,
    parameters: UploadParameters
  ): Promise<TransferTask> {
    let resultCallbackKey = this.addResultListener(parameters.resultListener)
    let stateCallbackKey = this.addStateCallBack(parameters.stateCallback)
    let progressCallbackKey = this.addProgressCallBack(parameters.progressCallback)
    let initMultipleUploadCallbackKey = this.addInitMultipleUploadCallback(parameters.initMultipleUploadCallback)

    let taskId: string = await this.cosTransferModule.upload(
      this.transferKey,
      bucket,
      cosPath,
      fileUri,
      parameters.uploadId,
      resultCallbackKey,
      stateCallbackKey,
      progressCallbackKey,
      initMultipleUploadCallbackKey,
      parameters.stroageClass,
      parameters.trafficLimit != undefined ?parameters.trafficLimit.toString():parameters.trafficLimit,
      parameters.region,
      parameters.sessionCredentials
    )

    return new TransferTask(this.transferKey, taskId, this.cosTransferModule)
  }
  async download(
    bucket: string,
    cosPath: string,
    savePath: string,
    parameters: DownloadParameters
  ): Promise<TransferTask> {
    let resultCallbackKey = this.addResultListener(parameters.resultListener)
    let stateCallbackKey = this.addStateCallBack(parameters.stateCallback)
    let progressCallbackKey = this.addProgressCallBack(parameters.progressCallback)
    let taskId: string = await this.cosTransferModule.download(
      this.transferKey,
      bucket,
      cosPath,
      savePath,
      resultCallbackKey,
      stateCallbackKey,
      progressCallbackKey,
      parameters.versionId,
      parameters.trafficLimit != undefined ?parameters.trafficLimit.toString():parameters.trafficLimit,
      parameters.region,
      parameters.sessionCredentials
    )

    return new TransferTask(this.transferKey, taskId, this.cosTransferModule)
  }

  runResultSuccessCallBack(key: string, header?: object): void {
    this.resultListeners.get(key)?.successCallBack(header)
    this.resultListeners.delete(key)
    this.stateCallBacks.delete(key)
    this.progressCallBacks.delete(key)
  }

  runResultFailCallBack(key: string, clientException?: CosXmlClientError, serviceException?: CosXmlServiceError): void {
    this.resultListeners.get(key)?.failCallBack(clientException, serviceException)
    this.resultListeners.delete(key)
    this.stateCallBacks.delete(key)
    this.progressCallBacks.delete(key)
  }

  runStateCallBack(key: string, state: string): void {
    this.stateCallBacks.get(key)?.(state as TransferState)
  }

  runProgressCallBack(key: string, complete: number, target: number): void {
    this.progressCallBacks.get(key)?.(complete, target)
  }

  runInitMultipleUploadCallback(key: string, bucket: string, cosKey: string, uploadId: string): void {
    this.initMultipleUploadCallbacks.get(key)?.(bucket, cosKey, uploadId)
  }

  /// 生成回调key并加入回调map
  private addResultListener(resultListener?: ResultListener): string | undefined {
    if (resultListener != null && resultListener != undefined) {
      let resultCallbackKey: string = uuid.v4().toString()
      this.resultListeners.set(resultCallbackKey, resultListener)
      return resultCallbackKey
    }
    return undefined
  }

  private addStateCallBack(stateCallback?: StateCallBack): string | undefined {
    if (stateCallback != null && stateCallback != undefined) {
      let stateCallbackKey = uuid.v4().toString()
      this.stateCallBacks.set(stateCallbackKey, stateCallback)
      return stateCallbackKey
    }
    return undefined
  }

  private addProgressCallBack(progressCallBack?: ProgressCallBack): string | undefined {
    if (progressCallBack != null && progressCallBack != undefined) {
      let progressCallbackKey = uuid.v4().toString()
      this.progressCallBacks.set(progressCallbackKey, progressCallBack)
      return progressCallbackKey
    }
    return undefined
  }

  private addInitMultipleUploadCallback(initMultipleUploadCallback?: InitMultipleUploadCallBack): string | undefined {
    if (initMultipleUploadCallback != null && initMultipleUploadCallback != undefined) {
      let initMultipleUploadCallbackKey = uuid.v4().toString()
      this.initMultipleUploadCallbacks.set(initMultipleUploadCallbackKey, initMultipleUploadCallback)
      return initMultipleUploadCallbackKey
    }
    return undefined
  }
}

export class TransferTask {
  private cosTransferModule: any;
  private transferKey: string
  private taskId: string

  constructor(transferKey: string, taskId: string, cosTransferModule: any) {
    this.cosTransferModule = cosTransferModule;
    this.transferKey = transferKey
    this.taskId = taskId
  }

  pause(): Promise<void> {
    return this.cosTransferModule.pause(this.transferKey, this.taskId)
  }
  resume(): Promise<void> {
    return this.cosTransferModule.resume(this.transferKey, this.taskId)
  }
  cancel(): Promise<void> {
    return this.cosTransferModule.cancel(this.transferKey, this.taskId)
  }
}
