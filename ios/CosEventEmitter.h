//  CosEventEmitter.h

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface CosEventEmitter : RCTEventEmitter <RCTBridgeModule>
extern NSString * const COS_NOTIFICATION_NAME;

// native to js: 更新临时秘钥
extern NSString * const COS_EMITTER_UPDATE_SESSION_CREDENTIAL;
// native to js: 回调结果成功
extern NSString * const COS_EMITTER_RESULT_SUCCESS_CALLBACK;
// native to js: 回调结果失败
extern NSString * const COS_EMITTER_RESULT_FAIL_CALLBACK;
// native to js: 回调进度
extern NSString * const COS_EMITTER_PROGRESS_CALLBACK;
// native to js: 回调状态
extern NSString * const COS_EMITTER_STATE_CALLBACK;
// native to js: 回调分块上传初始化
extern NSString * const COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK;

extern NSString * const COS_EMITTER_LOG_CALLBACK;

extern NSString * const COS_EMITTER_DNS_FETCH;

extern NSString * const COS_EMITTER_UPDATE_CLS_SESSION_CREDENTIAL;
@end
