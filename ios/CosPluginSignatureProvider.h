//
//  CosPluginSignatureProvider.h
//  Pods
//
//  Created by jordanqin on 2022/12/8.
//

#ifndef CosSignatureProvider_h
#define CosSignatureProvider_h


#endif /* CosSignatureProvider_h */

#import <QCloudCOSXML/QCloudCOSXML.h>
#import <QCloudCore/QCloudCredential.h>
#import "pigeon.h"

typedef QCloudCredential *_Nullable(^ClsCredentialCallback)();

NS_ASSUME_NONNULL_BEGIN

@interface CosPluginSignatureProvider : NSObject<QCloudSignatureProvider, QCloudCredentailFenceQueueDelegate>
- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)makeWithSecretId: (nullable NSString *)secretId
                                   secretKey:(nullable NSString *)secretKey
                                   isScopeLimitCredential:(bool)isScopeLimitCredential;

- (QCloudThreadSafeMutableDictionary *)UrlRequstCache;
- (QCloudThreadSafeMutableDictionary *)AuthentationContinueBlocksCache;

- (void)setNewCredential:(QCloudCredential *)credential jsonifyScopes:(nullable NSString *)jsonifyScopes;
- (void)forceInvalidationCredential;

@property (nonatomic, strong, nonnull) QCloudCredentailFenceQueue* credentialFenceQueue;
@property (nonatomic, copy, nullable) NSString* secretId;
@property (nonatomic, copy, nullable) NSString* secretKey;
@property (nonatomic) bool isScopeLimitCredential;

@end

NS_ASSUME_NONNULL_END
