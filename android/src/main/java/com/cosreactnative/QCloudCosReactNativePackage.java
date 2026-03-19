package com.cosreactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class QCloudCosReactNativePackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactContext) {
    if (QCloudCosReactNativeModule.NAME.equals(name)) {
      return new QCloudCosReactNativeModule(reactContext);
    }
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos.put(
        QCloudCosReactNativeModule.NAME,
        createReactModuleInfo(isTurboModule)
      );
      return moduleInfos;
    };
  }

  private ReactModuleInfo createReactModuleInfo(boolean isTurboModule) {
    // RN 0.74+ removed the 7-arg constructor (hasConstants parameter).
    // Use reflection to support both old and new versions.
    try {
      // Try 6-arg constructor first (RN >= 0.74)
      return ReactModuleInfo.class
        .getConstructor(String.class, String.class, boolean.class, boolean.class, boolean.class, boolean.class)
        .newInstance(
          QCloudCosReactNativeModule.NAME,
          QCloudCosReactNativeModule.NAME,
          false, // canOverrideExistingModule
          false, // needsEagerInit
          false, // isCxxModule
          isTurboModule // isTurboModule
        );
    } catch (Exception e) {
      try {
        // Fall back to 7-arg constructor (RN < 0.74)
        return ReactModuleInfo.class
          .getConstructor(String.class, String.class, boolean.class, boolean.class, boolean.class, boolean.class, boolean.class)
          .newInstance(
            QCloudCosReactNativeModule.NAME,
            QCloudCosReactNativeModule.NAME,
            false, // canOverrideExistingModule
            false, // needsEagerInit
            true,  // hasConstants
            false, // isCxxModule
            isTurboModule // isTurboModule
          );
      } catch (Exception ex) {
        throw new RuntimeException("Could not create ReactModuleInfo", ex);
      }
    }
  }
}
