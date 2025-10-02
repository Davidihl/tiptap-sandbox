import { ListItem } from "@tiptap/extension-list";
import {
  Editor,
  EditorContent,
  EditorContext,
  Extension,
  useCurrentEditor,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "antd";
import { Bold, List, ListOrdered } from "lucide-react";
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

  function getCurrentListType(editor: Editor) {
    const { state } = editor;
    const { $from } = state.selection;

    // Walk up the node tree from deepest to root
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === "bulletList") return "bulletList";
      if (node.type.name === "orderedList") return "orderedList";
    }

    return null;
  }

  const editorState = useEditorState({
    editor,
    selector: (state) => {
      const editor = state.editor;
      if (!editor) return null;

      const currentList = getCurrentListType(editor);

      return {
        isBold: editor.isActive("bold") ?? false,
        canBold: editor.can().chain().focus().toggleBold().run() ?? false,
        isItalic: editor.isActive("italic") ?? false,
        canItalic: editor.can().chain().focus().toggleItalic().run() ?? false,
        isStrike: editor.isActive("strike") ?? false,
        canStrike: editor.can().chain().focus().toggleStrike().run() ?? false,
        isCode: editor.isActive("code") ?? false,
        canCode: editor.can().chain().focus().toggleCode().run() ?? false,
        canClearMarks: editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: editor.isActive("paragraph") ?? false,
        isHeading1: editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: editor.isActive("heading", { level: 6 }) ?? false,
        isBulletList: currentList === "bulletList",
        isOrderedList: currentList === "orderedList",
        isCodeBlock: editor.isActive("codeBlock") ?? false,
        isBlockquote: editor.isActive("blockquote") ?? false,
        canUndo: editor.can().chain().focus().undo().run() ?? false,
        canRedo: editor.can().chain().focus().redo().run() ?? false,
        actions: {
          toggleBold: () => editor.chain().focus().toggleBold().run(),
          toggleBulletList: () =>
            editor.chain().focus().toggleBulletList().run(),
          toggleOrderedList: () =>
            editor.chain().focus().toggleOrderedList().run(),
        },
      };
    },
  });

  if (!editor || !editorState) {
    return null;
  }

  return (
    <div className="flex gap-px [&_button]:px-2 [&_button]:bg-gray-200 [&_button]:rounded pb-4">
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleBold()}
        disabled={!editorState.canBold}
        className={editorState.isBold ? "!bg-red-200" : ""}
        icon={<Bold size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleBulletList()}
        className={editorState.isBulletList ? "!bg-red-200" : ""}
        icon={<List size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleOrderedList()}
        className={editorState.isOrderedList ? "!bg-red-200" : ""}
        icon={<ListOrdered size={14} />}
      />
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

export const CustomSelection = Extension.create({
  name: "customSelection",
});
