import { API_BASE_URL } from '../config/env'
import type { ApiErrorResponse, ApiResponse } from '../types/api'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[] | string>

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[] | string>,
  ) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'errors' in value || 'message' in value
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const token = localStorage.getItem('auth_token')

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? (body as BodyInit)
        : JSON.stringify(body)
      : undefined,
  })

  const result = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    if (isApiErrorResponse(result)) {
      throw new ApiError(
        result.message || 'Request failed.',
        response.status,
        result.errors,
      )
    }

    throw new ApiError('Request failed.', response.status)
  }

  const successResult = result as ApiResponse<T>

  return successResult.data
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body?: unknown, isFormData = false): Promise<T> {
    return request<T>('POST', path, body, isFormData)
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body)
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PATCH', path, body)
  },

  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path)
  },
}