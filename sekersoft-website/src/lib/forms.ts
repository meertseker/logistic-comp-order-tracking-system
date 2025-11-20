const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export class FormSubmissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FormSubmissionError'
  }
}

interface SubmitOptions {
  endpoint: string
  payload: Record<string, unknown>
}

export const submitLeadForm = async ({ endpoint, payload }: SubmitOptions) => {
  if (!endpoint) {
    throw new FormSubmissionError('Form uç noktası yapılandırılmamış.')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
  })

  let body: Record<string, unknown> | undefined
  try {
    body = (await response.json()) as Record<string, unknown>
  } catch {
    body = undefined
  }

  if (!response.ok) {
    const message =
      (typeof body?.error === 'string' && body.error) ||
      (typeof body?.message === 'string' && body.message) ||
      'Form gönderilirken bir sorun oluştu.'
    throw new FormSubmissionError(message)
  }

  return body
}

