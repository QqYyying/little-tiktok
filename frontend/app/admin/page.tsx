'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, AlertTriangle, Clock, Gauge, ShieldAlert, Server, XCircle } from 'lucide-react'
import { getApiMetrics, getRequestLogs, ApiMetricsRecord, RequestLogRecord } from '@/src/api/admin'
import { useAuth } from '@/src/hooks/useAuth'

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0.0%'
  }
  return `${(value * 100).toFixed(1)}%`
}

function formatMs(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0 ms'
  }
  return `${Number(value).toFixed(0)} ms`
}

function DetailBlock({ title, value }: { title: string; value?: string | null }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500">{title}</div>
      <pre className="max-h-56 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
        {value || '无'}
      </pre>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const [metrics, setMetrics] = useState<ApiMetricsRecord[]>([])
  const [metricsSummary, setMetricsSummary] = useState<{
    requestCount: number
    failCount: number
    slowCount: number
    avgCostTime: number
  } | null>(null)
  const [logs, setLogs] = useState<RequestLogRecord[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }
    if (!isAuthenticated) {
      router.replace('/login?redirect=/admin')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdmin) {
      return
    }

    let canceled = false
    async function loadAdminData() {
      setLoading(true)
      setError('')
      try {
        const [metricsResponse, logsResponse] = await Promise.all([
          getApiMetrics(20),
          getRequestLogs(1, 20),
        ])
        if (canceled) {
          return
        }
        setMetrics(metricsResponse.records || [])
        setMetricsSummary(metricsResponse.summary ? {
          requestCount: metricsResponse.summary.requestCount || 0,
          failCount: metricsResponse.summary.failCount || 0,
          slowCount: metricsResponse.summary.slowCount || 0,
          avgCostTime: metricsResponse.summary.avgCostTime ?? 0,
        } : null)
        setLogs(logsResponse.records || [])
        setTotalLogs(logsResponse.total || 0)
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : '加载后台数据失败')
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    void loadAdminData()
    return () => {
      canceled = true
    }
  }, [isAdmin, isAuthenticated, isLoading])

  const summary = useMemo(() => {
    const requestCount = metricsSummary?.requestCount ?? totalLogs
    const slowCount = metricsSummary?.slowCount ?? metrics.reduce((sum, item) => sum + (item.slowCount || 0), 0)
    const failCount = metricsSummary?.failCount ?? metrics.reduce((sum, item) => sum + (item.failCount || 0), 0)
    const avgCost = metricsSummary?.avgCostTime ?? 0

    return {
      totalApis: metrics.length,
      requestCount,
      slowCount,
      failCount,
      failRate: requestCount > 0 ? failCount / requestCount : 0,
      avgCost,
    }
  }, [metrics])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl text-sm text-gray-500">正在检查登录状态...</div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900">无权限访问后台</h1>
          <p className="mt-2 text-sm text-gray-500">当前账号不是管理员，请使用 ADMIN 角色账号登录。</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">后台监控</h1>
          <p className="mt-1 text-sm text-gray-500">请求日志、接口耗时和慢请求统计</p>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: '接口数量', value: summary.totalApis, icon: Server },
            { label: '请求总数', value: summary.requestCount, icon: Activity },
            { label: '慢请求数', value: summary.slowCount, icon: AlertTriangle },
            { label: '失败数 / 错误率', value: `${summary.failCount} / ${formatPercent(summary.failRate)}`, icon: XCircle },
            { label: '平均耗时', value: formatMs(summary.avgCost), icon: Gauge },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3 text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">接口耗时统计</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">方法</th>
                  <th className="px-4 py-3">路径</th>
                  <th className="px-4 py-3">调用次数</th>
                  <th className="px-4 py-3">平均耗时</th>
                  <th className="px-4 py-3">最大耗时</th>
                  <th className="px-4 py-3">成功率</th>
                  <th className="px-4 py-3">慢请求率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.map((item) => (
                  <tr key={`${item.method}-${item.path}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.method}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.path}</td>
                    <td className="px-4 py-3">{item.requestCount}</td>
                    <td className="px-4 py-3">{formatMs(item.avgCostTime)}</td>
                    <td className="px-4 py-3">{formatMs(item.maxCostTime)}</td>
                    <td className="px-4 py-3">{formatPercent(item.successRate)}</td>
                    <td className="px-4 py-3">{formatPercent(item.slowRate)}</td>
                  </tr>
                ))}
                {!loading && metrics.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>暂无接口统计</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold">请求日志</h2>
            <span className="text-sm text-gray-500">共 {totalLogs} 条</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">用户</th>
                  <th className="px-4 py-3">方法</th>
                  <th className="px-4 py-3">路径</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">耗时</th>
                  <th className="px-4 py-3">慢请求</th>
                  <th className="px-4 py-3">错误码</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{log.createdAt}</td>
                      <td className="px-4 py-3">{log.userId || '-'}</td>
                      <td className="px-4 py-3 font-medium">{log.method || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.path || '-'}</td>
                      <td className="px-4 py-3">{log.httpStatus || '-'}</td>
                      <td className="px-4 py-3">{formatMs(log.costTime)}</td>
                      <td className="px-4 py-3">{log.isSlow ? '是' : '否'}</td>
                      <td className="px-4 py-3">{log.errorCode || '-'}</td>
                      <td className="px-4 py-3">{log.clientIp || '-'}</td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr>
                        <td className="bg-gray-50 px-4 py-4" colSpan={9}>
                          <div className="mb-3 text-xs text-gray-500">requestId: {log.requestId || '-'}</div>
                          <div className="grid gap-4 lg:grid-cols-2">
                            <DetailBlock title="请求输入 inputData" value={log.inputData} />
                            <DetailBlock title="响应输出 outputData" value={log.outputData} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>暂无请求日志</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
