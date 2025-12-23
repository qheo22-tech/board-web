import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiForm } from "../api/http";

export default function BoardWrite() {

  const nav = useNavigate();

  // 입력 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");


  // 첨부 파일 목록 (File 객체 배열)
  const [files, setFiles] = useState([]);


  // UX 상태 (중복 제출 방지 / 사용자 메시지 표시)
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!title.trim()) return setMsg("제목을 입력하세요.");
    if (!content.trim()) return setMsg("내용을 입력하세요.");
    if (!postPassword.trim()) return setMsg("비밀번호를 입력하세요.");

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("postPassword", postPassword);
      for (const f of files) fd.append("files", f);

      // ✅ 실제 백엔드 호출
      const created = await apiForm("/api/posts", "POST", fd);

      // created = { id: ... } 형태 기대
      nav(`/post/${created.id}`);
    } catch (e2) {
      setMsg(e2?.message || "등록 중 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>글쓰기</h1>
        <button type="button" onClick={() => nav("/")} style={{ padding: "10px 14px" }}>
          목록
        </button>
      </header>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" style={{ padding: 10 }} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={10}
          style={{ padding: 10, resize: "vertical" }}
        />
        <input
          value={postPassword}
          onChange={(e) => setPostPassword(e.target.value)}
          placeholder="비밀번호 (수정/삭제에 사용)"
          type="password"
          style={{ padding: 10 }}
        />

        <div>
          <div style={{ marginBottom: 6, fontWeight: 600 }}>첨부파일</div>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          {files.length > 0 && (
            <ul style={{ marginTop: 8 }}>
              {files.map((f) => (
                <li key={f.name}>
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </li>
              ))}
            </ul>
          )}
        </div>

        <button disabled={loading} style={{ padding: 12 }}>
          {loading ? "등록 중..." : "등록"}
        </button>

        {msg && <div style={{ padding: 12, background: "#fdecec" }}>{msg}</div>}
      </form>
    </div>
  );
}
