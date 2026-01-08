import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiJson, ApiError } from "../api/http";
import { formatDateTime } from "../utils/date";

export default function BoardList() {
  const nav = useNavigate();

  // 게시글 목록
  const [posts, setPosts] = useState([]);

  // 조회 에러 메시지
  const [err, setErr] = useState("");

  // 헬스체크 결과(겸 상태 메시지)
  const [pingResult, setPingResult] = useState("");

  // 로그인 모달 상태
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginErr, setLoginErr] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [me, setMe] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });

  // 글 상태 업데이트 중 표시(버튼 중복클릭 방지)
  const [busyId, setBusyId] = useState(null);

  // 세션(로그인) 상태 복구: 새로고침해도 me 복원
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await apiGet("/api/auth/me");
        if (alive) setMe(data);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          if (alive) setMe(null);
          return;
        }
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 게시글 목록 조회
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const data = await apiGet("/api/posts");
        if (alive) setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isDeleted = (p) => !!p.deletedAt;

  // 일반사용자: 삭제(deletedAt!=null) 글은 숨김
  // 관리자(me 존재): 삭제 표시 포함 전체 노출(백엔드가 전체를 내려줌)
  const visiblePosts = useMemo(() => {
    if (me) return posts;
    return posts.filter((p) => !isDeleted(p));
  }, [posts, me]);

  // 서버 헬스체크
  const handlePing = async () => {
    try {
      setPingResult("요청 중...");
      const res = await apiGet("/api/posts/ping");
      setPingResult(`성공: ${res?.message ?? "OK"}`);
    } catch (e) {
      setPingResult(`실패: ${e.message}`);
    }
  };

  // 로그인 요청
  const handleLogin = async () => {
    const fe = {
      username: loginForm.username.trim() ? "" : "아이디를 입력하세요.",
      password: loginForm.password ? "" : "비밀번호를 입력하세요.",
    };
    setFieldErrors(fe);
    if (fe.username || fe.password) return;

    try {
      setLoginErr("");
      setLoginBusy(true);

      const data = await apiJson("/api/auth/login", "POST", loginForm);

      setMe(data);
      setShowLogin(false);
      setLoginForm({ username: "", password: "" });
      setPingResult(`로그인 성공: ${data?.username ?? "OK"}`);
    } catch (e) {
      setLoginErr(e.message);
    } finally {
      setLoginBusy(false);
    }
  };

  const closeLogin = () => {
    if (loginBusy) return;
    setShowLogin(false);
    setLoginErr("");
  };

  // 로그아웃 + 세션끊기
  const handleLogout = async () => {
    try {
      await apiJson("/api/auth/logout", "POST");
    } catch (e) {
      // 무시하고 로컬 상태는 끊어줌
    } finally {
      setMe(null);
      setPingResult("로그아웃 완료");
    }
  };

  // 삭제/복구 토글 (관리자만)
  // PATCH /api/posts/:id/deleted  body: { deleted: true/false }
  const toggleDeleted = async (post) => {
    if (!me) return;

    const next = !isDeleted(post); // true=삭제, false=복구

    try {
      setBusyId(post.id);
      setPingResult("");

      const updated = await apiJson(`/api/posts/${post.id}/deleted`, "PATCH", {
        deleted: next,
      });

      // 응답이 updated PostDto면 merged, 아니면 로컬만 반영
      if (updated && typeof updated === "object") {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, ...updated } : p))
        );
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, deletedAt: next ? new Date().toISOString() : null } : p
          )
        );
      }

      setPingResult(next ? "삭제 처리 완료" : "복구 완료");
    } catch (e) {
      setPingResult(`상태 변경 실패: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>게시판</h1>

        <div style={{ display: "flex", gap: 8 }}>
          {me ? (
            <button onClick={handleLogout} style={{ padding: "10px 14px" }}>
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              style={{ padding: "10px 14px" }}
            >
              로그인
            </button>
          )}

          <button onClick={handlePing} style={{ padding: "10px 14px" }}>
            핑 테스트
          </button>

          <button onClick={() => nav("/write")} style={{ padding: "10px 14px" }}>
            글쓰기
          </button>
        </div>
      </header>

      {pingResult && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#eef5ff",
            fontSize: 14,
          }}
        >
          {pingResult}
        </div>
      )}

      {err && (
        <div style={{ marginTop: 12, padding: 12, background: "#fdecec" }}>
          {err}
        </div>
      )}

      <div style={{ marginTop: 16, borderTop: "1px solid #ddd" }}>
        {visiblePosts.length === 0 ? (
          <div style={{ padding: 16, opacity: 0.7 }}>게시글이 없습니다.</div>
        ) : (
          visiblePosts.map((p) => (
            <div
              key={p.id}
              onClick={() => nav(`/post/${p.id}`)}
              style={{
                padding: "12px 8px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                opacity: me && isDeleted(p) ? 0.45 : 1,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>
                  {p.title} {me && isDeleted(p) ? "(삭제됨)" : ""}
                </span>
                {p.hasFiles && <span title="첨부 있음">📎</span>}
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  {formatDateTime(p.createdAt)}
                </div>

                {/* 관리자만: 삭제/복구 토글 */}
                {me && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDeleted(p);
                    }}
                    disabled={busyId === p.id}
                    style={{ padding: "6px 10px" }}
                  >
                    {busyId === p.id ? "처리중..." : isDeleted(p) ? "복구" : "삭제"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 로그인 모달 */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
          onClick={closeLogin}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>관리자 로그인</h2>
              <button onClick={closeLogin} disabled={loginBusy}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  placeholder="username"
                  value={loginForm.username}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLoginForm((p) => ({ ...p, username: v }));
                    if (fieldErrors.username) {
                      setFieldErrors((p) => ({ ...p, username: "" }));
                    }
                  }}
                  style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                />
                {fieldErrors.username && (
                  <div style={{ color: "#c00", fontSize: 12 }}>
                    {fieldErrors.username}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <input
                  placeholder="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLoginForm((p) => ({ ...p, password: v }));
                    if (fieldErrors.password) {
                      setFieldErrors((p) => ({ ...p, password: "" }));
                    }
                  }}
                  style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loginBusy) handleLogin();
                  }}
                />
                {fieldErrors.password && (
                  <div style={{ color: "#c00", fontSize: 12 }}>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {loginErr && (
                <div style={{ padding: 10, background: "#fdecec", borderRadius: 8 }}>
                  {loginErr}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loginBusy}
                style={{ padding: "10px 14px" }}
              >
                {loginBusy ? "로그인 중..." : "로그인"}
              </button>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                * 세션 기반 로그인 (쿠키 포함 요청)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
