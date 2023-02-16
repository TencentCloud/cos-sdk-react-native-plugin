import type { CosXmlClientError, CosXmlServiceError } from "src/data_model/errors"

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