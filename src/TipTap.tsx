import { ListItem } from "@tiptap/extension-list";
import {
  EditorContent,
  EditorContext,
  Extension,
  useCurrentEditor,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";

export default function TipTapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        listItem: false, // disable default ListItem
      }),
      CustomTab,
      CustomListItem,
    ], // define your extension array
    content: "<p>Hello World!</p>", // initial content
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
      }
    };

    const el = editor.view.dom;
    el.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <TipTapCustomToolbar />
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
}

function TipTapCustomToolbar() {
  const { editor } = useCurrentEditor();
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) {
        return;
      }
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().focus().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic:
          ctx.editor.can().chain().focus().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike:
          ctx.editor.can().chain().focus().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().focus().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canUndo: ctx.editor.can().chain().focus().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().focus().redo().run() ?? false,
      };
    },
  });

  if (!editor || !editorState) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={editorState.isBold ? "is-active" : ""}
      >
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        bullet-list
      </button>
    </div>
  );
}

export const CustomTab = Extension.create({
  name: "customTab",

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're in a list item
        const isInList = $from.node(-1)?.type.name === "listItem";

        // Check if cursor is at the start of the paragraph/list item
        const isAtStart = $from.parentOffset === 0;

        if (isInList && isAtStart) {
          // Sink list item (increase indent)
          return editor.commands.sinkListItem("listItem");
        }

        // Otherwise, insert a tab character
        return editor.commands.insertContent("\t");
      },

      "Shift-Tab": ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're in a list item
        const isInList = $from.node(-1)?.type.name === "listItem";

        if (isInList) {
          // Lift list item (decrease indent)
          return editor.commands.liftListItem("listItem");
        }

        // Default behavior for Shift-Tab outside lists
        return false;
      },
    };
  },
});

const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});
