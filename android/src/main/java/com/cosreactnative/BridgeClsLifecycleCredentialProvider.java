package com.cosreactnative;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tencent.qcloud.track.cls.ClsAuthenticationException;
import com.tencent.qcloud.track.cls.ClsLifecycleCredentialProvider;
import com.tencent.qcloud.track.cls.ClsSessionCredentials;

class BridgeClsLifecycleCredentialProvider extends ClsLifecycleCredentialProvider {

    private final ReactApplicationContext reactContext;

    private final Object sessionWaitingLock = new Object();
    private ClsSessionCredentials newCredentials;

    BridgeClsLifecycleCredentialProvider(ReactApplicationContext reactContext) {
        super();
        this.reactContext = reactContext;
    }

    public void setNewCredentials(ClsSessionCredentials newCredentials) {
        this.newCredentials = newCredentials;

        synchronized (sessionWaitingLock) {
            sessionWaitingLock.notify();
        }
    }

    @Override
    protected ClsSessionCredentials fetchNewCredentials() throws ClsAuthenticationException {
        sendUpdateCredentialMessage();

        synchronized (sessionWaitingLock) {
            try {
                sessionWaitingLock.wait(15000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        return newCredentials;
    }

    private void sendUpdateCredentialMessage() {
        WritableMap params = Arguments.createMap();
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(Constants.COS_EMITTER_UPDATE_CLS_SESSION_CREDENTIAL, params);
    }
}
