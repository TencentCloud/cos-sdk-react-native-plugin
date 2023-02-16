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

@implementation CosPluginSignatureProvider
QCloudCredential* newCredential = nil;
QCloudCredentailFenceQueueContinue myContinueBlock = nil;

- (instancetype)init {
  self = [super init];
  if (self) {
      // 初始化临时密钥脚手架
      self.credentialFenceQueue = [QCloudCredentailFenceQueue new];
      self.credentialFenceQueue.delegate = self;
  }
  return self;
}

- (void)setNewCredential:(QCloudCredential *)credential{
    if(myContinueBlock == nil){
        newCredential = credential;
    } else {
        QCloudAuthentationV5Creator* creator = [[QCloudAuthentationV5Creator alloc]
                                                initWithCredential:credential];
        myContinueBlock(creator, nil);
    }
}

- (void)signatureWithFields:(QCloudSignatureFields *)fileds request:(QCloudBizHTTPRequest *)request urlRequest:(NSMutableURLRequest *)urlRequst compelete:(QCloudHTTPAuthentationContinueBlock)continueBlock {
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

- (void)fenceQueue:(QCloudCredentailFenceQueue *)queue requestCreatorWithContinue:(QCloudCredentailFenceQueueContinue)continueBlock {
    if(newCredential != nil){
        QCloudAuthentationV5Creator* creator = [[QCloudAuthentationV5Creator alloc]
                                                initWithCredential:newCredential];
        continueBlock(creator, nil);
    } else {
        myContinueBlock = continueBlock;
        [[NSNotificationCenter defaultCenter] postNotificationName:COS_NOTIFICATION_NAME object:nil userInfo:@{@"eventName":COS_EMITTER_UPDATE_SESSION_CREDENTIAL, @"eventBody":@{}}];
    }
}

@end
