export type LogEntity = {
    /// 日志时间戳（毫秒）
    timestamp: number;
    
    /// 日志级别
    level: LogLevel;
    
    /// 日志分类 
    category: LogCategory;
    
    /// 日志标签
    tag: string;
    
    /// 日志消息内容
    message: string;
    
    /// 记录日志的线程名称
    threadName?: string;
    
    /// 额外信息（可选）
    extras?: Record<string, string>;
    
    /// 异常信息（可选）
    throwable?: string;
}

export enum LogLevel {
    VERBOSE = 1,
    DEBUG = 2,
    INFO = 3,
    WARN = 4,
    ERROR = 5
}

export enum LogCategory {
    PROCESS, RESULT, NETWORK, PROBE, ERROR
}