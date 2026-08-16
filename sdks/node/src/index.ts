export type ContentState = Record<string, unknown>

export type UpdateOptions = {
  alert?: {
    title?: string
    body?: string
    sound?: string
  }
  staleDate?: number
  relevanceScore?: number
}

export type EndOptions = {
  dismissalDate?: number
}

export type DeliveryResult = {
  id: string
  activity_id: string
  status: 'queued' | 'sent' | 'failed'
}

export type ActivityResult = {
  id: string
  type: string | null
  status: string
  created_at: string
  updated_at: string
  ended_at?: string | null
  expires_at: string | null
}

export type LiveHiveOptions = {
  apiKey: string
  baseUrl?: string
  fetch?: typeof fetch
}

export class LiveHiveError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, init?: { status?: number; code?: string; details?: unknown }) {
    super(message)
    this.name = 'LiveHiveError'
    this.status = init?.status
    this.code = init?.code
    this.details = init?.details
  }
}

const DEFAULT_BASE_URL = 'https://api.livehive.dev/v1'

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

export class LiveHive {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  readonly activities: {
    update: (
      activityId: string,
      contentState: ContentState,
      options?: UpdateOptions,
    ) => Promise<DeliveryResult>
    end: (
      activityId: string,
      contentState?: ContentState,
      options?: EndOptions,
    ) => Promise<DeliveryResult>
    get: (activityId: string) => Promise<ActivityResult>
  }

  constructor(options: LiveHiveOptions) {
    const apiKey = options.apiKey?.trim()
    if (!apiKey) {
      throw new LiveHiveError('Missing Live Hive API key.')
    }
    if (apiKey.startsWith('lh_pub_')) {
      throw new LiveHiveError(
        'The Node SDK requires a server API key (lh_live_...). Public iOS keys cannot update or end activities.',
      )
    }
    if (!apiKey.startsWith('lh_live_')) {
      throw new LiveHiveError('API key format is invalid. Expected a key starting with lh_live_.')
    }
    this.apiKey = apiKey
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL)
    this.fetchImpl = options.fetch ?? fetch
    this.activities = {
      update: this.update.bind(this),
      end: this.end.bind(this),
      get: this.get.bind(this),
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const text = await response.text()
    let json: unknown = null
    if (text) {
      try {
        json = JSON.parse(text) as unknown
      } catch {
        json = { raw: text }
      }
    }

    if (!response.ok) {
      const errorBody = json as { error?: { code?: string; message?: string; details?: unknown } } | null
      throw new LiveHiveError(errorBody?.error?.message || `Live Hive request failed (${response.status}).`, {
        status: response.status,
        code: errorBody?.error?.code,
        details: errorBody?.error?.details ?? json,
      })
    }

    return json as T
  }

  private async update(
    activityId: string,
    contentState: ContentState,
    options?: UpdateOptions,
  ): Promise<DeliveryResult> {
    return this.request<DeliveryResult>(
      'POST',
      `/activities/${encodePathSegment(activityId)}/update`,
      {
        content_state: contentState,
        alert: options?.alert,
        stale_date: options?.staleDate,
        relevance_score: options?.relevanceScore,
      },
    )
  }

  private async end(
    activityId: string,
    contentState?: ContentState,
    options?: EndOptions,
  ): Promise<DeliveryResult> {
    const body =
      contentState || options?.dismissalDate != null
        ? {
            content_state: contentState,
            dismissal_date: options?.dismissalDate,
          }
        : {}
    return this.request<DeliveryResult>(
      'POST',
      `/activities/${encodePathSegment(activityId)}/end`,
      body,
    )
  }

  private async get(activityId: string): Promise<ActivityResult> {
    return this.request<ActivityResult>('GET', `/activities/${encodePathSegment(activityId)}`)
  }
}

export default LiveHive
