import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState, useRef } from "react";
import "./markdown-styles.css";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
  showLineNumbers?: boolean;
}

const MarkdownEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
  autoFocus = false,
  showToolbar = true,
  showLineNumbers = false,
}: MarkdownEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: "paragraph",
        },
      }),
      Text,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "heading",
        },
      }),
      StarterKit.configure({
        heading: false,
        document: false,
        paragraph: false,
        text: false,
        bulletList: {
          HTMLAttributes: {
            class: "bullet-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "ordered-list",
          },
        },
        code: {
          HTMLAttributes: {
            class: "inline-code",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "code-block",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "blockquote",
          },
        },
      }),
      Highlight,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[200px] p-4 rounded-md markdown-editor",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      // Count lines for line numbers
      if (showLineNumbers) {
        const text = editor.getText();
        const lines = text.split("\n").length;
        setLineCount(Math.max(1, lines));
      }
    },
  });

  useEffect(() => {
    // Update content if it changes externally
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Calculate initial line count
  useEffect(() => {
    if (editor && showLineNumbers) {
      const text = editor.getText();
      const lines = text.split("\n").length;
      setLineCount(Math.max(1, lines));
    }
  }, [editor, showLineNumbers]);

  const renderLineNumbers = () => {
    return (
      <div className="line-numbers text-muted-foreground text-xs text-right pr-2 select-none border-r border-border">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="line-number py-[3px]">
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col border rounded-md shadow-sm">
      {showToolbar && <EditorToolbar editor={editor} />}
      <div
        className={`flex ${showLineNumbers ? "editor-with-line-numbers" : ""}`}
        ref={editorRef}
      >
        {showLineNumbers && renderLineNumbers()}
        <EditorContent
          editor={editor}
          className="overflow-y-auto min-h-[200px] flex-1"
        />
      </div>
    </div>
  );
};

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b p-2 bg-muted/30">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-muted" : ""}
        title="Bold"
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-muted" : ""}
        title="Italic"
      >
        <span className="italic">I</span>
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        title="Heading 1"
      >
        <span className="text-xl font-bold">H1</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        title="Heading 2"
      >
        <span className="text-lg font-bold">H2</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        title="Heading 3"
      >
        <span className="text-base font-bold">H3</span>
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
        title="Bullet List"
      >
        <span className="text-lg">•</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
        title="Ordered List"
      >
        <span className="text-lg">1.</span>
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-muted" : ""}
        title="Code Block"
      >
        <span className="font-mono text-sm">{"<>"}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-muted" : ""}
        title="Blockquote"
      >
        <span className="text-lg">"</span>
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        Undo
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        Redo
      </Button>
    </div>
  );
};

export default MarkdownEditor;
