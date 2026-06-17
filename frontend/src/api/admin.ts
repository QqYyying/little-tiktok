const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
}

export interface ApiMetricsRecord {
  path: string
  method: string
  requestCount: number
  successCount: number
  failCount: number
  slowCount: number
  avgCostTime: number
  maxCostTime: number
  minCostTime: number
  successRate: number
  slowRate: number
}

export interface ApiMetricsSummary {
  requestCount: number
  successCount: number
  failCount: number
  slowCount: number
  avgCostTime: number
}

export interface ApiMetricsResponse {
  startTime?: string | null
  endTime?: string | null
  totalApis: number
  summary?: ApiMetricsSummary | null
  records: ApiMetricsRecord[]
}

export interface RequestLogRecord {
  id: string
  requestId?: string | null
  userId?: string | null
  interfaceName: string
  method?: string | null
  path?: string | null
  inputData?: string | null
  outputData?: string | null
  costTime: number
  isSlow: boolean
  httpStatus?: number | null
  success: boolean
  errorCode?: string | null
  clientIp?: string | null
  createdAt: string
}

export interface RequestLogPageResponse {
  total: number
  page: number
  pageSize: number
  records: RequestLogRecord[]
}

function buildHeaders(extraHeaders: HeadersInit = {}) {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const payload: ApiEnvelope<T> = await response.json()
  if (!response.ok || payload.code !== 'OK') {
    throw new Error(payload.message || '请求失败')
  }
  return payload.data
}

export async function getApiMetrics(limit = 20): Promise<ApiMetricsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    sortBy: 'avgCostTime',
    includeAdmin: 'true',
  })
  const response = await fetch(`${ADMIN_API_BASE}/admin/api-metrics?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return unwrapResponse<ApiMetricsResponse>(response)
}

export async function getRequestLogs(page = 1, pageSize = 20): Promise<RequestLogPageResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  const response = await fetch(`${ADMIN_API_BASE}/admin/request-logs?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return unwrapResponse<RequestLogPageResponse>(response)
}
