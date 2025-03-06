import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import { useEffect } from "react";
import "./markdown-styles.css";
import { Button } from "@repo/ui/components/ui/button";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  FileCode,
  Minus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

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
          "prose prose-sm dark:prose-invert sm:prose lg:prose-lg max-w-none focus:outline-none p-0 rounded-md markdown-editor",
      },
      // Focus the editor when clicking anywhere in the editable area
      handleClick: (view, pos, event) => {
        view.focus();
        return false;
      },
    },
  });

  // Update the editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);

      // Set cursor to the end of the content after it changes and scroll to bottom
      setTimeout(() => {
        if (editor) {
          editor.commands.focus("end");
        }
      }, 0);
    }
  }, [content, editor]);

  // Focus when clicking on empty areas of the container
  const handleContainerClick = (e: React.MouseEvent) => {
    if (editor && !editor.isFocused && e.target === e.currentTarget) {
      editor.commands.focus();
    }
  };

  return (
    <div className="w-full relative flex flex-col h-full">
      {showToolbar && editor && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-2.5 px-2 shadow-sm">
          <EditorToolbar editor={editor} />
        </div>
      )}
      <div 
        className="p-4 overflow-hidden flex-grow editor-wrapper" 
        style={{ cursor: 'text' }}
        onClick={handleContainerClick}
      >
        <EditorContent editor={editor} className="prose-container" />
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
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1 px-2">
        <div className="flex gap-1 overflow-x-auto items-center">
          {/* Heading buttons */}
          <div className="flex gap-0.5 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={
                    editor.isActive("heading", { level: 1 })
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className="h-8 w-8"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={
                    editor.isActive("heading", { level: 2 })
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className="h-8 w-8"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={
                    editor.isActive("heading", { level: 3 })
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className="h-8 w-8"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 3</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border/80 mx-1" />

          {/* Text formatting */}
          <div className="flex gap-0.5 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={editor.isActive("bold") ? "default" : "outline"}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="h-8 w-8"
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={editor.isActive("italic") ? "default" : "outline"}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className="h-8 w-8"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border/80 mx-1" />

          {/* Lists */}
          <div className="flex gap-0.5 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={
                    editor.isActive("bulletList") ? "default" : "outline"
                  }
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={
                    editor.isActive("orderedList") ? "default" : "outline"
                  }
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className="h-8 w-8"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ordered List</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border/80 mx-1" />

          {/* Code */}
          <div className="flex gap-0.5 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={editor.isActive("code") ? "default" : "outline"}
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className="h-8 w-8"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Inline Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={editor.isActive("codeBlock") ? "default" : "outline"}
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className="h-8 w-8"
                >
                  <FileCode className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border/80 mx-1" />

          {/* Misc */}
          <div className="flex gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Divider</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MarkdownEditor;
