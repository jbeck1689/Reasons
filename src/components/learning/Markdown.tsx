"use client";

import React from "react";

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-surface-100">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      parts.push(
        <em key={match.index} className="italic text-accent-300">
          {match[2]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let blockquote: string[] = [];

  const flushBlockquote = () => {
    if (blockquote.length > 0) {
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="border-l-4 blockquote-border pl-4 py-2 my-4 italic text-surface-400 bg-surface-850/50 rounded-r-lg"
        >
          {blockquote.map((l, i) => (
            <span key={i}>
              {renderInline(l)}
              {i < blockquote.length - 1 && <br />}
            </span>
          ))}
        </blockquote>
      );
      blockquote = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("> ")) {
      blockquote.push(line.slice(2));
      continue;
    } else {
      flushBlockquote();
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-xl font-serif font-semibold text-accent-400 mt-6 mb-2 heading-glow"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushBlockquote();

  return <div className="text-surface-300 font-serif space-y-0">{elements}</div>;
}
