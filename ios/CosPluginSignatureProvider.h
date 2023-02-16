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
#import "pigeon.h"

NS_ASSUME_NONNULL_BEGIN

@interface CosPluginSignatureProvider : NSObject<QCloudSignatureProvider, QCloudCredentailFenceQueueDelegate>
- (void)setNewCredential:(QCloudCredential *)credential;

@property (nonatomic, strong, nonnull) QCloudCredentailFenceQueue* credentialFenceQueue;

@end

NS_ASSUME_NONNULL_END
