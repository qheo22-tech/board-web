import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// 플러그인 등록
dayjs.extend(utc);
dayjs.extend(timezone);

// 공통 포맷 함수
export function formatDateTime(isoString) {
  if (!isoString) return "";

  return dayjs(isoString)
    .tz(dayjs.tz.guess())          // 브라우저 기준 타임존 (해외 대응)
    .format("YYYY-MM-DD HH:mm:ss"); // T, ms, Z 제거
}
