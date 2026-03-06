"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useCallback, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Finding } from "@/lib/types";

type DocumentEditorProps = {
  content: string;
  pendingSuggestion: Finding | null;
  onSuggestionApplied: () => void;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors cursor-pointer",
        active
          ? "bg-accent/15 text-accent"
          : "text-text-muted hover:text-text-secondary hover:bg-surface-elevated",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

export default function DocumentEditor({
  content,
  pendingSuggestion,
  onSuggestionApplied,
}: DocumentEditorProps) {
  const appliedRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full px-8 py-6",
      },
    },
  });

  const insertSuggestion = useCallback(
    (finding: Finding) => {
      if (!editor) return;

      const locationText = finding.location?.toLowerCase() ?? "";
      const doc = editor.state.doc;
      let targetPos: number | null = null;

      doc.descendants((node, pos) => {
        if (targetPos !== null) return false;
        if (node.isText) return false;

        const text = node.textContent.toLowerCase();

        if (finding.pageNumber) {
          const sectionNum = finding.pageNumber.toString();
          if (
            node.type.name === "heading" &&
            text.includes(`${sectionNum}.`)
          ) {
            targetPos = pos + node.nodeSize;
            return false;
          }
        }

        if (
          locationText.includes("page") &&
          node.type.name === "heading"
        ) {
          const pageMatch = locationText.match(/page\s*(\d+)/i);
          if (pageMatch) {
            const sectionNum = pageMatch[1];
            if (text.includes(`${sectionNum}.`)) {
              targetPos = pos + node.nodeSize;
              return false;
            }
          }
        }

        return true;
      });

      if (targetPos === null) {
        targetPos = doc.content.size;
      }

      const suggestionHtml =
        `<p><mark data-color="#fef9c3">[${finding.id}] ${finding.suggestedResolution}</mark></p>`;

      editor
        .chain()
        .focus()
        .insertContentAt(targetPos, suggestionHtml)
        .run();
    },
    [editor],
  );

  useEffect(() => {
    if (
      pendingSuggestion &&
      editor &&
      appliedRef.current !== pendingSuggestion.id
    ) {
      appliedRef.current = pendingSuggestion.id;
      requestAnimationFrame(() => {
        insertSuggestion(pendingSuggestion);
        onSuggestionApplied();
      });
    }
  }, [pendingSuggestion, editor, insertSuggestion, onSuggestionApplied]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-surface shrink-0 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Paragraph"
        >
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={15} />
        </ToolbarButton>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto bg-bg">
        <div className="max-w-[800px] mx-auto min-h-full bg-surface border-x border-border shadow-sm">
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      </div>
    </div>
  );
}
