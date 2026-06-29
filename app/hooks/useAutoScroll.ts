import { useRef ,useEffect} from "react";
import PagerView from "react-native-pager-view";

export function UseAutoScroll(
  pagerRef: React.RefObject<PagerView | null>,
  totalPages: number,
  intervalMs: number,
  setCurrentPage: (page: number) => void,
) {
  const currentPageRef = useRef(0);

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      const next = (currentPageRef.current + 1) % totalPages;
      pagerRef.current?.setPage(next);
      currentPageRef.current = next;
      // setState only for dot-indicator rendering — NOT for interval logic
      setCurrentPage(next);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [totalPages, intervalMs]); // does NOT depend on currentPage → no restart cascade
}