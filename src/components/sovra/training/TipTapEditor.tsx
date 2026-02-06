'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Undo2,
  Redo2,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Comienza a escribir...',
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none w-full focus:outline-none px-3 py-2 min-h-[200px] text-[var(--color-text-primary)] bg-[var(--color-surface)]
          [&_.ProseMirror]:text-[var(--color-text-primary)]
          [&_.ProseMirror_p]:my-2
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-3
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:my-2
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4
          [&_.ProseMirror_code]:bg-[var(--color-border)] [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:rounded
          [&_.ProseMirror_a]:text-[var(--color-primary)] [&_.ProseMirror_a]:underline
          [&_.ProseMirror_pre]:bg-[var(--color-border)] [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const buttonClasses = `
    p-2 rounded hover:bg-[var(--color-border)] transition-colors
    ${editor.isActive('bold') ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}
  `;

  const toggleButtonClasses = (isActive: boolean) => `
    p-2 rounded hover:bg-[var(--color-border)] transition-colors
    ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}
  `;

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toggleButtonClasses(editor.isActive('bold'))}
          title="Bold (Cmd+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toggleButtonClasses(editor.isActive('italic'))}
          title="Italic (Cmd+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toggleButtonClasses(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={toggleButtonClasses(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toggleButtonClasses(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toggleButtonClasses(editor.isActive('orderedList'))}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => {
            const url = prompt('Ingresa la URL:');
            if (url) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
          }}
          className={toggleButtonClasses(editor.isActive('link'))}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={toggleButtonClasses(editor.isActive('code'))}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`p-2 rounded hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-secondary)]`}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`p-2 rounded hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-secondary)]`}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="border-0"
      />
    </div>
  );
}
