// 공통 HTTP 요청 유틸
// - apiGet  : GET 요청 전용
// - apiJson : JSON 요청/응답 (POST, PUT 등)
// - apiForm : multipart/form-data (파일 업로드)
export async function apiGet(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`GET 실패: ${res.status}`);
  }

  return res.json();
}

export async function apiJson(url, method, bodyObj) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  });

  // 실패 시 응답 타입에 따라 에러 메시지 파싱
  if (!res.ok) {
    let msg = `${method} 실패: ${res.status}`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        msg = j.message || j.error || msg;
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch {
      // 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(msg);
  }

  // 응답 본문이 없는 경우 {} 반환
  return res.json().catch(() => ({}));
}

export async function apiForm(url, method, formData) {
  // multipart/form-data는 Content-Type을 직접 지정하지 않음
  // (브라우저가 boundary를 포함해 자동 설정)
  const res = await fetch(url, { method, body: formData });

  if (!res.ok) {
    throw new Error(`${method} 실패: ${res.status}`);
  }

  return res.json().catch(() => ({}));
}
