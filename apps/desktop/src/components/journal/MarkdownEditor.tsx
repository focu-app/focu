import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect } from "react";
import "./markdown-styles.css";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
}

const MarkdownEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
  autoFocus = false,
  showToolbar = true,
}: MarkdownEditorProps) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      StarterKit.configure({
        document: false,
        paragraph: false,
        text: false,
        heading: false,
      }),
      Highlight,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
    },
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[calc(100vh-300px)] p-4 rounded-md markdown-editor",
      },
    },
  });

  // Update the editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      {showToolbar && editor && <EditorToolbar editor={editor} />}
      <div className="editor-container">
        <EditorContent editor={editor} />
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
    <div className="flex flex-wrap gap-1 mb-2">
      <Button
        type="button"
        size="sm"
        variant={
          editor.isActive("heading", { level: 1 }) ? "default" : "outline"
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>
      <Button
        type="button"
        size="sm"
        variant={
          editor.isActive("heading", { level: 2 }) ? "default" : "outline"
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>
      <Button
        type="button"
        size="sm"
        variant={
          editor.isActive("heading", { level: 3 }) ? "default" : "outline"
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bold") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("italic") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bulletList") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Bullet List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("orderedList") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Ordered List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("code") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        Code
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("codeBlock") ? "default" : "outline"}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        Code Block
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        Divider
      </Button>
    </div>
  );
};

export default MarkdownEditor;
