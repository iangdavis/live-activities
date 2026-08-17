import { CANONICAL_API_BASE } from './api-contract'

const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: {},
      },
    },
  },
} as const

const contentState = {
  type: 'object',
  additionalProperties: true,
  description:
    'Opaque JSON matching the widget ContentState. Live Hive does not transform it.',
} as const

const delivery = {
  type: 'object',
  required: ['id', 'activity_id', 'status'],
  properties: {
    id: { type: 'string' },
    activity_id: { type: 'string' },
    status: { type: 'string', enum: ['queued', 'sent', 'failed'] },
  },
} as const

const activity = {
  type: 'object',
  required: ['id', 'status', 'created_at', 'updated_at'],
  properties: {
    id: { type: 'string', description: 'Your activity_id' },
    type: { type: 'string', nullable: true },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    ended_at: { type: 'string', format: 'date-time', nullable: true },
    expires_at: { type: 'string', format: 'date-time', nullable: true },
  },
} as const

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: errorSchema,
    },
  },
})

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Live Hive API',
    version: '1.0.0',
    summary: 'Register iOS Live Activities from the app. Update and end them over HTTP.',
    description:
      'iOS SDK registers push tokens. Backends call update and end with a secret key. There is no server SDK. Canonical base: https://api.livehive.dev/v1. See https://livehive.dev/llms.txt',
  },
  servers: [{ url: CANONICAL_API_BASE }],
  tags: [
    { name: 'Golden path' },
    { name: 'Optional' },
  ],
  components: {
    securitySchemes: {
      publicKey: {
        type: 'http',
        scheme: 'bearer',
        description: 'iOS public key starting with lh_pub_. Register only.',
      },
      secretKey: {
        type: 'http',
        scheme: 'bearer',
        description: 'Server secret key starting with lh_live_. Never put this in the iOS app.',
      },
    },
    schemas: {
      Error: errorSchema,
      ContentState: contentState,
      Delivery: delivery,
      Activity: activity,
    },
  },
  paths: {
    '/activities/register': {
      post: {
        tags: ['Golden path'],
        operationId: 'registerActivity',
        summary: 'Register an ActivityKit push token',
        description:
          'Called by the iOS SDK. Upserts by (project, activity_id). Prefer LiveHive.register(activity) over calling this yourself.',
        security: [{ publicKey: [] }, { secretKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['activity_id', 'push_token'],
                properties: {
                  activity_id: { type: 'string', minLength: 1, maxLength: 200 },
                  push_token: {
                    type: 'string',
                    minLength: 16,
                    maxLength: 400,
                    description: 'Lowercase hex ActivityKit push token',
                  },
                  type: { type: 'string', maxLength: 80 },
                  expires_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registered. Does not include the push token.',
            content: { 'application/json': { schema: activity } },
          },
          '400': errorResponse('invalid_json / invalid_request'),
          '401': errorResponse('unauthorized / invalid_api_key'),
          '403': errorResponse('plan_limit'),
          '429': errorResponse('rate_limited'),
        },
      },
    },
    '/activities/{activity_id}/update': {
      post: {
        tags: ['Golden path'],
        operationId: 'updateActivity',
        summary: 'Push a content-state update via APNs',
        security: [{ secretKey: [] }],
        parameters: [
          {
            name: 'activity_id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Your ID. Same value used at register.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content_state'],
                properties: {
                  content_state: contentState,
                  alert: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', maxLength: 200 },
                      body: { type: 'string', maxLength: 400 },
                      sound: { type: 'string', maxLength: 80 },
                    },
                  },
                  stale_date: { type: 'integer', description: 'Unix seconds' },
                  relevance_score: { type: 'number', minimum: 0, maximum: 1 },
                },
              },
              example: {
                content_state: { status: 'driver_arriving', eta: 4 },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Delivery attempt. status may be failed even on HTTP 200.',
            content: { 'application/json': { schema: delivery } },
          },
          '400': errorResponse('invalid_json / invalid_request / apns_not_configured'),
          '401': errorResponse('unauthorized / invalid_api_key'),
          '403': errorResponse('forbidden / plan_limit'),
          '404': errorResponse('activity_not_found'),
          '409': errorResponse('activity_ended'),
          '429': errorResponse('rate_limited'),
        },
      },
    },
    '/activities/{activity_id}/end': {
      post: {
        tags: ['Golden path'],
        operationId: 'endActivity',
        summary: 'End a Live Activity',
        security: [{ secretKey: [] }],
        parameters: [
          {
            name: 'activity_id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content_state: contentState,
                  dismissal_date: { type: 'integer', description: 'Unix seconds' },
                },
              },
              example: {
                content_state: { status: 'delivered', eta: 0 },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'End delivery attempt.',
            content: { 'application/json': { schema: delivery } },
          },
          '400': errorResponse('invalid_json / invalid_request / apns_not_configured'),
          '401': errorResponse('unauthorized / invalid_api_key'),
          '403': errorResponse('forbidden / plan_limit'),
          '404': errorResponse('activity_not_found'),
          '409': errorResponse('activity_ended'),
          '429': errorResponse('rate_limited'),
        },
      },
    },
    '/activities/{activity_id}': {
      get: {
        tags: ['Optional'],
        operationId: 'getActivity',
        summary: 'Read activity metadata (no push token)',
        security: [{ secretKey: [] }],
        parameters: [
          {
            name: 'activity_id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Metadata only.',
            content: { 'application/json': { schema: activity } },
          },
          '401': errorResponse('unauthorized / invalid_api_key'),
          '403': errorResponse('forbidden'),
          '404': errorResponse('activity_not_found'),
        },
      },
    },
    '/activities': {
      post: {
        tags: ['Optional'],
        operationId: 'createActivityLegacy',
        summary: 'Legacy secret-key create. Do not use in new integrations.',
        deprecated: true,
        security: [{ secretKey: [] }],
        description:
          'Secret key only. New integrations register from iOS via POST /v1/activities/register or the iOS SDK.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['activity_id', 'push_token'],
                properties: {
                  activity_id: { type: 'string' },
                  push_token: { type: 'string' },
                  type: { type: 'string' },
                  expires_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created.',
            content: { 'application/json': { schema: activity } },
          },
          '401': errorResponse('unauthorized / invalid_api_key'),
          '403': errorResponse('forbidden'),
        },
      },
    },
  },
} as const

export function openApiResponse(): Response {
  return Response.json(openApiDocument, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
