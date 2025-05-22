import type { CosXmlClientError, CosXmlServiceError } from 'react-native-cos-sdk';
import type { SessionQCloudCredentials } from 'react-native-cos-sdk';
import { STS_URL, USE_CREDENTIAL } from './config/config';

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}

export function getCosXmlClientErrorMessage(error: CosXmlClientError) {
  return `errorCode=${error.name} message=${error.message} details=${error.details}`;
}

export function getCosXmlServiceErrorMessage(error: CosXmlServiceError) {
  return `errorCode=${error.name} message=${error.message} statusCode=${error.statusCode} 
  httpMsg=${error.httpMsg} requestId=${error.requestId} serviceName=${error.serviceName} details=${error.details}`;
}

export function toDateTimeString(utc: string | undefined): string {
    if(utc == undefined || utc.length == 0){
      return "";
    } else {
      return new Date(utc).toLocaleString();
    }
  }

  export function readableStorageSize(sizeInBL: number): string  {
    let index = 0;
    let units = ["B", "KB", "MB", "GB", "TB", "PB"];

    while (sizeInBL > 1000 && index < 5) {
    index++;
    sizeInBL /= 1024;
    }

    return `${sizeInBL.toFixed(2)}${units[index]}`;
  }

  export async function getSessionCredentials(): Promise<SessionQCloudCredentials> {
    if(USE_CREDENTIAL){
      return null;
    }

    // 请求临时密钥
    let response = null;
    try{
      response = await fetch(STS_URL);
    } catch(e){
      console.error(e);
      return null;
    }
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
    return sessionCredentials;
  }