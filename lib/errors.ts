export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function jsonError(error: ApiError | Error, fallbackStatus = 500) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    )
  }
  return Response.json(
    {
      error: {
        code: 'internal_error',
        message: 'An unexpected error occurred.',
      },
    },
    { status: fallbackStatus },
  )
}

export function jsonOk(body: unknown, status = 200) {
  return Response.json(body, { status })
}
