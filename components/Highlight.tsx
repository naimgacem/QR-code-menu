import { findMatches } from "@/lib/text";

type Props = {
  text: string;
  query: string;
};

export function Highlight({ text, query }: Props) {
  const ranges = findMatches(text, query);
  if (ranges.length === 0) return <>{text}</>;

  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (cursor < start) out.push(<span key={`p${i}`}>{text.slice(cursor, start)}</span>);
    out.push(<mark key={`m${i}`}>{text.slice(start, end)}</mark>);
    cursor = end;
  });
  if (cursor < text.length) {
    out.push(<span key="tail">{text.slice(cursor)}</span>);
  }
  return <>{out}</>;
}
