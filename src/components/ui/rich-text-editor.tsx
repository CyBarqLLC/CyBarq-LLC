"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Undo2, Redo2, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type RichTextEditorProps = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  className?: string;
  labels: { link: string; linkPrompt: string };
};

/**
 * Tiptap editor that writes sanitised-on-save HTML into a hidden input, so the
 * surrounding server action form submits it like any other field. No autosave:
 * content is stored only when the user submits.
 */
export function RichTextEditor({ name, defaultValue, placeholder, dir = "ltr", className, labels }: RichTextEditorProps) {
  const [html, setHtml] = React.useState(defaultValue ?? "");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"] }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: defaultValue ?? "",
    editorProps: { attributes: { class: "prose-cb tiptap px-4 py-3", dir } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(labels.linkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^https:\/\//i.test(url) && !/^mailto:/i.test(url)) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const tools: Array<{ icon: React.ReactNode; label: string; run: () => void; active?: () => boolean }> = editor
    ? [
        { icon: <Bold />, label: "Bold", run: () => editor.chain().focus().toggleBold().run(), active: () => editor.isActive("bold") },
        { icon: <Italic />, label: "Italic", run: () => editor.chain().focus().toggleItalic().run(), active: () => editor.isActive("italic") },
        { icon: <Heading2 />, label: "Heading 2", run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive("heading", { level: 2 }) },
        { icon: <Heading3 />, label: "Heading 3", run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive("heading", { level: 3 }) },
        { icon: <List />, label: "Bullet list", run: () => editor.chain().focus().toggleBulletList().run(), active: () => editor.isActive("bulletList") },
        { icon: <ListOrdered />, label: "Numbered list", run: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive("orderedList") },
        { icon: <Quote />, label: "Quote", run: () => editor.chain().focus().toggleBlockquote().run(), active: () => editor.isActive("blockquote") },
        { icon: <Minus />, label: "Rule", run: () => editor.chain().focus().setHorizontalRule().run() },
        { icon: <Link2 />, label: labels.link, run: setLink, active: () => editor.isActive("link") },
        { icon: <Undo2 />, label: "Undo", run: () => editor.chain().focus().undo().run() },
        { icon: <Redo2 />, label: "Redo", run: () => editor.chain().focus().redo().run() },
      ]
    : [];

  return (
    <div className={cn("border border-fog bg-white", className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-fog p-1" role="toolbar" aria-label="Formatting">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.run}
            aria-label={t.label}
            aria-pressed={t.active?.() ?? undefined}
            className={cn("touch flex items-center justify-center text-slate hover:bg-surface hover:text-graphite [&_svg]:size-4", t.active?.() && "bg-ice text-graphite")}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
