
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNQCloudCosReactNativeSpec.h"

@interface QCloudCosReactNative : NSObject <NativeQCloudCosReactNativeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface QCloudCosReactNative : NSObject <RCTBridgeModule>
#endif

@end
