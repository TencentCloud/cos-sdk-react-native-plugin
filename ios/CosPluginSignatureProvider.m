//
//  CosPluginSignatureProvider.m
//  cos
//
//  Created by jordanqin on 2022/12/8.
//

#import "CosPluginSignatureProvider.h"
#import "pigeon.h"
#import <QCloudCOSXML/QCloudCOSXML.h>
#import "CosEventEmitter.h"

@interface CosPluginSignatureProvider ()
{
    QCloudCredentailFenceQueueContinue _fenceQueueContinueBlock;
}
@end

@implementation CosPluginSignatureProvider

- (QCloudThreadSafeMutableDictionary *) UrlRequstCache {
    static QCloudThreadSafeMutableDictionary *CloudCOSTask = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CloudCOSTask = [QCloudThreadSafeMutableDictionary new];
    });
    return CloudCOSTask;
}
- (QCloudThreadSafeMutableDictionary *) AuthentationContinueBlocksCache {
    static QCloudThreadSafeMutableDictionary *CloudCOSTask = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        CloudCOSTask = [QCloudThreadSafeMutableDictionary new];
    });
    return CloudCOSTask;
}


+ (instancetype)makeWithSecretId:(nullable NSString *)secretId
                            secretKey:(nullable NSString *)secretKey
               isScopeLimitCredential:(bool)isScopeLimitCredential{
    CosPluginSignatureProvider* cosPluginSignatureProvider = [[CosPluginSignatureProvider alloc] init];
    cosPluginSignatureProvider.secretId = secretId;
    cosPluginSignatureProvider.secretKey = secretKey;
    cosPluginSignatureProvider.isScopeLimitCredential = isScopeLimitCredential;
    
    // 初始化临时密钥脚手架
    cosPluginSignatureProvider.credentialFenceQueue = [QCloudCredentailFenceQueue new];
    cosPluginSignatureProvider.credentialFenceQueue.delegate = cosPluginSignatureProvider;
        
    return cosPluginSignatureProvider;
}

- (void)setNewCredential:(QCloudCredential *)credential jsonifyScopes:(nullable NSString *)jsonifyScopes{
    QCloudAuthentationV5Creator* creator = [[QCloudAuthentationV5Creator alloc]
                                            initWithCredential:credential];
    if(jsonifyScopes){
        NSMutableArray *continueBlocks = [[self AuthentationContinueBlocksCache] objectForKey:jsonifyScopes];
        if(continueBlocks == nil){
            return;
        }
        NSMutableArray *urlRequsts = [[self UrlRequstCache] objectForKey:jsonifyScopes];
        if(urlRequsts == nil){
            return;
        }
        
        for (int i = 0; i < [continueBlocks count]; i++) {
            QCloudHTTPAuthentationContinueBlock continueBlock = [continueBlocks objectAtIndex:i];
            NSMutableURLRequest* urlRequest = [urlRequsts objectAtIndex:i];
            
            if(continueBlock && urlRequest){
                QCloudSignature* signature =  [creator signatureForData:urlRequest];
                continueBlock(signature, nil);
                
                [continueBlocks removeObjectAtIndex:i];
                [urlRequsts removeObjectAtIndex:i];
            }
        }
    } else {
        if(_fenceQueueContinueBlock){
            _fenceQueueContinueBlock(creator, nil);
        }
    }
}

