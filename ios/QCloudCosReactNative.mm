#import "QCloudCosReactNative.h"
#import "QCloudServiceConfiguration_Private.h"
#import "CosPluginSignatureProvider.h"
#import <QCloudCOSXML/QCloudCOSXML.h>
#import <objc/runtime.h>
#import "pigeon.h"
#import "CosEventEmitter.h"

static void *kQCloudDownloadRequestResultCallbackKey = &kQCloudDownloadRequestResultCallbackKey;
static void *kQCloudDownloadRequestProgressCallbackKey = &kQCloudDownloadRequestProgressCallbackKey;
static void *kQCloudDownloadRequestStateCallbackKey = &kQCloudDownloadRequestStateCallbackKey;
static void *kQCloudDownloadRequestLocalDownloaded = &kQCloudDownloadRequestLocalDownloaded;
@implementation QCloudCOSXMLDownloadObjectRequest (DownloadObjectRequestExt)

- (void)setStateCallbackKey:(NSString *)stateCallbackKey {
    objc_setAssociatedObject(self, kQCloudDownloadRequestStateCallbackKey, stateCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)stateCallbackKey {
    return objc_getAssociatedObject(self, kQCloudDownloadRequestStateCallbackKey);
}

- (void)setResultCallbackKey:(NSString *)resultCallbackKey {
    objc_setAssociatedObject(self, kQCloudDownloadRequestResultCallbackKey, resultCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)resultCallbackKey {
    return objc_getAssociatedObject(self, kQCloudDownloadRequestResultCallbackKey);
}

- (void)setProgressCallbackKey:(NSString *)progressCallbackKey {
    objc_setAssociatedObject(self, kQCloudDownloadRequestProgressCallbackKey, progressCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)progressCallbackKey {
    return objc_getAssociatedObject(self, kQCloudDownloadRequestProgressCallbackKey);
}

- (void)setLocalDownloaded:(NSNumber *)localDownloaded {
    objc_setAssociatedObject(self, kQCloudDownloadRequestLocalDownloaded, localDownloaded, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSNumber *)localDownloaded {
    return objc_getAssociatedObject(self, kQCloudDownloadRequestLocalDownloaded);
}

@end

static void *kQCloudUploadRequestResultCallbackKey = &kQCloudUploadRequestResultCallbackKey;
static void *kQCloudUploadRequestProgressCallbackKey = &kQCloudUploadRequestProgressCallbackKey;
static void *kQCloudUploadRequestStateCallbackKey = &kQCloudUploadRequestStateCallbackKey;
static void *kQCloudUploadRequestIinitMultipleUploadCallbackKey = &kQCloudUploadRequestIinitMultipleUploadCallbackKey;
static void *kQCloudUploadRequestResmeData = &kQCloudUploadRequestResmeData;
@implementation QCloudCOSXMLUploadObjectRequest (UploadObjectRequestExt)

- (void)setStateCallbackKey:(NSString *)stateCallbackKey {
    objc_setAssociatedObject(self, kQCloudUploadRequestStateCallbackKey, stateCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)stateCallbackKey {
    return objc_getAssociatedObject(self, kQCloudUploadRequestStateCallbackKey);
}

- (void)setResultCallbackKey:(NSString *)resultCallbackKey {
    objc_setAssociatedObject(self, kQCloudUploadRequestResultCallbackKey, resultCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)resultCallbackKey {
    return objc_getAssociatedObject(self, kQCloudUploadRequestResultCallbackKey);
}

- (void)setProgressCallbackKey:(NSString *)progressCallbackKey {
    objc_setAssociatedObject(self, kQCloudUploadRequestProgressCallbackKey, progressCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)progressCallbackKey {
    return objc_getAssociatedObject(self, kQCloudUploadRequestProgressCallbackKey);
}

- (void)setIinitMultipleUploadCallbackKey:(NSString *)iinitMultipleUploadCallbackKey {
    objc_setAssociatedObject(self, kQCloudUploadRequestIinitMultipleUploadCallbackKey, iinitMultipleUploadCallbackKey, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSString *)iinitMultipleUploadCallbackKey {
    return objc_getAssociatedObject(self, kQCloudUploadRequestIinitMultipleUploadCallbackKey);
}

- (void)setResmeData:(NSData *)resmeData {
    objc_setAssociatedObject(self, kQCloudUploadRequestResmeData, resmeData, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSData *)resmeData {
    return objc_getAssociatedObject(self, kQCloudUploadRequestResmeData);
}

@end

@interface QCloudCosReactNative ()
{
    CosPluginSignatureProvider* signatureProvider;
    NSString * permanentSecretId;
    NSString * permanentSecretKey;
    bool isScopeLimitCredential;
}
@end

@implementation QCloudCosReactNative
NSString * const QCloudCOS_DEFAULT_KEY = @"";
NSString * const QCloudCOS_BRIDGE = @"ReactNative";
NSString * const QCloudCOS_UA_FLUTTER_PLUGIN = @"ReactNativePlugin";

NSString * const QCloudCOS_STATE_WAITING = @"WAITING";
NSString * const QCloudCOS_STATE_IN_PROGRESS = @"IN_PROGRESS";
NSString * const QCloudCOS_STATE_PAUSED = @"PAUSED";
NSString * const QCloudCOS_STATE_RESUMED_WAITING = @"RESUMED_WAITING";
NSString * const QCloudCOS_STATE_COMPLETED = @"COMPLETED";
NSString * const QCloudCOS_STATE_FAILED = @"FAILED";
NSString * const QCloudCOS_STATE_CANCELED = @"CANCELED";

RCT_EXPORT_MODULE()

QCloudThreadSafeMutableDictionary *QCloudCOSTransferConfigCache() {
    static QCloudThreadSafeMutableDictionary *CloudCOSTransferConfig = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CloudCOSTransferConfig = [QCloudThreadSafeMutableDictionary new];
    });
    
    return CloudCOSTransferConfig;
}

QCloudThreadSafeMutableDictionary *QCloudCOSTaskCache() {
    static QCloudThreadSafeMutableDictionary *CloudCOSTask = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CloudCOSTask = [QCloudThreadSafeMutableDictionary new];
    });
    return CloudCOSTask;
}

QCloudThreadSafeMutableDictionary *QCloudCOSTaskStateCache() {
    static QCloudThreadSafeMutableDictionary *CloudCOSTask = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CloudCOSTask = [QCloudThreadSafeMutableDictionary new];
    });
    return CloudCOSTask;
}

-(nonnull QCloudServiceConfiguration *)buildConfiguration:(nonnull NSDictionary *)config{
    QCloudServiceConfiguration* configuration = [QCloudServiceConfiguration new];
    configuration.bridge = QCloudCOS_BRIDGE;
    QCloudCOSXMLEndPoint* endpoint;
    id host = [config objectForKey:@"host"];
    if(host){
        endpoint = [[QCloudCOSXMLEndPoint alloc] initWithLiteralURL:[NSURL URLWithString:host]];
    } else {
        endpoint = [[QCloudCOSXMLEndPoint alloc] init];
    }
    id region = [config objectForKey:@"region"];
    if(region){
        endpoint.regionName = region;
    }
    id connectionTimeout = [config objectForKey:@"connectionTimeout"];
    if(connectionTimeout){
        configuration.timeoutInterval = [connectionTimeout doubleValue]/1000;
    }
    id userAgent = [config objectForKey:@"userAgent"];
    if(userAgent && ![userAgent isEqualToString:@""]){
        configuration.userAgentProductKey = userAgent;
    } else {
        configuration.userAgentProductKey = QCloudCOS_UA_FLUTTER_PLUGIN;
    }
    id isHttps = [config objectForKey:@"isHttps"];
    if(isHttps){
        endpoint.useHTTPS = isHttps;
    }
    id accelerate = [config objectForKey:@"accelerate"];
    if(accelerate && [accelerate boolValue]){
        endpoint.suffix = @"cos.accelerate.myqcloud.com";
    }
    // todo iOS不支持：HostFormat、SocketTimeout、port、IsDebuggable、SignInUrl、DnsCache、
    configuration.endpoint = endpoint;

    configuration.signatureProvider = signatureProvider;
    return configuration;
}

-(QCloudCOSXMLService *)getQCloudCOSXMLService:(nonnull NSString *)key {
    if([QCloudCOS_DEFAULT_KEY isEqual:key]){
        return [QCloudCOSXMLService defaultCOSXML];
    } else {
        return [QCloudCOSXMLService cosxmlServiceForKey:key];
    }
}

-(QCloudCOSTransferMangerService *)getQCloudCOSTransferMangerService:(nonnull NSString *)key {
    if([QCloudCOS_DEFAULT_KEY isEqual:key]){
        return [QCloudCOSTransferMangerService defaultCOSTransferManager];
    } else {
        return [QCloudCOSTransferMangerService costransfermangerServiceForKey:key];
    }
}

RCT_REMAP_METHOD(initWithPlainSecret,
                 initWithPlainSecretSecretId:(NSString *)secretId secretKey:(NSString *)secretKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    permanentSecretId = secretId;
    permanentSecretKey = secretKey;
    signatureProvider = [CosPluginSignatureProvider makeWithSecretId:permanentSecretId secretKey:permanentSecretKey isScopeLimitCredential:isScopeLimitCredential];
    resolve(nil);
}

RCT_REMAP_METHOD(initWithSessionCredentialCallback,
                 initWithSessionCredentialCallbackWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    isScopeLimitCredential = false;
    signatureProvider = [CosPluginSignatureProvider makeWithSecretId:permanentSecretId secretKey:permanentSecretKey isScopeLimitCredential:isScopeLimitCredential];
    resolve(nil);
}

RCT_REMAP_METHOD(initWithScopeLimitCredentialCallback,
                 initWithScopeLimitCredentialCallbackWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    isScopeLimitCredential = true;
    signatureProvider = [CosPluginSignatureProvider makeWithSecretId:permanentSecretId secretKey:permanentSecretKey isScopeLimitCredential:isScopeLimitCredential];
    resolve(nil);
}

RCT_REMAP_METHOD(forceInvalidationCredential,
                 forceInvalidationCredentialWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    if(signatureProvider){
        [signatureProvider forceInvalidationCredential];
    }
    resolve(nil);
}

RCT_REMAP_METHOD(updateSessionCredential,
                 updateSessionCredential:(nonnull NSDictionary *)credential
                 stsScopesKey:(nullable NSString *)jsonifyScopes
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCredential* credentialNew = [QCloudCredential new];
    id tmpSecretId = [credential objectForKey:@"tmpSecretId"];
    if(tmpSecretId){
        credentialNew.secretID = tmpSecretId;
    }
    id tmpSecretKey = [credential objectForKey:@"tmpSecretKey"];
    if(tmpSecretKey){
        credentialNew.secretKey = tmpSecretKey;
    }
    id sessionToken = [credential objectForKey:@"sessionToken"];
    if(sessionToken){
        credentialNew.token = sessionToken;
    }
    id expiredTime = [credential objectForKey:@"expiredTime"];
    if(expiredTime){
        credentialNew.expirationDate = [NSDate dateWithTimeIntervalSince1970: [expiredTime doubleValue]];// 单位是秒
    }
    id startTime = [credential objectForKey:@"startTime"];
    if(startTime){
        credentialNew.startDate = [NSDate dateWithTimeIntervalSince1970: [startTime doubleValue]]; // 单位是秒
    }
    
    [signatureProvider setNewCredential: credentialNew jsonifyScopes:jsonifyScopes];
    
    resolve(nil);
}

RCT_REMAP_METHOD(registerDefaultService,
                 registerDefaultServiceConfig:(nonnull NSDictionary *)config
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    [QCloudCOSXMLService registerDefaultCOSXMLWithConfiguration: [self buildConfiguration: config]];
    resolve(nil);
}

RCT_REMAP_METHOD(registerDefaultTransferManger,
                 registerDefaultTransferMangerConfig:(nonnull NSDictionary *)config transferConfig:(nullable NSDictionary *)transferConfig
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    [QCloudCOSTransferMangerService registerDefaultCOSTransferMangerWithConfiguration: [self buildConfiguration: config]];
    if(transferConfig){
        [QCloudCOSTransferConfigCache() setObject:transferConfig forKey:QCloudCOS_DEFAULT_KEY];
    }
    resolve(nil);
}

RCT_REMAP_METHOD(registerService,
                 registerServiceKey:(nonnull NSString *)key config:(nonnull NSDictionary *)config
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    [QCloudCOSXMLService registerCOSXMLWithConfiguration: [self buildConfiguration: config] withKey: key];
    resolve(nil);
}

RCT_REMAP_METHOD(registerTransferManger,
                 registerTransferMangerKey:(nonnull NSString *)key config:(nonnull NSDictionary *)config transferConfig:(nullable NSDictionary *)transferConfig
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject){
    [QCloudCOSTransferMangerService registerCOSTransferMangerWithConfiguration: [self buildConfiguration: config] withKey: key];
    if(transferConfig){
        [QCloudCOSTransferConfigCache() setObject:transferConfig forKey:key];
    }
    resolve(nil);
}

RCT_REMAP_METHOD(setCloseBeacon,
                 setCloseBeaconIsCloseBeacon:(nonnull NSNumber *)isCloseBeacon
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    //iOS不支持关闭灯塔
    NSLog(@"iOS does not support");
    resolve(nil);
}

RCT_REMAP_METHOD(cancelAll,
                 cancelAllServiceKey:(nonnull NSString *)serviceKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    if([QCloudCOSXMLService hasCosxmlServiceForKey:serviceKey]){
        QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
        [[service sessionManager] cancelAllRequest];
    }
    
    if([QCloudCOSTransferMangerService hasTransferMangerServiceForKey:serviceKey]){
        QCloudCOSTransferMangerService * transferManger = [self getQCloudCOSTransferMangerService:serviceKey];
        [[transferManger sessionManager] cancelAllRequest];
    }
    resolve(nil);
}

RCT_REMAP_METHOD(deleteBucket,
                 deleteBucketServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudDeleteBucketRequest* request = [[QCloudDeleteBucketRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve(nil);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service DeleteBucket:request];
}

RCT_REMAP_METHOD(deleteObject,
                 deleteObjectServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath region:(nullable NSString *)region versionId:(nullable NSString *)versionId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudDeleteObjectRequest* request = [[QCloudDeleteObjectRequest alloc ] init];
    request.bucket = bucket;
    request.object = cosPath;
    if(region){
        request.regionName = region;
    }
    if(versionId){
        request.versionID = versionId;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve(nil);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service DeleteObject:request];
}

RCT_REMAP_METHOD(doesBucketExist,
                 doesBucketExistServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    resolve([NSNumber numberWithBool:[service doesBucketExist:bucket]]);
}

RCT_REMAP_METHOD(doesObjectExist,
                 doesObjectExistServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    resolve([NSNumber numberWithBool:[service doesObjectExistWithBucket:bucket object:cosPath]]);
}

RCT_REMAP_METHOD(getBucketAccelerate,
                 getBucketAccelerateServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetBucketAccelerateRequest* request = [[QCloudGetBucketAccelerateRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            bool b = [(QCloudBucketAccelerateConfiguration*)outputObject status] == QCloudCOSBucketAccelerateStatusEnabled;
            resolve([NSNumber numberWithBool:b]);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service GetBucketAccelerate:request];
}

RCT_REMAP_METHOD(getBucketLocation,
                 getBucketLocationServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetBucketLocationRequest* request = [[QCloudGetBucketLocationRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve([outputObject locationConstraint]);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service GetBucketLocation:request];
}

RCT_REMAP_METHOD(getBucket,
                 getBucketServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region prefix:(nullable NSString *)prefix delimiter:(nullable NSString *)delimiter encodingType:(nullable NSString *)encodingType marker:(nullable NSString *)marker maxKeys:(nullable NSString *)maxKeys
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetBucketRequest* request = [[QCloudGetBucketRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    if(prefix){
        request.prefix = prefix;
    }
    if(delimiter){
        request.delimiter = delimiter;
    }
    if(encodingType){
        request.encodingType = encodingType;
    }
    if(marker){
        request.marker = marker;
    }
    if(maxKeys){
        request.maxKeys = [maxKeys intValue];
    }
    [request setFinishBlock:^(QCloudListBucketResult * result, NSError* error) {
        if(error == nil){
            NSMutableArray<Content *> *contents = [NSMutableArray array];
            if(result.contents != nil && [result.contents count]>0){
                for(QCloudBucketContents *content in result.contents) {
                    [contents addObject:[Content makeWithKey:[content key] lastModified:[content lastModified] eTag:[content eTag] size:[NSNumber numberWithInteger:[content size]]
                                                       owner:[Owner makeWithId:[[content owner] identifier] disPlayName:[[content owner] displayName]]
                                                storageClass:QCloudCOSStorageClassTransferToString([content storageClass])]];
                }
            }
            NSMutableArray<CommonPrefixes *> *commonPrefixes = [NSMutableArray array];
            if(result.commonPrefixes != nil && [result.commonPrefixes count]>0){
                for(QCloudCommonPrefixes *commonPrefixe in result.commonPrefixes) {
                    [commonPrefixes addObject:[CommonPrefixes makeWithPrefix:[commonPrefixe prefix]]];
                }
            }
            BucketContents *bucketContents = [BucketContents makeWithName:[result name] encodingType:encodingType prefix:[result prefix] marker:[result marker] maxKeys:[NSNumber numberWithInt:[result maxKeys]] isTruncated:[NSNumber numberWithBool:[result isTruncated]] nextMarker:[result nextMarker] contentsList:contents commonPrefixesList:commonPrefixes delimiter:[result delimiter]];
            resolve([bucketContents qcloud_modelToJSONString]);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service GetBucket:request];
}

RCT_REMAP_METHOD(getBucketVersioning,
                 getBucketVersioningServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetBucketVersioningRequest* request = [[QCloudGetBucketVersioningRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            bool b = [(QCloudBucketVersioningConfiguration*)outputObject status] == QCloudCOSBucketVersioningStatusEnabled;
            resolve([NSNumber numberWithBool:b]);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service GetBucketVersioning:request];
}

RCT_REMAP_METHOD(getObjectUrl,
                 getObjectUrlServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket key:(nonnull NSString *)key region:(nonnull NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    resolve([service getURLWithBucket:bucket object:key withAuthorization:false regionName:region]);
}

RCT_REMAP_METHOD(getPresignedUrl,
                 getPresignedUrlServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath signValidTime:(nullable NSString *)signValidTime
                 signHost:(nullable NSString *)signHost parameters:(nullable NSDictionary *)parameters region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetPresignedURLRequest* getPresignedURLRequest = [[QCloudGetPresignedURLRequest alloc] init];

    // 存储桶名称，由BucketName-Appid 组成，可以在COS控制台查看 https://console.cloud.tencent.com/cos5/bucket
    getPresignedURLRequest.bucket = bucket;
    // 对象键，是对象在 COS 上的完整路径，如果带目录的话，格式为 "video/xxx/movie.mp4"
    getPresignedURLRequest.object = cosPath;
    getPresignedURLRequest.HTTPMethod = @"GET";

    if(signValidTime){
        getPresignedURLRequest.expires = [NSDate dateWithTimeIntervalSinceNow:[signValidTime intValue]];
    }
    
    if(signHost){
        // 获取预签名函数，默认签入Header Host；您也可以选择不签入Header Host，但可能导致请求失败或安全漏洞
        getPresignedURLRequest.signHost = [signHost boolValue];
    }
    
    if(parameters){
        // http 请求参数，传入的请求参数需与实际请求相同，能够防止用户篡改此HTTP请求的参数
        for (NSString *parametersKey in parameters) {
            [getPresignedURLRequest setValue:[parameters objectForKey:parametersKey] forRequestParameter:parametersKey];
        }
    }

    if(region){
        getPresignedURLRequest.regionName = region;
    }

    [getPresignedURLRequest setFinishBlock:^(QCloudGetPresignedURLResult * _Nonnull result,
                                             NSError * _Nonnull error) {
        if(error == nil){
            // 预签名 URL
            resolve(result.presienedURL);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];

    [service getPresignedURL:getPresignedURLRequest];
}

RCT_REMAP_METHOD(getService,
                 getServiceServiceKey:(nonnull NSString *)serviceKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudGetServiceRequest* request = [[QCloudGetServiceRequest alloc ] init];
    [request setFinishBlock:^(QCloudListAllMyBucketsResult* result, NSError* error) {
        if(error == nil){
            NSMutableArray<Bucket *> *buckets = [NSMutableArray array];
            if(result.buckets != nil && [result.buckets count]>0){
                for(QCloudBucket *bucket in result.buckets) {
                    [buckets addObject:[Bucket makeWithName:[bucket name] location:[bucket location] createDate:[bucket createDate] type:[bucket type]]];
                }
            }
            ListAllMyBuckets *listAllMyBuckets = [ListAllMyBuckets makeWithOwner:[Owner makeWithId:[[result owner] identifier] disPlayName:[[result owner] displayName]]
                                                                         buckets:buckets];
            resolve([listAllMyBuckets qcloud_modelToJSONString]);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service GetService:request];
}

RCT_REMAP_METHOD(headBucket,
                 headBucketServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudHeadBucketRequest* request = [[QCloudHeadBucketRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            NSDictionary* headerAll = [[outputObject __originHTTPURLResponse__] allHeaderFields];
            NSMutableDictionary* resultDictionary = [NSMutableDictionary new];
            for (NSString *key in headerAll) {
                [resultDictionary setObject:[headerAll objectForKey:key] forKey:[key lowercaseString]];
            }
            resolve(resultDictionary);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service HeadBucket:request];
}

RCT_REMAP_METHOD(headObject,
                 headObjectServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath region:(nullable NSString *)region versionId:(nullable NSString *)versionId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudHeadObjectRequest* request = [[QCloudHeadObjectRequest alloc ] init];
    request.bucket = bucket;
    request.object = cosPath;
    if(region){
        request.regionName = region;
    }
    if(versionId){
        request.versionID = versionId;
    }
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            NSDictionary* headerAll = [[outputObject __originHTTPURLResponse__] allHeaderFields];
            NSMutableDictionary* resultDictionary = [NSMutableDictionary new];
            for (NSString *key in headerAll) {
                [resultDictionary setObject:[headerAll objectForKey:key] forKey:[key lowercaseString]];
            }
            resolve(resultDictionary);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service HeadObject:request];
}

RCT_REMAP_METHOD(preBuildConnection,
                 preBuildConnectionServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    //iOS不支持预连接
    NSLog(@"iOS does not support");
    resolve(nil);
}

RCT_REMAP_METHOD(putBucketAccelerate,
                 putBucketAccelerateServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region enable:(nonnull NSNumber *)enable
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudPutBucketAccelerateRequest* request = [[QCloudPutBucketAccelerateRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    QCloudBucketAccelerateConfiguration* configuration = [[QCloudBucketAccelerateConfiguration alloc ] init];
    BOOL enableB = [enable boolValue];
    if(enableB){
        configuration.status = QCloudCOSBucketAccelerateStatusEnabled;
    } else {
        configuration.status = QCloudCOSBucketAccelerateStatusSuspended;
    }
    request.configuration = configuration;
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve(nil);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service PutBucketAccelerate:request];
}

RCT_REMAP_METHOD(putBucket,
                 putBucketServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region enableMAZ:(nullable NSString *)enableMAZ cosacl:(nullable NSString *)cosacl readAccount:(nullable NSString *)readAccount writeAccount:(nullable NSString *)writeAccount readWriteAccount:(nullable NSString *)readWriteAccount
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudPutBucketRequest* request = [[QCloudPutBucketRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    if(cosacl){
        request.accessControlList = cosacl;
    }
    if(readAccount){
        request.grantRead = readAccount;
    }
    if(writeAccount){
        request.grantWrite =writeAccount;
    }
    if(readWriteAccount){
        request.grantFullControl = readWriteAccount;
    }
    BOOL enableMAZB = [enableMAZ boolValue];
    if(enableMAZB){
        QCloudCreateBucketConfiguration* configuration = [[QCloudCreateBucketConfiguration alloc ] init];
        configuration.bucketAZConfig = @"MAZ";
        request.createBucketConfiguration = configuration;
    }
    
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve(nil);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service PutBucket:request];
}

RCT_REMAP_METHOD(putBucketVersioning,
                 putBucketVersioningServiceKey:(nonnull NSString *)serviceKey bucket:(nonnull NSString *)bucket region:(nullable NSString *)region enable:(nonnull NSNumber *)enable
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    QCloudCOSXMLService * service = [self getQCloudCOSXMLService:serviceKey];
    QCloudPutBucketVersioningRequest* request = [[QCloudPutBucketVersioningRequest alloc ] init];
    request.bucket = bucket;
    if(region){
        request.regionName = region;
    }
    QCloudBucketVersioningConfiguration* configuration = [[QCloudBucketVersioningConfiguration alloc ] init];
    BOOL enableB = [enable boolValue];
    if(enableB){
        configuration.status = QCloudCOSBucketVersioningStatusEnabled;
    } else {
        configuration.status = QCloudCOSBucketVersioningStatusSuspended;
    }
    request.configuration = configuration;
    [request setFinishBlock:^(id outputObject,NSError*error) {
        if(outputObject){
            resolve(nil);
        } else {
            [self rejectError:error withRejecter:reject];
        }
    }];
    [service PutBucketVersioning:request];
}

RCT_REMAP_METHOD(download,
                 downloadTransferKey:(nonnull NSString *)transferKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath savePath:(nonnull NSString *)savePath resultCallbackKey:(nullable NSString *)resultCallbackKey stateCallbackKey:(nullable NSString *)stateCallbackKey progressCallbackKey:(nullable NSString *)progressCallbackKey versionId:(nullable NSString *)versionId trafficLimit:(nullable NSString *)trafficLimit region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([self downloadInternalTransferKey:transferKey
                                      bucket:bucket
                                     cosPath:cosPath
                                    savePath:savePath
                           resultCallbackKey:resultCallbackKey
                            stateCallbackKey:stateCallbackKey
                         progressCallbackKey:progressCallbackKey
                                    versionId:versionId
                                 trafficLimit:trafficLimit
                                       region:region
                                     taskKey:nil]);
}

- (nullable NSString *)downloadInternalTransferKey:(nonnull NSString *)transferKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath savePath:(nonnull NSString *)savePath resultCallbackKey:(nullable NSString *)resultCallbackKey stateCallbackKey:(nullable NSString *)stateCallbackKey progressCallbackKey:(nullable NSString *)progressCallbackKey versionId:(nullable NSString *)versionId trafficLimit:(nullable NSString *)trafficLimit region:(nullable NSString *)region taskKey:(nullable NSString *)taskKey {
    QCloudCOSTransferMangerService * transferManger = [self getQCloudCOSTransferMangerService:transferKey];
    QCloudCOSXMLDownloadObjectRequest *getObjectRequest = [[QCloudCOSXMLDownloadObjectRequest alloc] init];
    //支持断点下载
    getObjectRequest.resumableDownload = true;
    getObjectRequest.bucket = bucket;
    getObjectRequest.object = cosPath;
    getObjectRequest.downloadingURL = [NSURL fileURLWithPath:savePath];
    if(region){
        getObjectRequest.regionName = region;
    }
    if(versionId){
        getObjectRequest.versionID = versionId;
    }
    if(trafficLimit){
        getObjectRequest.trafficLimit = [trafficLimit integerValue];
    }
    
    long long saveFileSize = [self fileSizeAtPath:savePath];
    getObjectRequest.localDownloaded = [NSNumber numberWithLongLong:saveFileSize];
    
    getObjectRequest.resultCallbackKey = resultCallbackKey;
    getObjectRequest.progressCallbackKey = progressCallbackKey;
    getObjectRequest.stateCallbackKey = stateCallbackKey;
    
    if(taskKey == nil){
        taskKey = [NSString stringWithFormat: @"download-%@", [NSNumber numberWithUnsignedInteger:[getObjectRequest hash]]];
    }
    // 监听下载结果
    [getObjectRequest setFinishBlock:^(id outputObject, NSError *error) {
        if(error != nil && [error code] == QCloudNetworkErrorCodeCanceled){
            return;
        }
        
        if(error == nil){
            [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_COMPLETED];
        } else {
            [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_FAILED];
        }
        
        if(resultCallbackKey){
            if(error == nil){
                NSDictionary* headerAll = [[outputObject __originHTTPURLResponse__] allHeaderFields];
                NSMutableDictionary* resultDictionary = [NSMutableDictionary new];
                for (NSString *key in headerAll) {
                    [resultDictionary setObject:[headerAll objectForKey:key] forKey:[key lowercaseString]];
                }
                [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                                  userInfo:@{@"eventName":COS_EMITTER_RESULT_SUCCESS_CALLBACK,
                                                                             @"eventBody":@{
                                                                                 @"transferKey": transferKey, @"callbackKey":resultCallbackKey, @"headers":resultDictionary
                                                                             }}];
            } else {
                [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                                  userInfo:@{@"eventName":COS_EMITTER_RESULT_FAIL_CALLBACK,
                                                                             @"eventBody":@{
                                                                                 @"transferKey": transferKey,
                                                                                 @"callbackKey":resultCallbackKey,
                                                                                 @"clientException":[self buildClientException:error],
                                                                                 @"serviceException":[self buildServiceException:error]
                                                                             }}];
            }
        }
        [QCloudCOSTaskCache() removeObject:taskKey];
        [QCloudCOSTaskStateCache() removeObject:[NSString stringWithFormat: @"%@-%@", transferKey, stateCallbackKey]];
    }];
    
    // 监听下载进度
    [getObjectRequest setDownProcessBlock:^(int64_t bytesDownload,
                                            int64_t totalBytesDownload,
                                            int64_t totalBytesExpectedToDownload) {
        [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_IN_PROGRESS];
        if(progressCallbackKey){
            [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                              userInfo:@{@"eventName":COS_EMITTER_PROGRESS_CALLBACK,
                                                                         @"eventBody":@{
                                                                             @"transferKey": transferKey,
                                                                             @"callbackKey":progressCallbackKey,
                                                                             @"complete":[NSNumber numberWithLongLong:((long long)totalBytesDownload + [getObjectRequest.localDownloaded longLongValue])],
                                                                             @"target":[NSNumber numberWithLongLong:((long long)totalBytesExpectedToDownload + [getObjectRequest.localDownloaded longLongValue])]
                                                                         }}];
        }
    }];
    
    [transferManger DownloadObject:getObjectRequest];
    [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_WAITING];
    
    [QCloudCOSTaskCache() setObject:getObjectRequest forKey:taskKey];
    return taskKey;
}

RCT_REMAP_METHOD(pause,
                 pauseTransferKey:(nonnull NSString *)transferKey taskId:(nonnull NSString *)taskId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    if([taskId hasPrefix:@"upload-"]){
        QCloudCOSXMLUploadObjectRequest* put = [QCloudCOSTaskCache() objectForKey:taskId];
        if(put == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        NSError *error;
        put.resmeData = [put cancelByProductingResumeData:&error];
        [self stateCallback:transferKey stateCallbackKey:[put stateCallbackKey] state:QCloudCOS_STATE_PAUSED];
        resolve(nil);
    } else if ([taskId hasPrefix:@"download-"]){
        QCloudCOSXMLDownloadObjectRequest* request = [QCloudCOSTaskCache() objectForKey:taskId];
        if(request == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        [request cancel];
        [self stateCallback:transferKey stateCallbackKey:[request stateCallbackKey] state:QCloudCOS_STATE_PAUSED];
        resolve(nil);
    }
}

RCT_REMAP_METHOD(resume,
                 resumeTransferKey:(nonnull NSString *)transferKey taskId:(nonnull NSString *)taskId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    if([taskId hasPrefix:@"upload-"]){
        QCloudCOSXMLUploadObjectRequest* put = [QCloudCOSTaskCache() objectForKey:taskId];
        if(put == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        [self uploadInternalTransferKey:transferKey
                              resmeData:[put resmeData]
                         bucket:[put bucket]
                        cosPath:[put object]
                       fileUri:nil
                       uploadId:[put valueForKey:@"uploadId"]
              resultCallbackKey:[put resultCallbackKey]
               stateCallbackKey:[put stateCallbackKey]
            progressCallbackKey:[put progressCallbackKey]
  initMultipleUploadCallbackKey:[put iinitMultipleUploadCallbackKey]
                           stroageClass:QCloudCOSStorageClassTransferToString([put storageClass])
                           trafficLimit:[NSString stringWithFormat: @"%ld", [put trafficLimit]]
                                 region:[put regionName]
                        taskKey:taskId];
        [self stateCallback:transferKey stateCallbackKey:[put stateCallbackKey] state:QCloudCOS_STATE_RESUMED_WAITING];
        resolve(nil);
    } else if ([taskId hasPrefix:@"download-"]){
        QCloudCOSXMLDownloadObjectRequest* request = [QCloudCOSTaskCache() objectForKey:taskId];
        if(request == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        [self downloadInternalTransferKey:transferKey
                           bucket:[request bucket]
                          cosPath:[request object]
                         savePath:[[[request downloadingURL] filePathURL] path]
                resultCallbackKey:[request resultCallbackKey]
                 stateCallbackKey:[request stateCallbackKey]
              progressCallbackKey:[request progressCallbackKey]
                                versionId:[request versionID]
                             trafficLimit:[NSString stringWithFormat: @"%ld", [request trafficLimit]]
                                   region:[request regionName]
                          taskKey:taskId];
        [self stateCallback:transferKey stateCallbackKey:[request stateCallbackKey] state:QCloudCOS_STATE_RESUMED_WAITING];
        resolve(nil);
    }
}

RCT_REMAP_METHOD(cancel,
                 cancelTransferKey:(nonnull NSString *)transferKey taskId:(nonnull NSString *)taskId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    if([taskId hasPrefix:@"upload-"]){
        QCloudCOSXMLUploadObjectRequest* put = [QCloudCOSTaskCache() objectForKey:taskId];
        if(put == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        [put abort:^(id outputObject, NSError *error) {}];
        [self stateCallback:transferKey stateCallbackKey:[put stateCallbackKey] state:QCloudCOS_STATE_CANCELED];
        [QCloudCOSTaskStateCache() removeObject:[NSString stringWithFormat: @"%@-%@", transferKey, [put stateCallbackKey]]];
    } else if ([taskId hasPrefix:@"download-"]){
        QCloudCOSXMLDownloadObjectRequest* request = [QCloudCOSTaskCache() objectForKey:taskId];
        if(request == nil) {
            NSLog(@"%@ request canceled or ended", taskId);
            resolve(nil);
            return;
        }
        [request cancel];
        [self stateCallback:transferKey stateCallbackKey:[request stateCallbackKey] state:QCloudCOS_STATE_CANCELED];
        [QCloudCOSTaskStateCache() removeObject:[NSString stringWithFormat: @"%@-%@", transferKey, [request stateCallbackKey]]];
    }
    [QCloudCOSTaskCache() removeObject:taskId];
    resolve(nil);
}

RCT_REMAP_METHOD(upload,
                 uploadTransferKey:(nonnull NSString *)transferKey bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath fileUri:(nonnull NSString *)fileUri uploadId:(nullable NSString *)uploadId resultCallbackKey:(nullable NSString *)resultCallbackKey stateCallbackKey:(nullable NSString *)stateCallbackKey progressCallbackKey:(nullable NSString *)progressCallbackKey initMultipleUploadCallbackKey:(nullable NSString *)initMultipleUploadCallbackKey stroageClass:(nullable NSString *)stroageClass trafficLimit:(nullable NSString *)trafficLimit region:(nullable NSString *)region
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([self uploadInternalTransferKey:transferKey
                                  resmeData:nil
                                     bucket:bucket
                                    cosPath:cosPath
                                   fileUri:fileUri
                                   uploadId:uploadId
                          resultCallbackKey:resultCallbackKey
                           stateCallbackKey:stateCallbackKey
                        progressCallbackKey:progressCallbackKey
              initMultipleUploadCallbackKey:initMultipleUploadCallbackKey
                               stroageClass:stroageClass
                               trafficLimit:trafficLimit
                                     region:region
                                    taskKey:nil]);
}

- (nullable NSString *)uploadInternalTransferKey:(nonnull NSString *)transferKey resmeData:(nullable NSData *)resmeData bucket:(nonnull NSString *)bucket cosPath:(nonnull NSString *)cosPath fileUri:(nullable NSString *)fileUri  uploadId:(nullable NSString *)uploadId resultCallbackKey:(nullable NSString *)resultCallbackKey stateCallbackKey:(nullable NSString *)stateCallbackKey progressCallbackKey:(nullable NSString *)progressCallbackKey  initMultipleUploadCallbackKey:(nullable NSString *)initMultipleUploadCallbackKey stroageClass:(nullable NSString *)stroageClass trafficLimit:(nullable NSString *)trafficLimit region:(nullable NSString *)region taskKey:(nullable NSString *)taskKey {
    QCloudCOSTransferMangerService * transferManger = [self getQCloudCOSTransferMangerService:transferKey];
    QCloudCOSXMLUploadObjectRequest* put = nil;
    if(resmeData == nil){
        put = [QCloudCOSXMLUploadObjectRequest new];
        put.bucket = bucket;
        put.object = cosPath;
        if(region){
            put.regionName = region;
        }
        if(uploadId){
            [put setValue:uploadId forKey:@"uploadId"];
        }
        if(stroageClass){
            put.storageClass = QCloudCOSStorageClassDumpFromString(stroageClass);
        }
        if(trafficLimit){
            put.trafficLimit = [trafficLimit integerValue];
        }
        // 需要上传的对象内容。可以传入NSData*或者NSURL*类型的变量
        if(fileUri){
            if ([fileUri hasPrefix:@"file:///"]) {
                put.body = [NSURL URLWithString:fileUri];
            }
            else {
                put.body = [NSURL fileURLWithPath:fileUri];
            }
        }

        put.resultCallbackKey = resultCallbackKey;
        put.progressCallbackKey = progressCallbackKey;
        put.stateCallbackKey = stateCallbackKey;
        put.iinitMultipleUploadCallbackKey = initMultipleUploadCallbackKey;
        
        NSDictionary *transferConfig = [QCloudCOSTransferConfigCache() objectForKey:transferKey];
        if(nil != transferConfig){
            id sliceSizeForUpload = [transferConfig objectForKey:@"sliceSizeForUpload"];
            if(sliceSizeForUpload){
                put.sliceSize = [sliceSizeForUpload integerValue];
            }
            id divisionForUpload = [transferConfig objectForKey:@"divisionForUpload"];
            if(divisionForUpload){
                put.mutilThreshold = [divisionForUpload integerValue];
            }
            id enableVerification = [transferConfig objectForKey:@"enableVerification"];
            if(enableVerification){
                put.enableVerification = [enableVerification boolValue];
            }
            //不支持强制简单上传
        }
    } else{
        put = [QCloudCOSXMLUploadObjectRequest requestWithRequestData:resmeData];
        put.resultCallbackKey = resultCallbackKey;
        put.progressCallbackKey = progressCallbackKey;
        put.stateCallbackKey = stateCallbackKey;
        put.iinitMultipleUploadCallbackKey = initMultipleUploadCallbackKey;
    }
    
    // 监听上传进度
    [put setSendProcessBlock:^(int64_t bytesSent,
                               int64_t totalBytesSent,
                               int64_t totalBytesExpectedToSend) {
        [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_IN_PROGRESS];
        if(progressCallbackKey){
            [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                              userInfo:@{@"eventName":COS_EMITTER_PROGRESS_CALLBACK,
                                                                         @"eventBody":@{
                                                                             @"transferKey": transferKey,
                                                                             @"callbackKey":progressCallbackKey,
                                                                             @"complete":[NSNumber numberWithLongLong:(long long)totalBytesSent],
                                                                             @"target":[NSNumber numberWithLongLong:(long long)totalBytesExpectedToSend]
                                                                         }}];
        }
    }];
    if(taskKey == nil){
        taskKey = [NSString stringWithFormat: @"upload-%@", [NSNumber numberWithUnsignedInteger:[put hash]]];
    }
    // 监听上传结果
    [put setFinishBlock:^(QCloudUploadObjectResult *result, NSError *error) {
        if(error != nil && [error code] == QCloudNetworkErrorCodeCanceled){
            return;
        }
        
        if(error == nil){
            [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_COMPLETED];
        } else {
            [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_FAILED];
        }
        
        if(resultCallbackKey){
            if(error == nil){
                NSDictionary* headerAll = [[result __originHTTPURLResponse__] allHeaderFields];
                NSMutableDictionary* resultDictionary = [NSMutableDictionary new];
                NSString* encodedAccessUrl = [result.location stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
                [resultDictionary setObject:encodedAccessUrl forKey:@"accessUrl"];
                [resultDictionary setObject:result.eTag forKey:@"eTag"];
                NSString* crc64ecma = [headerAll objectForKey: @"x-cos-hash-crc64ecma"];
                if(crc64ecma){
                    [resultDictionary setObject:crc64ecma forKey:@"crc64ecma"];
                }
                [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                                  userInfo:@{@"eventName":COS_EMITTER_RESULT_SUCCESS_CALLBACK,
                                                                             @"eventBody":@{
                                                                                 @"transferKey": transferKey, @"callbackKey":resultCallbackKey, @"headers":resultDictionary
                                                                             }}];
            } else {
                [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                                  userInfo:@{@"eventName":COS_EMITTER_RESULT_FAIL_CALLBACK,
                                                                             @"eventBody":@{
                                                                                 @"transferKey": transferKey,
                                                                                 @"callbackKey":resultCallbackKey,
                                                                                 @"clientException":[self buildClientException:error],
                                                                                 @"serviceException":[self buildServiceException:error]
                                                                             }}];
            }
        }
        [QCloudCOSTaskCache() removeObject:taskKey];
        [QCloudCOSTaskStateCache() removeObject:[NSString stringWithFormat: @"%@-%@", transferKey, stateCallbackKey]];
    }];
    [put setInitMultipleUploadFinishBlock:^(QCloudInitiateMultipartUploadResult *
                                            multipleUploadInitResult,
                                            QCloudCOSXMLUploadObjectResumeData resumeData) {
        if(initMultipleUploadCallbackKey){
            [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                              userInfo:@{@"eventName":COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK,
                                                                         @"eventBody":@{
                                                                             @"transferKey": transferKey,
                                                                             @"callbackKey":initMultipleUploadCallbackKey,
                                                                             @"bucket":multipleUploadInitResult.bucket,
                                                                             @"key":multipleUploadInitResult.key,
                                                                             @"uploadId":multipleUploadInitResult.uploadId
                                                                         }}];
        }
    }];
    [transferManger UploadObject:put];
    [self stateCallback:transferKey stateCallbackKey:stateCallbackKey state:QCloudCOS_STATE_WAITING];
    
    [QCloudCOSTaskCache() setObject:put forKey:taskKey];
    return taskKey;
}

- (nullable CosXmlClientException *)buildClientException:(nonnull NSError *) error {
    if([[self errorType:error] isEqualToString:@"Client"]){
        NSDictionary *userinfoDic = error.userInfo;
        NSString *details = @"";
        NSString * message = @"";
        if (userinfoDic) {
            message = userinfoDic[NSLocalizedDescriptionKey];
            details = [userinfoDic qcloud_modelToJSONString];
        }
        return [CosXmlClientException makeWithErrorCode:[NSNumber numberWithInteger:error.code] message:message details:details];
    } else {
        return nil;
    }
}
- (nullable CosXmlServiceException *)buildServiceException:(nonnull NSError *) error {
    if([[self errorType:error] isEqualToString:@"Server"]){
        NSDictionary *userinfoDic = error.userInfo;
        NSString *details = @"";
        NSString *errorCode = [NSError qcloud_networkErrorCodeTransferToString:(QCloudNetworkErrorCode)error.code];
        if([errorCode isEqualToString:@""]){
            errorCode = [@(error.code) stringValue];
        }
        NSString *requestID = @"";
        NSString *resource = @"";
        NSString *errorMsg = userinfoDic[NSLocalizedDescriptionKey];
        if (userinfoDic) {
            details = [userinfoDic qcloud_modelToJSONString];
            if (userinfoDic[@"Code"]) {
                errorCode = userinfoDic[@"Code"];
                requestID = userinfoDic[@"RequestId"];
                resource = userinfoDic[@"Resource"];
                errorMsg = userinfoDic[@"Message"];
            }
        }
        return [CosXmlServiceException makeWithStatusCode:[NSNumber numberWithInteger:error.code] httpMsg:@"" requestId:requestID?requestID : @"" errorCode:errorCode ? errorCode : @"" errorMessage:errorMsg?errorMsg:@"" serviceName:resource?resource:@"" details:details];
    } else {
        return nil;
    }
}

-(void)rejectError:(nonnull NSError *) error withRejecter:(RCTPromiseRejectBlock)reject{
    NSDictionary *userinfoDic = error.userInfo;
    NSString *details = @"";
    NSString *errorCode = [NSError qcloud_networkErrorCodeTransferToString: (QCloudNetworkErrorCode)error.code];
    if([errorCode isEqualToString:@""]){
        errorCode = [@(error.code) stringValue];
    }
    NSString *errorMsg = userinfoDic[NSLocalizedDescriptionKey];
    if (userinfoDic) {
        details = [userinfoDic qcloud_modelToJSONString];
        if (userinfoDic[@"Code"]) {
            errorCode = userinfoDic[@"Code"];
            errorMsg = userinfoDic[@"Message"];
        }
    }
    reject(errorCode, errorMsg, error);
}


-(NSString *)errorType:(nonnull NSError *) error{
    NSDictionary *userinfoDic = error.userInfo;
    NSString *errorCode = [NSError qcloud_networkErrorCodeTransferToString:(QCloudNetworkErrorCode)error.code];
    NSString *requestID = @"";
    NSString *error_name = @"Client";
    NSString *errorMsg = userinfoDic[NSLocalizedDescriptionKey];
    if (userinfoDic) {
        if (userinfoDic[@"Code"]) {
            errorCode = userinfoDic[@"Code"];
            requestID = userinfoDic[@"RequestId"];
            error_name = @"Server";
            errorMsg = userinfoDic[@"Message"];
        }
    }
    if([error.domain isEqualToString:kQCloudNetworkDomain] && error.code == QCloudNetworkErrorCodeResponseDataTypeInvalid){
        error_name = @"Server";
    }
    
    return error_name;
}

-(void)stateCallback:(nonnull NSString *)transferKey stateCallbackKey:(nullable NSString *)stateCallbackKey state:(nullable NSString *)state{
    if(stateCallbackKey){
        NSString * stateCache = [QCloudCOSTaskStateCache() objectForKey:[NSString stringWithFormat: @"%@-%@", transferKey, stateCallbackKey]];
        if(stateCache != state) {
            [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                              userInfo:@{@"eventName":COS_EMITTER_STATE_CALLBACK,
                                                                         @"eventBody":@{
                                                                             @"transferKey": transferKey, @"callbackKey":stateCallbackKey, @"state":state
                                                                         }}];
            [QCloudCOSTaskStateCache() setObject:state forKey:[NSString stringWithFormat: @"%@-%@", transferKey, stateCallbackKey]];
        }
    }
}

- (long long) fileSizeAtPath:(NSString*) filePath{

    NSFileManager* manager = [NSFileManager defaultManager];
    if ([manager fileExistsAtPath:filePath]){
        return [[manager attributesOfItemAtPath:filePath error:nil] fileSize];
    }
    return 0;
}

RCT_EXPORT_METHOD(addListener : (NSString *)eventName) {
  // Keep: Required for RN built in Event Emitter Calls.
}

RCT_EXPORT_METHOD(removeListeners : (NSInteger)count) {
  // Keep: Required for RN built in Event Emitter Calls.
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeQCloudCosReactNativeSpecJSI>(params);
}
#endif

@end
