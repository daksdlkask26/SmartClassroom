// Gọi REST /api (contract mục 5.5). Lỗi thống nhất: { error: { code, message } }.

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(method, path, body, { signal } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK', 'Không kết nối được tới máy chủ');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // thân rỗng hoặc không phải JSON
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code ?? `HTTP_${res.status}`, data?.error?.message ?? res.statusText);
  }
  return data;
}

export const getJSON = (path, opts) => request('GET', path, undefined, opts);
export const postJSON = (path, body, opts) => request('POST', path, body, opts);
