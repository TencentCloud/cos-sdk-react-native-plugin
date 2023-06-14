package com.cosreactnative;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.tencent.qcloud.core.auth.QCloudCredentials;
import com.tencent.qcloud.core.auth.STSCredentialScope;
import com.tencent.qcloud.core.auth.ScopeLimitCredentialProvider;
import com.tencent.qcloud.core.auth.SessionQCloudCredentials;
import com.tencent.qcloud.core.common.QCloudClientException;

class BridgeScopeLimitCredentialProvider implements ScopeLimitCredentialProvider {
  private final ReactApplicationContext reactContext;

  private final Object sessionWaitingLock = new Object();
  private SessionQCloudCredentials newCredentials;

  BridgeScopeLimitCredentialProvider(ReactApplicationContext reactContext) {
    super();
    this.reactContext = reactContext;
  }

  public void setNewCredentials(SessionQCloudCredentials newCredentials) {
    this.newCredentials = newCredentials;

    synchronized (sessionWaitingLock) {
      sessionWaitingLock.notify();
    }
  }

  @Override
  public SessionQCloudCredentials getCredentials(STSCredentialScope[] stsCredentialScopes) throws QCloudClientException {
    sendUpdateCredentialMessage(stsCredentialScopes);

    synchronized (sessionWaitingLock) {
      try {
        sessionWaitingLock.wait(15000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
    return newCredentials;
  }

  @Override
  public QCloudCredentials getCredentials() {
    throw new UnsupportedOperationException("not support ths op");
  }

  @Override
  public void refresh() {
  }

  private void sendUpdateCredentialMessage(STSCredentialScope[] stsCredentialScopes) {
    WritableMap params = Arguments.createMap();
    Gson gson = new Gson();
    params.putString("stsScopesArrayJson", gson.toJson(stsCredentialScopes));
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(Constants.COS_EMITTER_UPDATE_SESSION_CREDENTIAL, params);
  }
}
