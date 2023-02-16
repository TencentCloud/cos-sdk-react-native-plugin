export class IllegalArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalArgumentError";
  }
}

export class CosXmlClientError extends Error {
  public errorCode: number;
  public details?: string;
  constructor(errorCode: number, message?: string, details?: string) {
    super(message);
    this.errorCode = errorCode;
    this.details = details;

    this.name = errorCode.toString();
    this.cause = details;
  }
}

export class CosXmlServiceError extends Error {
  public statusCode: number;
  public httpMsg?: string;
  public requestId?: string;
  public errorCode?: string;
  public errorMessage?: string;
  public serviceName?: string;
  public details?: string;

  constructor(
    statusCode: number,
    httpMsg?: string,
    requestId?: string,
    errorCode?: string,
    errorMessage?: string,
    serviceName?: string,
    details?: string,
  ) {
    super(errorMessage);
    this.statusCode = statusCode;
    this.httpMsg = httpMsg;
    this.requestId = requestId;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.serviceName = serviceName;
    this.details = details;

    if(errorCode){
      this.name = errorCode.toString();
    }
    this.cause = details;
  }
}