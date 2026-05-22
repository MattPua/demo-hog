import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import {
  getPostHogIngestHost,
  getPostHogProjectToken,
} from '~/lib/posthog-client'

let provider: LoggerProvider | null = null

function getLogsUrl(): string {
  const host = getPostHogIngestHost().replace(/\/$/, '')
  const token = getPostHogProjectToken()
  if (!token) {
    throw new Error('Missing VITE_PUBLIC_POSTHOG_PROJECT_TOKEN for server logs')
  }
  return `${host}/i/v1/logs?token=${encodeURIComponent(token)}`
}

function ensureServerLogs() {
  if (provider) return

  const token = getPostHogProjectToken()
  if (!token) return

  provider = new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': 'quill-co-api',
      'deployment.environment': import.meta.env.DEV ? 'development' : 'production',
    }),
    processors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: getLogsUrl(),
        }),
      ),
    ],
  })

  logs.setGlobalLoggerProvider(provider)
}

export function emitServerLog(
  body: string,
  options?: {
    severity?: 'info' | 'warn' | 'error'
    attributes?: Record<string, string | number | boolean>
  },
) {
  const token = getPostHogProjectToken()
  if (!token) return

  ensureServerLogs()

  const severity = options?.severity ?? 'info'
  const severityNumber =
    severity === 'error'
      ? SeverityNumber.ERROR
      : severity === 'warn'
        ? SeverityNumber.WARN
        : SeverityNumber.INFO

  logs.getLogger('quill-co-api').emit({
    severityNumber,
    severityText: severity.toUpperCase(),
    body,
    attributes: options?.attributes,
  })
}
