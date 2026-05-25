// 中间件：日志记录
// 记录请求入参、出参、耗时

export interface LogEntry {
  traceId: string
  timestamp: string
  method: string
  path: string
  input: unknown
  output: unknown
  duration: number
  status: number
}

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function logRequest(entry: LogEntry): void {
  const logLevel = entry.duration > 500 ? '[PERF_ALERT]' : '[INFO]'
  console.log(
    `${logLevel} ${entry.traceId} | ${entry.method} ${entry.path} | ${entry.duration}ms | ${entry.status}`
  )
}
