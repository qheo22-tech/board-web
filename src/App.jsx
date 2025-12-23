import { Routes, Route, Navigate } from "react-router-dom";
import BoardList from "./pages/BoardList";
import BoardWrite from "./pages/BoardWrite";
import BoardDetail from "./pages/BoardDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardList />} />
      <Route path="/write" element={<BoardWrite />} />
      <Route path="/post/:id" element={<BoardDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
