import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { CosService } from './cos_service';
import { CosTransferManger } from './cos_transfer';
import type { CosXmlServiceConfig, TransferConfig } from './data_model/config';
import { COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK, COS_EMITTER_PROGRESS_CALLBACK, COS_EMITTER_RESULT_FAIL_CALLBACK, COS_EMITTER_RESULT_SUCCESS_CALLBACK, COS_EMITTER_STATE_CALLBACK, COS_EMITTER_UPDATE_SESSION_CREDENTIAL, InitMultipleUploadEvent, TransferProgressEvent, TransferResultFailEvent, TransferResultSuccessEvent, TransferStateEvent } from './data_model/events';
import type { SessionQCloudCredentials } from './data_model/credentials';
import { IllegalArgumentError } from './data_model/errors';

const LINKING_ERROR =
  `The package 'tencentcloud-cos-sdk-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const QCloudCosReactNative = NativeModules.QCloudCosReactNative
  ? NativeModules.QCloudCosReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const CosEventEmitter = NativeModules.CosEventEmitter
? NativeModules.CosEventEmitter
: new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );
    

const DEFAULT_KEY = "";

class Cos {
  private emitter: NativeEventEmitter;
  private initialized: boolean = false;

  private cosServices: Map<string, CosService>;
  private cosTransfers: Map<string, CosTransferManger>;

  constructor() {
    this.cosServices = new Map()
    this.cosTransfers = new Map()
    
    if(Platform.OS === 'ios'){
      this.emitter = new NativeEventEmitter(CosEventEmitter);
    } else if(Platform.OS === 'android') {
      this.emitter = new NativeEventEmitter(QCloudCosReactNative);
    } else {
      this.emitter = new NativeEventEmitter();
    }
    
    this.emitter.addListener(COS_EMITTER_RESULT_SUCCESS_CALLBACK, (event: TransferResultSuccessEvent) => {
      this.getTransferManger(event.transferKey).runResultSuccessCallBack(event.callbackKey, event.headers);
    });
    this.emitter.addListener(COS_EMITTER_RESULT_FAIL_CALLBACK, (event: TransferResultFailEvent) => {
      this.getTransferManger(event.transferKey).runResultFailCallBack(event.callbackKey, event.clientException, event.serviceException);
    });
    this.emitter.addListener(COS_EMITTER_PROGRESS_CALLBACK, (event: TransferProgressEvent) => {
      this.getTransferManger(event.transferKey).runProgressCallBack(event.callbackKey, Number(event.complete), Number(event.target));
    });
    this.emitter.addListener(COS_EMITTER_STATE_CALLBACK, (event: TransferStateEvent) => {
      this.getTransferManger(event.transferKey).runStateCallBack(event.callbackKey, event.state);
    });
    this.emitter.addListener(COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK, (event: InitMultipleUploadEvent) => {
      this.getTransferManger(event.transferKey).runInitMultipleUploadCallback(event.callbackKey, event.bucket, event.key, event.uploadId);
    });
  }

  initWithPlainSecret(secretId: string, secretKey: string): Promise<void> | undefined {
    if (!this.initialized) {
      this.initialized = true
      return QCloudCosReactNative.initWithPlainSecret(secretId, secretKey)
    } else {
      console.log("COS Service has been inited before.");
    }
  }

  initWithSessionCredentialCallback(callback: () => Promise<SessionQCloudCredentials>): Promise<void> | undefined {
    if (!this.initialized) {
      this.initialized = true
      this.emitter.addListener(COS_EMITTER_UPDATE_SESSION_CREDENTIAL, async () => {
        const credential = await callback()
        QCloudCosReactNative.updateSessionCredential(credential)
      });
      return QCloudCosReactNative.initWithSessionCredentialCallback()
    } else {
      console.log("COS Service has been inited before.");
    }
  }

  setCloseBeacon(isCloseBeacon: boolean): Promise<void>{
    return QCloudCosReactNative.setCloseBeacon(isCloseBeacon)
  }

  async registerDefaultService(config: CosXmlServiceConfig): Promise<CosService>{
    await QCloudCosReactNative.registerDefaultService(config)
    let cosService = new CosService(DEFAULT_KEY, QCloudCosReactNative);
    this.cosServices.set(DEFAULT_KEY, cosService)
    return cosService;
  }
  async registerDefaultTransferManger(config: CosXmlServiceConfig, transferConfig?: TransferConfig): Promise<CosTransferManger>{
    await QCloudCosReactNative.registerDefaultTransferManger(config, transferConfig)
    let cosTransfer = new CosTransferManger(DEFAULT_KEY, QCloudCosReactNative);
    this.cosTransfers.set(DEFAULT_KEY, cosTransfer)
    return cosTransfer;
  }
  async registerService(key: string, config: CosXmlServiceConfig): Promise<CosService>{
    if (key == DEFAULT_KEY) {
      throw new IllegalArgumentError("register key cannot be empty");
    }

    await QCloudCosReactNative.registerService(key, config);
    let cosService = new CosService(key, QCloudCosReactNative);
    this.cosServices.set(key, cosService)
    return cosService;
  }
  async registerTransferManger(key: string, config: CosXmlServiceConfig, transferConfig?: TransferConfig): Promise<CosTransferManger>{
    if (key == DEFAULT_KEY) {
      throw new IllegalArgumentError("register key cannot be empty");
    }
    await QCloudCosReactNative.registerTransferManger(key, config, transferConfig)
    let cosTransfer = new CosTransferManger(key, QCloudCosReactNative);
    this.cosTransfers.set(key, cosTransfer)
    return cosTransfer;
  }

  hasDefaultService(): boolean {
    return this.cosServices.has(DEFAULT_KEY);
  }

  getDefaultService(): CosService {
    if(this.cosServices.has(DEFAULT_KEY)){
      return this.cosServices.get(DEFAULT_KEY)!;
    } else {
      throw new IllegalArgumentError("default service unregistered");
    }
  }

  hasDefaultTransferManger(): boolean {
    return this.cosTransfers.has(DEFAULT_KEY);
  }

  getDefaultTransferManger(): CosTransferManger {
    if(this.cosTransfers.has(DEFAULT_KEY)){
      return this.cosTransfers.get(DEFAULT_KEY)!;
    } else {
      throw new IllegalArgumentError("default transfer manger unregistered");
    }
  }

  hasService(key: string): boolean {
    return this.cosServices.has(key);
  }

  getService(key: string): CosService {
    if(this.cosServices.has(key)){
      return this.cosServices.get(key)!;
    } else {
      throw new IllegalArgumentError(`${key} service unregistered`);
    }
  }

  hasTransferManger(key: string): boolean {
    return this.cosTransfers.has(key);
  }

  getTransferManger(key: string): CosTransferManger {
    if(this.cosTransfers.has(key)){
      return this.cosTransfers.get(key)!;
    } else {
      throw new IllegalArgumentError(`${key} transfer manger unregistered`);
    }
  }
}
export default new Cos()
