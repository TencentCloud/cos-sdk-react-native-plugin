/*
 * Copyright (c) 2010-2020 Tencent Cloud. All rights reserved.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

package com.cosreactnative;

/**
 * 常量
 */
public final class Constants {
  // native to js: 更新临时秘钥
  public static final String COS_EMITTER_UPDATE_SESSION_CREDENTIAL = "COSEmitterUpdateSessionCredential";
  // native to js: 获取domain对应的ip数组
  public static final String COS_EMITTER_DNS_FETCH = "COSEmitterDnsFetch";
  // native to js: 回调结果成功
  public static final String COS_EMITTER_RESULT_SUCCESS_CALLBACK = "COSEmitterResultSuccessCallback";
  // native to js: 回调结果失败
  public static final String COS_EMITTER_RESULT_FAIL_CALLBACK = "COSEmitterResultFailCallback";
  // native to js: 回调进度
  public static final String COS_EMITTER_PROGRESS_CALLBACK = "COSEmitterProgressCallback";
  // native to js: 回调状态
  public static final String COS_EMITTER_STATE_CALLBACK = "COSEmitterStateCallback";
  // native to js: 回调分块上传初始化
  public static final String COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK = "COSEmitterInitMultipleUploadCallback";

  // native to js: 更新CLS临时秘钥
  public static final String COS_EMITTER_UPDATE_CLS_SESSION_CREDENTIAL = "COSEmitterUpdateClsSessionCredential";
  // native to js: 日志回调
  public static final String COS_EMITTER_LOG_CALLBACK = "COSEmitterLogCallback";
}
