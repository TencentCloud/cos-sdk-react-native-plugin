import Cos from 'react-native-cos-sdk';
import type { CosService } from 'react-native-cos-sdk';
import {CLS_CREDENTIAL_URL, PERSIST_BUCKET_REGION} from './config/config';

const SERVICE_CONFIG = {
    region: PERSIST_BUCKET_REGION,
    isDebuggable: true,
}

export async function getDefaultService(): Promise<CosService> {
    var cosService: CosService
    if(Cos.hasDefaultService()){
        cosService = Cos.getDefaultService()
    } else {
        //注册默认service
        cosService = await Cos.registerDefaultService(SERVICE_CONFIG)
    }
    Cos.enableLogcat(false)
    Cos.enableLogFile(true)
    // Cos.addLogListener("cos", (log) => {
    //     console.log("qqqlog");
    //     console.log(log);
    // })
    // Cos.addLogListener("cos1", (log) => {
    //   console.log("cos1log");
    //   console.log(log);
    // })
    // Cos.removeLogListener("cos1")
    console.log("getLogRootDir");
    console.log(await Cos.getLogRootDir());
    // Cos.setCLsChannelStaticKey("5edf1c8b-160c-43d5-8506-0a8621a3fa73", "ap-guangzhou.cls.tencentcs.com", "", "")
    Cos.setCLsChannelSessionCredential("5edf1c8b-160c-43d5-8506-0a8621a3fa73", "ap-guangzhou.cls.tencentcs.com", async () => {
              // 请求临时密钥
              let response = null;
              try{
                response = await fetch(CLS_CREDENTIAL_URL);
              } catch(e){
                console.error(e);
                return null;
              }
              const responseJson = await response.json();
              const credentials = responseJson.credentials;
              const expiredTime = responseJson.expiredTime;
              const sessionCredentials = {
                tmpSecretId: credentials.tmpSecretId,
                tmpSecretKey: credentials.tmpSecretKey,
                expiredTime: expiredTime,
                sessionToken: credentials.sessionToken
              };
              console.log("setCLsChannelSessionCredential");
              console.log(sessionCredentials);
              return sessionCredentials;
    })
    // Cos.setMinLevel(1)
    Cos.setExtras({"test1k":"test1v", "test2k":"test2v"})

  //   // 创建32字节的密钥和16字节的IV（示例值，实际应使用安全随机数生成）
  // const key = new Uint8Array([
  //   0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  //   0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
  //   0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
  //   0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
  // ]);
  // const iv = new Uint8Array([
  //   0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
  //   0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F
  // ]);
  // // 调用设置日志文件加密密钥方法
  // await Cos.setLogFileEncryptionKey(key, iv);

    return cosService
}