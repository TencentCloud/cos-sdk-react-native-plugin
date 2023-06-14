//
//  CosEventEmitter.m
//  cos
//
//  Created by jordanqin on 2022/12/8.
//
// CosEventEmitter.m
#import "CosEventEmitter.h"

@interface CosEventEmitter ()
{
    bool hasListeners;
}
@end
@implementation CosEventEmitter
NSString * const COS_NOTIFICATION_NAME = @"CosNotificationName";
// native to js: 更新临时秘钥
NSString * const COS_EMITTER_UPDATE_SESSION_CREDENTIAL = @"COSEmitterUpdateSessionCredential";
// native to js: 回调结果成功
NSString * const COS_EMITTER_RESULT_SUCCESS_CALLBACK = @"COSEmitterResultSuccessCallback";
// native to js: 回调结果失败
NSString * const COS_EMITTER_RESULT_FAIL_CALLBACK = @"COSEmitterResultFailCallback";
// native to js: 回调进度
NSString * const COS_EMITTER_PROGRESS_CALLBACK = @"COSEmitterProgressCallback";
// native to js: 回调状态
NSString * const COS_EMITTER_STATE_CALLBACK = @"COSEmitterStateCallback";
// native to js: 回调分块上传初始化
NSString * const COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK = @"COSEmitterInitMultipleUploadCallback";



RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents{
    return @[COS_EMITTER_UPDATE_SESSION_CREDENTIAL, COS_EMITTER_RESULT_SUCCESS_CALLBACK, COS_EMITTER_RESULT_FAIL_CALLBACK, COS_EMITTER_PROGRESS_CALLBACK, COS_EMITTER_STATE_CALLBACK, COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK];
}

-(void)startObserving {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(receiveNotification:) name:COS_NOTIFICATION_NAME object:nil];
    hasListeners = YES;
}

-(void)stopObserving {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    hasListeners = NO;
}

- (void)receiveNotification:(NSNotification *)notification {
    if (hasListeners) {
        NSDictionary *userInfo = notification.userInfo;
        NSString * eventName = [userInfo objectForKey:@"eventName"];
        id eventBody = [userInfo objectForKey:@"eventBody"];
        
        [self sendEventWithName:eventName body:eventBody];
    }
}

+ (BOOL)requiresMainQueueSetup{
  return NO;
}

@end
