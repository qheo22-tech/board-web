// api/http.js

export class ApiError extends Error {
  constructor({ status, code, message, path }) {
    super(message || `요청 실패 (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.path = path;
  }
}

// fetch 실패(네트워크 오류) 처리
async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, {
      credentials: "include", // 
      ...options,
    });
  } catch (e) {
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "네트워크 오류가 발생했습니다.",
      path: url,
    });
  }
}

// 응답 파싱 유틸
async function readTextSafe(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// HTTP 에러 → ApiError 변환
async function toApiError(res, fallbackMessage) {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const j = await readJsonSafe(res);
    if (j && (j.code || j.message || j.status)) {
      return new ApiError({
        status: j.status ?? res.status,
        code: j.code ?? "HTTP_ERROR",
        message: j.message ?? fallbackMessage ?? `요청 실패 (${res.status})`,
        path: j.path ?? "",
      });
    }
  }

  const t = await readTextSafe(res);
  return new ApiError({
    status: res.status,
    code: "HTTP_ERROR",
    message: t || fallbackMessage || `요청 실패 (${res.status})`,
    path: "",
  });
}

// 공통 HTTP 요청 유틸
export async function apiGet(url) {
  const res = await safeFetch(url , { method: "GET" });

  if (!res.ok) {
    throw await toApiError(res, `GET 실패: ${res.status}`);
  }

  return res.json().catch(() => ({}));
}


export async function apiJson(url, method, bodyObj) {
  const hasBody = bodyObj !== undefined && bodyObj !== null;

  const res = await safeFetch(url, {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(bodyObj) : undefined,
  });

  if (!res.ok) {
    throw await toApiError(res, `${method} 실패: ${res.status}`);
  }

  return res.json().catch(() => ({}));
}


export async function apiForm(url, method, formData) {
  const res = await safeFetch(url, { method, body: formData });

  if (!res.ok) {
    throw await toApiError(res, `${method} 실패: ${res.status}`);
  }

  return res.json().catch(() => ({}));
}
