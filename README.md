## 相关资源
- [SDK 源码下载](https://github.com/TencentCloud/cos-sdk-react-native-plugin)
- [示例 Demo](https://github.com/TencentCloud/cos-sdk-react-native-plugin/tree/main/example)
- [SDK 更新日志](https://github.com/TencentCloud/cos-sdk-react-native-plugin/blob/master/CHANGELOG.md)
- [更多使用方式](https://cloud.tencent.com/document/product/436/86696)
- [NPM 地址](https://www.npmjs.com/package/react-native-cos-sdk)

## 准备工作

1. 您需要一个纯 React Native 项目或 React Native 原生混合项目，这个应用可以是您现有的工程，也可以是您新建的一个空的工程。
2. React Native 版本要求：0.69.1 及以上

## 第一步：SDK 介绍
react-native-cos-sdk 目前兼容支持 iOS、Android，是通过 React Native 桥接原生 [Android](https://cloud.tencent.com/document/product/436/12159) 和 [iOS](https://cloud.tencent.com/document/product/436/11280) 的 COS SDK 实现。

## 第二步：集成 SDK
1. 运行此命令：

使用npm:
```
npm install --save react-native-cos-sdk
```
或者使用yarn:
```
yarn add react-native-cos-sdk
```
2. 在您的代码中，您可以使用 import 进行导入，然后开始使用：
```
import Cos from 'react-native-cos-sdk';
```

#### 关闭腾讯灯塔上报功能

为了持续跟踪和优化 SDK 的质量，给您带来更好的使用体验，我们在 SDK 中引入了 [腾讯灯塔](https://beacon.qq.com/) SDK，腾讯灯塔只对 COS 侧的请求性能进行监控，不会上报业务侧数据。
若是想关闭该功能，可以在依赖引入和 import 时将 react-native-cos-sdk 替换为 react-native-cos-sdk-nobeacon 即可。

## 第三步：开始使用

>!
> - 建议用户 [使用临时密钥](https://cloud.tencent.com/document/product/436/14048) 调用 SDK，通过临时授权的方式进一步提高 SDK 使用的安全性。申请临时密钥时，请遵循 [最小权限指引原则](https://cloud.tencent.com/document/product/436/38618)，防止泄漏目标存储桶或对象之外的资源。
> - 如果您一定要使用永久密钥，建议遵循 [最小权限指引原则](https://cloud.tencent.com/document/product/436/38618) 对永久密钥的权限范围进行限制。

### 1. 初始化密钥

#### 实现获取临时密钥

调用 Cos 的 initWithSessionCredentialCallback 方法，实现请求临时密钥并返回结果的过程。

```ts
import Cos from 'react-native-cos-sdk';

Cos.initWithSessionCredentialCallback(async () => {
  // 首先从您的临时密钥服务器获取包含了密钥信息的响应，例如：
  // 临时密钥服务器 url，临时密钥生成服务请参考 https://cloud.tencent.com/document/product/436/14048
  let stsUrl = "http://stsservice.com/sts";
  let response = null;
  try{
    response = await fetch(stsUrl);
  } catch(e){
    console.error(e);
    return null;
  }
  // 然后解析响应，获取临时密钥信息
  const responseJson = await response.json();
  const credentials = responseJson.credentials;
  const startTime = responseJson.startTime;
  const expiredTime = responseJson.expiredTime;
  const sessionCredentials = {
    tmpSecretId: credentials.tmpSecretId,
    tmpSecretKey: credentials.tmpSecretKey,
    startTime: startTime,
    expiredTime: expiredTime,
    sessionToken: credentials.sessionToken
  };
  console.log(sessionCredentials);
  // 最后返回临时密钥信息对象
  return sessionCredentials;
})
```

#### 实现获取限制范围的临时密钥

该方式可以更精细的控制临时密钥的使用范围，STSCredentialScope 中包含了本次请求的action(操作)、region(地域)、bucket(桶名)、prefix(资源路径)，
使用 STSCredentialScope 可以生成一个限定范围的临时密钥，例如根据 prefix 生成固定路径文件名的上传临时密钥，实现每个上传文件都有单独的临时密钥。

调用 Cos 的 initWithScopeLimitCredentialCallback 方法，实现请求临时密钥并返回结果的过程。

```ts
import Cos from 'react-native-cos-sdk';

// 使用范围限制的临时密钥初始化
Cos.initWithScopeLimitCredentialCallback(async (stsScopesArray:Array<STSCredentialScope>) => {
  // 首先从您的临时密钥服务器获取包含了密钥信息的响应，例如：
  // 临时密钥服务器 url，临时密钥生成服务请参考 https://cloud.tencent.com/document/product/436/14048
  // 范围限制的临时密钥服务请参考：https://cloud.tencent.com/document/product/436/31923
  let stsUrl = "http://stsservice.com/sts/scope";
  console.log(JSON.stringify(stsScopesArray));
  let response = null;
  try{
    response = await fetch(stsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 将范围实体列表转换为post body中的json
      body: JSON.stringify(stsScopesArray),
    });
  } catch(e){
    console.error(e);
    return null;
  }
  // 然后解析响应，获取临时密钥信息
  const responseJson = await response.json();
  const credentials = responseJson.credentials;
  const startTime = responseJson.startTime;
  const expiredTime = responseJson.expiredTime;
  const sessionCredentials = {
    tmpSecretId: credentials.tmpSecretId,
    tmpSecretKey: credentials.tmpSecretKey,
    startTime: startTime,
    expiredTime: expiredTime,
    sessionToken: credentials.sessionToken
  };
  console.log(sessionCredentials);
  // 最后返回临时密钥信息对象
  return sessionCredentials;
})
```

#### 强制使本地保存的临时密钥失效

该功能可以强制使 COS SDK 已经缓存的临时密钥失效，包括无限制使用范围和限制使用范围的临时密钥，失效后再使用 COS 接口功能时 SDK 会重新向业务临时密钥服务端获取新的临时密钥。
调用方法：

```ts
await Cos.forceInvalidationCredential();
```

#### 使用永久密钥进行本地调试

您可以使用腾讯云的永久密钥来进行开发阶段的本地调试。**由于该方式存在泄漏密钥的风险，请务必在上线前替换为临时密钥的方式。**

```ts
import Cos from 'react-native-cos-sdk';

let SECRET_ID = "SECRETID"; //永久密钥 secretId
let SECRET_KEY = "SECRETKEY"; //永久密钥 secretKey

Cos.initWithPlainSecret(
  SECRET_ID,
  SECRET_KEY
)
```

### 2. 注册 COS 服务
```ts
// 存储桶所在地域简称，例如广州地区是 ap-guangzhou
let region = "COS_REGION";
// 创建 CosXmlServiceConfig 对象，根据需要修改默认的配置参数
let serviceConfig = {
    region: region,
    isDebuggable: true,
    isHttps: true,
};
// 注册默认 COS Service
let cosService = await Cos.registerDefaultService(serviceConfig);
// 获取默认 COS Service
let cosService1 = Cos.getDefaultService();

// 创建 TransferConfig 对象，根据需要修改默认的配置参数
// TransferConfig 可以设置智能分块阈值 默认对大于或等于2M的文件自动进行分块上传，可以通过如下代码修改分块阈值
let transferConfig = {
    forceSimpleUpload: false,
    enableVerification: true,
    divisionForUpload: 2097152, // 设置大于等于 2M 的文件进行分块上传
    sliceSizeForUpload: 1048576, //设置默认分块大小为 1M
};
// 注册默认 COS TransferManger
let cosTransferManger = await Cos.registerDefaultTransferManger(serviceConfig, transferConfig);
// 获取默认 COS TransferManger
let cosTransferManger1 = Cos.getDefaultTransferManger();

// 也可以通过 registerService 和 registerTransferManger 注册其他实例， 用于后续调用
// 一般用 region 作为注册的key
let newRegion = "NEW_COS_REGION";
serviceConfig.region = newRegion;
let cosServiceNew = await Cos.registerService(newRegion, serviceConfig);
let cosTransferMangerNew = await Cos.registerTransferManger(newRegion, serviceConfig, transferConfig);
// 通过 key 获取 COS Service 和 COS TransferManger
let cosServiceNew1 = Cos.getService(newRegion);
let cosTransferMangerNew1 = Cos.getTransferManger(newRegion);
```

注意：获取 COS Service 和 COS TransferManger 之前必须先要进行注册，否则会报错。
例如可以通过封装类似下面的方法控制获取前必须注册的流程
```ts
const SERVICE_CONFIG = {
    region: "COS_REGION",
    isDebuggable: true,
}

export async function getDefaultService(): Promise<CosService> {
  if(Cos.hasDefaultService()){
      return Cos.getDefaultService()
  } else {
      //注册默认service
      return await Cos.registerDefaultService(SERVICE_CONFIG)
  }
}
```

#### 参数说明

CosXmlServiceConfig 用于配置 COS 服务，其主要成员说明如下：

| 参数名称   | 描述                                                         | 类型   | 默认值 | 支持平台 |
| ---------- | ------------------------------------------------------------ | ------ | ------ |------ |
| region | 存储桶地域 [地域和访问域名](https://cloud.tencent.com/document/product/436/6224) | String | null | Android和iOS |
| connectionTimeout | 连接超时时间（单位是毫秒） | Int | Android(15000) iOS(30000) | Android和iOS |
| socketTimeout | 读写超时时间（单位是毫秒） | Int | 30000 | Android |
| isHttps | 是否使用https协议 | Bool | true | Android和iOS |
| host | 设置除了 GetService 请求外的 host | String | null | Android和iOS |
| hostFormat | 设置 host 的格式化字符串，sdk 会将 \$\{bucket\} 替换为真正的 bucket，\$\{region\} 替换为真正的 region<br>例如将 hostFormat 设置为  \$\{bucket\}.\$\{region\}.tencent.com，并且您的存储桶和地域分别为 bucket-1250000000 和 ap-shanghai，那么最终的请求地址为 `bucket-1250000000.ap-shanghai.tencent.com`<br><li>注意，这个设置不会影响 GetService 请求 | String | null | Android |
| port | 设置请求的端口 | Int | null | Android |
| isDebuggable | 是否是 debug 模式（debug 模式会打印 debug 日志） | Bool | false | Android |
| signInUrl | 是否将签名放在 URL 中，默认放在 Header 中 | Bool | false | Android |
| userAgent | ua 拓展参数 | String | null | Android和iOS |
| dnsCache | 是否开启 DNS 解析缓存，开启后，将 DNS 解析的结果缓存在本地，当系统 DNS 解析失败后，会使用本地缓存的 DNS 结果 | Bool | true | Android |
| accelerate | 是否使用全球加速域名 | Bool | false | Android和iOS |

TransferConfig 用于配置 COS 上传服务，其主要成员说明如下：

| 参数名称   | 描述                                                         | 类型   | 默认值 | 支持平台 |
| ---------- | ------------------------------------------------------------ | ------ | ------ |------ |
| divisionForUpload | 设置启用分块上传的最小对象大小 | Int | 2097152 | Android和iOS |
| sliceSizeForUpload | 设置分块上传时的分块大小 | Int | 1048576 | Android和iOS |
| enableVerification | 分片上传时是否整体校验 | Bool | true | Android和iOS |
| forceSimpleUpload | 是否强制使用简单上传 | Bool | false | Android |

## 第四步：访问 COS 服务

### 上传对象

```ts
    // 获取 CosTransferManger
    let cosTransferManger: CosTransferManger = Cos.getDefaultTransferManger();
    //let cosTransferManger: CosTransferManger = Cos.getTransferManger(newRegion);
    // 存储桶名称，由 bucketname-appid 组成，appid 必须填入，可以在 COS 控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
    let bucket = "examplebucket-1250000000";
    let cosPath = "exampleobject"; //对象在存储桶中的位置标识符，即称对象键
    let srcPath = "本地文件的路径"; //本地文件的路径
    //若存在初始化分块上传的 UploadId，则赋值对应的 uploadId 值用于续传；否则，赋值 undefined
    let _uploadId = undefined;

    // 上传成功回调
    let successCallBack = (header?: object) => {
      // todo 上传成功后的逻辑
    };
    //上传失败回调
    let failCallBack = (clientError?: CosXmlClientError, serviceError?: CosXmlServiceError) => {
      // todo 上传失败后的逻辑
      if (clientError) {
        console.log(clientError);
      }
      if (serviceError) {
        console.log(serviceError);
      }
    };
    //上传状态回调, 可以查看任务过程
    let stateCallBack = (state: TransferState) => {
      // todo notify transfer state
    };
    //上传进度回调
    let progressCallBack = (complete: number, target: number) => {
      // todo Do something to update progress...
    };
    //初始化分块完成回调
    let initMultipleUploadCallBack = (bucket: string, cosKey: string, uploadId: string) => {
      //用于下次续传上传的 uploadId
      _uploadId = uploadId;
    };
    
    //开始上传
    let transferTask:TransferTask = await cosTransferManger.upload(
      bucket,
      cosPath,
      srcPath,
      {
        uploadId: _uploadId,
        resultListener: {
          successCallBack: successCallBack,
          failCallBack: failCallBack
        },
        stateCallback: stateCallBack,
        progressCallback: progressCallBack,
        initMultipleUploadCallback: initMultipleUploadCallBack,
      }
    );
    //暂停任务
    transferTask.pause();
    //恢复任务
    transferTask.resume();
    //取消任务
    transferTask.cancel();
```

### 下载对象

```ts
    // 高级下载接口支持断点续传，所以会在下载前先发起 HEAD 请求获取文件信息。
    // 如果您使用的是临时密钥或者使用子账号访问，请确保权限列表中包含 HeadObject 的权限。

    // CosTransferManger 支持断点下载，您只需要保证 bucket、cosPath、savePath
    // 参数一致，SDK 便会从上次已经下载的位置继续下载。

    // 获取 CosTransferManger
    let cosTransferManger: CosTransferManger = Cos.getDefaultTransferManger();
    //let cosTransferManger: CosTransferManger = Cos.getTransferManger(newRegion);
    // 存储桶名称，由 bucketname-appid 组成，appid 必须填入，可以在 COS 控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
    let bucket = "examplebucket-1250000000";
    let cosPath = "exampleobject"; //对象在存储桶中的位置标识符，即称对象键
    let downliadPath = "本地文件的路径"; //保存到本地文件的路径

    // 下载成功回调
    let successCallBack = (header?: object) => {
      // todo 下载成功后的逻辑
    };
    //下载失败回调
    let failCallBack = (clientError?: CosXmlClientError, serviceError?: CosXmlServiceError) => {
      // todo 下载失败后的逻辑
      if (clientError) {
        console.log(clientError);
      }
      if (serviceError) {
        console.log(serviceError);
      }
    };
    //下载状态回调, 可以查看任务过程
    let stateCallBack = (state: TransferState) => {
      // todo notify transfer state
    };
    //下载进度回调
    let progressCallBack = (complete: number, target: number) => {
      // todo Do something to download progress...
    };

    //开始下载
    let transferTask:TransferTask = = await cosTransferManger.download(
      bucket,
      cosPath,
      downliadPath,
      {
        resultListener: {
          successCallBack: successCallBack,
          failCallBack: failCallBack
        },
        stateCallback: stateCallBack,
        progressCallback: progressCallBack
      }
    );
    //暂停任务
    transferTask.pause();
    //恢复任务
    transferTask.resume();
    //取消任务
    transferTask.cancel();
```