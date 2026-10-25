import type { ReactNode } from "react";

// Markdown minimo per le risposte di Squeak AI: titoli, elenchi, codice,
// **grassetto** e `codice in linea`. Niente HTML grezzo: tutto passa da React.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-extrabold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-panel-3 px-1.5 py-0.5 font-mono text-[0.85em] text-cheese">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(
        <pre key={out.length} className="overflow-x-auto rounded-xl bg-[#0d0d10] p-3 font-mono text-xs text-ink-dim">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      out.push(
        <p key={out.length} className="pt-1 font-black text-ink">
          {inline(heading[2])}
        </p>,
      );
      i++;
      continue;
    }

    const isBullet = (l: string) => /^\s*[-*]\s+/.test(l);
    const isNumber = (l: string) => /^\s*\d+[.)]\s+/.test(l);
    if (isBullet(line) || isNumber(line)) {
      const ordered = isNumber(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? isNumber(lines[i]) : isBullet(lines[i]))) {
        items.push(lines[i].replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*]\s+/, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={out.length} className={`space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-pr`}>
          {items.map((item, k) => (
            <li key={k}>{inline(item)}</li>
          ))}
        </List>,
      );
      continue;
    }

    if (line.trim()) {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i])) para.push(lines[i++]);
      out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
      continue;
    }
    i++;
  }

  return <div className="space-y-2.5 leading-relaxed">{out}</div>;
}