- (void)signatureWithFields:(QCloudSignatureFields *)fileds request:(QCloudBizHTTPRequest *)request urlRequest:(NSMutableURLRequest *)urlRequst compelete:(QCloudHTTPAuthentationContinueBlock)continueBlock {
    // 永久秘钥
    if(self.secretId != nil && self.secretKey != nil && ![@"" isEqualToString:self.secretId] && ![@"" isEqualToString:self.secretKey]){
        QCloudCredential* credential = [QCloudCredential new];
        // 永久密钥 secretID
        // sercret_id替换为用户的 SecretId，登录访问管理控制台查看密钥，https://console.cloud.tencent.com/cam/capi
        credential.secretID = self.secretId;
        // 永久密钥 SecretKey
        // sercret_key替换为用户的 SecretKey，登录访问管理控制台查看密钥，https://console.cloud.tencent.com/cam/capi
        credential.secretKey = self.secretKey;
        // 使用永久密钥计算签名
        QCloudAuthentationV5Creator* creator = [[QCloudAuthentationV5Creator alloc]
                                                initWithCredential:credential];
        QCloudSignature* signature =  [creator signatureForData:urlRequst];
        continueBlock(signature, nil);
        return;
    }
    
    // 临时秘钥
    if(self.isScopeLimitCredential){
        NSArray<STSCredentialScope *> * stsScopesArray = [self convertSTSCredentialScope:[request scopesArray]];
        
        // QCloudGetPresignedURLRequest特殊处理，原生没有返回scopesArray
        if([request isMemberOfClass:[QCloudGetPresignedURLRequest class]]){
            QCloudGetPresignedURLRequest * getPresignedURLRequest = (QCloudGetPresignedURLRequest *)request;
            NSMutableArray<STSCredentialScope *> *array = [NSMutableArray array];
            NSString * region = getPresignedURLRequest.runOnService.configuration.endpoint.regionName;
            if([getPresignedURLRequest regionName]){
                region = [getPresignedURLRequest regionName];
            }
            [array addObject:[STSCredentialScope makeWithAction:@"name/cos:GetObject"
                                                         region:region
                                                         bucket:[getPresignedURLRequest bucket]
                                                         prefix:[getPresignedURLRequest object]
            ]];
            stsScopesArray = array;
        }
        // QCloudGetBucketRequest特殊处理，原生返回的scopesArray有bug
        if([request isMemberOfClass:[QCloudGetBucketRequest class]]){
            QCloudGetBucketRequest * getBucketRequest = (QCloudGetBucketRequest *)request;
            if([getBucketRequest prefix] == nil || [getBucketRequest prefix] == NULL){
                stsScopesArray[0].prefix = @"";
            } else {
                stsScopesArray[0].prefix = [getBucketRequest prefix];
            }
        }
        
        // 保存需要签名的request和回调
        NSString* jsonifyScopes = [self jsonifyScopes:stsScopesArray];
        
        NSMutableArray *continueBlocks = [[self AuthentationContinueBlocksCache] objectForKey:jsonifyScopes];
        if(continueBlocks == nil){
            continueBlocks = [NSMutableArray array];
        }
        [continueBlocks addObject:continueBlock];
        [[self AuthentationContinueBlocksCache] setObject:continueBlocks forKey:jsonifyScopes];
        
        NSMutableArray *urlRequests = [[self UrlRequstCache] objectForKey:jsonifyScopes];
        if(urlRequests == nil){
            urlRequests = [NSMutableArray array];
        }
        [urlRequests addObject:urlRequst];
        [[self UrlRequstCache] setObject:urlRequests forKey:jsonifyScopes];
        
        [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil
                                                          userInfo:@{@"eventName":COS_EMITTER_UPDATE_SESSION_CREDENTIAL,
                                                                     @"eventBody":@{
                                                                         @"stsScopesArrayJson":jsonifyScopes
                                                                     }}];
    } else {
        [self.credentialFenceQueue performAction:^(QCloudAuthentationCreator *creator,
                                                   NSError *error) {
            if (error) {
                continueBlock(nil, error);
            } else {
                // 注意 这里不要对urlRequst 进行copy以及mutableCopy操作
                QCloudSignature* signature =  [creator signatureForData:urlRequst];
                continueBlock(signature, nil);
            }
        }];
    }
}


- (void)forceInvalidationCredential {
    if(self.credentialFenceQueue){
        // 获取当前时间
        NSDate *now = [NSDate date];
        // 计算当前时间减去一天的时间
        NSTimeInterval oneDay = 24 * 60 * 60;
        NSDate *yesterday = [now dateByAddingTimeInterval:-oneDay];
        
        // 将当前秘钥的过期时间指定为昨天 使其失效
        self.credentialFenceQueue.authentationCreator.credential.expirationDate = yesterday;
    }
}

- (void)fenceQueue:(QCloudCredentailFenceQueue *)queue requestCreatorWithContinue:(QCloudCredentailFenceQueueContinue)continueBlock {
    //这里同步从◊后台服务器获取临时密钥，强烈建议将获取临时密钥的逻辑放在这里，最大程度上保证密钥的可用性
    _fenceQueueContinueBlock = continueBlock;
    [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil userInfo:@{@"eventName":COS_EMITTER_UPDATE_SESSION_CREDENTIAL, @"eventBody":@{}}];
}


-(nonnull NSArray<STSCredentialScope *> *)convertSTSCredentialScope:(nonnull NSArray<NSMutableDictionary *> *) scopesArray {
    NSMutableArray<STSCredentialScope *> *array = [NSMutableArray array];
    if(scopesArray != nil && [scopesArray count]>0){
        for(NSMutableDictionary *scope in scopesArray) {
            [array addObject:[STSCredentialScope makeWithAction:[scope objectForKey: @"action"]
                                                         region:[scope objectForKey: @"region"]
                                                         bucket:[scope objectForKey: @"bucket"]
                                                         prefix:[scope objectForKey: @"prefix"]
                             ]];
        }
    }
    return array;
}

- (NSString *)jsonifyScopes:(NSArray<STSCredentialScope *> *)scopes {
  NSMutableArray<NSDictionary<NSString *, NSString *> *> *scopeList = [NSMutableArray array];
  for (STSCredentialScope *scope in scopes) {
    if (scope != nil) {
      NSDictionary<NSString *, NSString *> *scopeMap = @{
        @"action": scope.action,
        @"bucket": scope.bucket,
        @"prefix": scope.prefix,
        @"region": scope.region,
      };
      [scopeList addObject:scopeMap];
    }
  }
  NSError *error;
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:scopeList options:0 error:&error];
  if (jsonData == nil) {
    NSLog(@"Error serializing JSON: %@", error);
    return nil;
  }
  return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end
