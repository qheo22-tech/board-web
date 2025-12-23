import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/http";

export default function BoardList() {
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");
  const [pingResult, setPingResult] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await apiGet("/api/posts");
        setPosts(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  // ✅ 핑 테스트용 API 호출
  const handlePing = async () => {
    try {
      setPingResult("요청 중...");
      const res = await apiGet("/api/posts/ping");
      setPingResult(`성공: ${res.message ?? res}`);
    } catch (e) {
      setPingResult(`실패: ${e.message}`);
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
          {/* ✅ 핑 테스트 버튼 */}
          <button onClick={handlePing} style={{ padding: "10px 14px" }}>
            핑 테스트
          </button>

          <button onClick={() => nav("/write")} style={{ padding: "10px 14px" }}>
            글쓰기
          </button>
        </div>
      </header>

      {/* 핑 결과 표시 */}
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
        {posts.map((p) => (
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
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>{p.title}</span>
              {p.hasFiles && <span title="첨부 있음">📎</span>}
            </div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>{p.createdAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
