import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson, apiForm } from "../api/http";

export default function BoardWrite() {
  const nav = useNavigate();

  // 입력 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");
  const [files, setFiles] = useState([]);

  const [fileInputKey, setFileInputKey] = useState(0);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 첨부파일 제한
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 60 * 1024 * 1024;
  const MAX_FILE_COUNT = 3;

  // 파일 선택 초기화
  const clearFiles = () => {
    setFiles([]);
    setFileInputKey((k) => k + 1);
  };

  // 파일 선택 처리
  const onFileChange = (e) => {
    setMsg("");

    const selected = Array.from(e.target.files || []);

    if (selected.length === 0) {
      clearFiles();
      return;
    }

    if (selected.length > MAX_FILE_COUNT) {
      setMsg(`첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`);
      clearFiles();
      return;
    }

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setMsg(`"${f.name}" 파일이 20MB를 초과했습니다.`);
        clearFiles();
        return;
      }
    }

    const totalSize = selected.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setMsg("첨부파일 전체 용량은 60MB를 초과할 수 없습니다.");
      clearFiles();
      return;
    }

    setFiles(selected);
    e.target.value = "";
  };

  // 게시글 등록
  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!title.trim()) return setMsg("제목을 입력하세요.");
    if (!content.trim()) return setMsg("내용을 입력하세요.");
    if (!postPassword.trim()) return setMsg("비밀번호를 입력하세요.");

    if (files.length > 0) {
      if (files.length > MAX_FILE_COUNT) {
        return setMsg(`첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`);
      }

      let total = 0;
      for (const f of files) {
        if (f.size > MAX_FILE_SIZE) {
          return setMsg(`"${f.name}" 파일이 20MB를 초과했습니다.`);
        }
        total += f.size;
      }
      if (total > MAX_TOTAL_SIZE) {
        return setMsg("첨부파일 전체 용량은 60MB를 초과할 수 없습니다.");
      }
    }

    try {
      setLoading(true);

      const created = await apiJson("/api/posts", "POST", {
        title,
        content,
        postPassword,
      });

      if (files.length > 0) {
        const fd = new FormData();
        fd.append("postId", String(created.id));
        for (const f of files) fd.append("files", f);

        await apiForm("/api/files/upload", "POST", fd);
      }

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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          style={{ padding: 10 }}
        />

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

          <input
            key={fileInputKey}
            type="file"
            multiple
            onChange={onFileChange}
          />

          {files.length > 0 ? (
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ opacity: 0.7, fontSize: 13 }}>{files.length}개 선택됨</span>
              <button type="button" onClick={clearFiles} style={{ padding: "6px 10px" }}>
                선택 취소
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
              파일 선택 후 등록하면 업로드됩니다.
            </div>
          )}

          {files.length > 0 && (
            <ul style={{ marginTop: 8 }}>
              {files.map((f) => (
                <li key={`${f.name}-${f.size}-${f.lastModified}`}>
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
