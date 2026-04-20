const ENV_USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true'
const ENV_API_REAL = import.meta.env.VITE_API_URL_REAL || 'http://localhost:3000/api'
const ENV_API_MOCK = import.meta.env.VITE_API_URL_MOCK || 'http://localhost:3100/api'

const PER_ENDPOINT_OVERRIDE = {
}

export function getApiConfig() {
  return {
    useMock: ENV_USE_MOCK,
    realUrl: ENV_API_REAL,
    mockUrl: ENV_API_MOCK,
    perEndpoint: PER_ENDPOINT_OVERRIDE
  }
}

export function shouldUseMock(endpoint) {
  const override = PER_ENDPOINT_OVERRIDE[endpoint]
  if (override !== undefined) return override
  return ENV_USE_MOCK
}

export function getApiUrl(endpoint) {
  const useMock = shouldUseMock(endpoint)
  return useMock ? ENV_API_MOCK : ENV_API_REAL
}

export function setPerEndpointOverride(endpoint, useMock) {
  PER_ENDPOINT_OVERRIDE[endpoint] = useMock
}

export function resetOverrides() {
  Object.keys(PER_ENDPOINT_OVERRIDE).forEach(key => {
    delete PER_ENDPOINT_OVERRIDE[key]
  })
}
