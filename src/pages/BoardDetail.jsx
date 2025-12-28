import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PasswordModal from "../components/PasswordModal";
import { apiGet, apiJson, apiForm } from "../api/http";
import { formatDateTime } from "../utils/date";

export default function BoardDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");

  // 비밀번호 모달 상태
  const [pwModal, setPwModal] = useState({ open: false, mode: null, fileId: null });
  // mode: 'delete' | 'edit-open' | 'edit-save' | 'file-delete' | 'file-upload'

  // 수정 모드
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });

  // 업로드 파일
  const [uploadFiles, setUploadFiles] = useState([]);

  // 첨부파일 제한
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 60 * 1024 * 1024;
  const MAX_FILE_COUNT = 3;

  // 게시글 상세 조회
  const load = async () => {
    const data = await apiGet(`/api/posts/${id}`);
    setPost(data);
    setDraft({ title: data?.title ?? "", content: data?.content ?? "" });
  };

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await load();
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  // 게시글 삭제
  const requestDelete = () => setPwModal({ open: true, mode: "delete", fileId: null });

  // 파일 삭제
  const requestFileDelete = (fileId) => setPwModal({ open: true, mode: "file-delete", fileId });

  // 수정 진입
  const requestEdit = () => {
    setDraft({ title: post?.title ?? "", content: post?.content ?? "" });
    setPwModal({ open: true, mode: "edit-open", fileId: null });
  };

  // 수정 취소
  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({ title: post?.title ?? "", content: post?.content ?? "" });
  };

  // 파일 선택 처리
  const onPickFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (selected.length > MAX_FILE_COUNT) {
      alert(`첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`);
      e.target.value = "";
      return;
    }

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        alert(`"${f.name}" 파일이 20MB를 초과했습니다.`);
        e.target.value = "";
        return;
      }
    }

    const totalSize = selected.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("첨부파일 전체 용량은 60MB를 초과할 수 없습니다.");
      e.target.value = "";
      return;
    }

    setUploadFiles(selected);
    setPwModal({ open: true, mode: "file-upload", fileId: null });
    e.target.value = "";
  };

  // 비밀번호 확인 후 작업 수행
  const onConfirmPassword = async (pw) => {
    try {
      if (!pw?.trim()) return alert("비밀번호를 입력하세요.");

      await apiJson(`/api/posts/${id}/verify-password`, "POST", { postPassword: pw });

      if (pwModal.mode === "delete") {
        const ok = window.confirm("정말로 삭제하시겠습니까?");
        if (!ok) return;

        await apiJson(`/api/posts/${id}/delete`, "POST", { postPassword: pw });
        setPwModal({ open: false, mode: null, fileId: null });
        nav("/");
        return;
      }

      if (pwModal.mode === "edit-open") {
        setPwModal({ open: false, mode: null, fileId: null });
        setIsEditing(true);
        return;
      }

      if (pwModal.mode === "edit-save") {
        if (!draft.title.trim()) return alert("제목을 입력하세요.");
        if (!draft.content.trim()) return alert("내용을 입력하세요.");

        await apiJson(`/api/posts/${id}/update`, "POST", {
          title: draft.title,
          content: draft.content,
          postPassword: pw,
        });

        setPwModal({ open: false, mode: null, fileId: null });
        setIsEditing(false);
        await load();
        alert("수정 완료");
        return;
      }

      if (pwModal.mode === "file-delete") {
        const ok = window.confirm("이 파일을 삭제하시겠습니까?");
        if (!ok) return;

        const fileId = pwModal.fileId;
        if (!fileId) return alert("파일 정보가 없습니다.");

        await apiJson(`/api/files/${fileId}/delete`, "POST", { postPassword: pw });

        setPwModal({ open: false, mode: null, fileId: null });
        await load();
        alert("파일 삭제 완료");
        return;
      }

      if (pwModal.mode === "file-upload") {
        if (!uploadFiles?.length) return alert("업로드할 파일을 선택하세요.");

        if (uploadFiles.length > MAX_FILE_COUNT) {
          return alert(`첨부파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`);
        }

        let total = 0;
        for (const f of uploadFiles) {
          if (f.size > MAX_FILE_SIZE) {
            return alert(`"${f.name}" 파일이 20MB를 초과했습니다.`);
          }
          total += f.size;
        }
        if (total > MAX_TOTAL_SIZE) {
          return alert("첨부파일 전체 용량은 60MB를 초과할 수 없습니다.");
        }

        const fd = new FormData();
        fd.append("postId", String(id));
        for (const f of uploadFiles) fd.append("files", f);

        await apiForm("/api/files/upload", "POST", fd);

        setPwModal({ open: false, mode: null, fileId: null });
        setUploadFiles([]);
        await load();
        alert("파일 업로드 완료");
        return;
      }
    } catch (e) {
      alert(e.message || "요청 처리 중 오류");
    }
  };

  if (err) return <div style={{ padding: 24 }}>{err}</div>;
  if (!post) return <div style={{ padding: 24 }}>로딩중...</div>;

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
        {isEditing ? (
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            style={{ flex: 1, fontSize: 24, fontWeight: 700 }}
          />
        ) : (
          <h1 style={{ margin: 0 }}>{post.title}</h1>
        )}
        <button onClick={() => nav("/")} style={{ padding: "10px 14px" }}>
          목록
        </button>
      </header>

      <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
        {formatDateTime(post.createdAt)}
      </div>

      <div style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {isEditing ? (
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
            rows={12}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        ) : (
          post.content
        )}
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>첨부파일</h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <input type="file" multiple onChange={onPickFiles} />
          {uploadFiles?.length ? (
            <span style={{ opacity: 0.7, fontSize: 13 }}>{uploadFiles.length}개 선택됨</span>
          ) : (
            <span style={{ opacity: 0.7, fontSize: 13 }}>
              파일 선택 후 비밀번호 확인하면 업로드됩니다.
            </span>
          )}
        </div>

        {post.files?.length ? (
          <ul>
            {post.files.map((f) => (
              <li key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a href={`/api/files/${f.id}/download`}>{f.originalName}</a>

                <a
                  href={`/api/files/${f.id}/download`}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  다운로드
                </a>

                <button onClick={() => requestFileDelete(f.id)}>파일삭제</button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ opacity: 0.7 }}>첨부 없음</div>
        )}
      </section>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {!isEditing ? (
          <>
            <button onClick={requestEdit}>수정</button>
            <button onClick={requestDelete}>삭제</button>
          </>
        ) : (
          <>
            <button onClick={() => setPwModal({ open: true, mode: "edit-save", fileId: null })}>
              저장
            </button>
            <button onClick={cancelEdit}>취소</button>
          </>
        )}
      </div>

      <PasswordModal
        open={pwModal.open}
        title={
          pwModal.mode === "delete"
            ? "삭제 비밀번호 입력"
            : pwModal.mode === "file-delete"
            ? "파일 삭제 비밀번호 입력"
            : pwModal.mode === "file-upload"
            ? "파일 업로드 비밀번호 입력"
            : "수정 비밀번호 입력"
        }
        onClose={() => {
          setPwModal({ open: false, mode: null, fileId: null });
          setUploadFiles([]);
        }}
        onConfirm={onConfirmPassword}
      />
    </div>
  );
}
