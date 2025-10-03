import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily } from "@tiptap/extension-text-style";

import {
  Editor,
  EditorContent,
  EditorContext,
  Extension,
  useCurrentEditor,
  useEditor,
  useEditorState,
  type EditorStateSnapshot,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Select } from "antd";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import { useEffect, useMemo } from "react";

export default function TipTapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // listItem: false,
      }),
      CustomTab,
      // CustomListItem,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      FontFamily,
      TextStyle,
    ],
    editorProps: {
      attributes: {
        style: "font-family: Comic Sans MS",
      },
    },
    content: "<p style='color: red;'>Hello World!</p>", // initial content
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  const fontFamilies = [
    { label: "Inter", value: "Inter" },
    { label: "Comic Sans MS", value: "Comic Sans MS" },
    { label: "Monospace", value: "Monospace" },
  ];

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
      <TipTapCustomToolbar fontFamilies={fontFamilies} />
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  );
}

function TipTapCustomToolbar(props: {
  fontFamilies: { value: string; label: string }[];
}) {
  const { editor } = useCurrentEditor();

  const editorState = useEditorState({
    editor,
    selector: getToolbarSelectionConfig,
  });

  if (!editor || !editorState) {
    return null;
  }

  const dividerStyle = "border-l border-black/10 self-stretch mx-1 my-1";

  return (
    <div className="flex gap-1 pb-4 items-center flex-wrap">
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
        onClick={() => editorState.actions.toggleItalic()}
        disabled={!editorState.canItalic}
        className={editorState.isItalic ? "!bg-red-200" : ""}
        icon={<Italic size={14} />}
      />

      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleUnderline()}
        disabled={!editorState.canUnderline}
        className={editorState.isUnderline ? "!bg-red-200" : ""}
        icon={<Underline size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleStrike()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? "!bg-red-200" : ""}
        icon={<Strikethrough size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleStrike()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? "!bg-red-200" : ""}
        icon={<Subscript size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.toggleStrike()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? "!bg-red-200" : ""}
        icon={<Superscript size={14} />}
      />
      <div className={dividerStyle} />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.setTextAlign("left")}
        className={editorState.isTextAlignLeft ? "!bg-red-200" : ""}
        icon={<AlignLeft size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.setTextAlign("center")}
        className={editorState.isTextAlignCenter ? "!bg-red-200" : ""}
        icon={<AlignCenter size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.setTextAlign("right")}
        className={editorState.isTextAlignRight ? "!bg-red-200" : ""}
        icon={<AlignRight size={14} />}
      />
      <Button
        size="small"
        type="text"
        onClick={() => editorState.actions.setTextAlign("justify")}
        className={editorState.isTextAlignJustify ? "!bg-red-200" : ""}
        icon={<AlignJustify size={14} />}
      />
      <div className={dividerStyle} />
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
      <div className={dividerStyle} />
      <Select
        className="w-32"
        size="small"
        value={
          editorState.hasFontFamily === "default"
            ? "Comic Sans MS"
            : editorState.hasFontFamily
        }
        onSelect={(value) => {
          editorState.actions.setFontFamily(value);
        }}
        options={props.fontFamilies}
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

export const CustomSelection = Extension.create({
  name: "customSelection",
});

function getCurrentListType(editor: Editor) {
  const { state } = editor;
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "bulletList") return "bulletList";
    if (node.type.name === "orderedList") return "orderedList";
  }

  return null;
}

function getToolbarSelectionConfig(
  snapshot: EditorStateSnapshot<Editor | null>
) {
  const editor = snapshot.editor;
  if (!editor) return null;

  const currentList = getCurrentListType(editor);

  return {
    isBold: editor.isActive("bold"),
    canBold: editor.can().chain().focus().toggleBold().run(),
    isUnderline: editor.isActive("underline"),
    canUnderline: editor.can().chain().focus().toggleUnderline().run(),
    isItalic: editor.isActive("italic"),
    canItalic: editor.can().chain().focus().toggleItalic().run(),
    isStrike: editor.isActive("strike"),
    canStrike: editor.can().chain().focus().toggleStrike().run(),
    isCode: editor.isActive("code"),
    canCode: editor.can().chain().focus().toggleCode().run(),
    canClearMarks: editor.can().chain().unsetAllMarks().run(),
    isParagraph: editor.isActive("paragraph"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
    isHeading4: editor.isActive("heading", { level: 4 }),
    isHeading5: editor.isActive("heading", { level: 5 }),
    isHeading6: editor.isActive("heading", { level: 6 }),
    isBulletList: currentList === "bulletList",
    isOrderedList: currentList === "orderedList",
    isCodeBlock: editor.isActive("codeBlock"),
    isBlockquote: editor.isActive("blockquote"),
    canUndo: editor.can().chain().focus().undo().run(),
    canRedo: editor.can().chain().focus().redo().run(),
    canTextAlign: editor.can().chain().focus().setTextAlign("").run(),
    isTextAlignLeft:
      editor.isActive({ textAlign: "left" }) ||
      (!editor.isActive({ textAlign: "right" }) &&
        !editor.isActive({ textAlign: "center" }) &&
        !editor.isActive({ textAlign: "justify" })),
    isTextAlignRight: editor.isActive({ textAlign: "right" }),
    isTextAlignCenter: editor.isActive({ textAlign: "center" }),
    isTextAlignJustify: editor.isActive({ textAlign: "justify" }),
    hasFontFamily: editor.getAttributes("textStyle").fontFamily ?? "default",
    actions: {
      toggleBold: () => editor.chain().focus().toggleBold().run(),
      toggleBulletList: () => editor.chain().focus().toggleBulletList().run(),
      toggleOrderedList: () => editor.chain().focus().toggleOrderedList().run(),
      toggleItalic: () => editor.chain().focus().toggleItalic().run(),
      toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
      toggleStrike: () => editor.chain().focus().toggleStrike().run(),
      setTextAlign: (direction: string) =>
        editor.chain().focus().setTextAlign(direction).run(),
      setFontFamily: (fontFamily: string) =>
        editor.chain().focus().setFontFamily(fontFamily).run(),
    },
  };
}

// Testing Playground

// const CustomListItem = ListItem.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       style: {
//         default: null,
//         parseHTML: (element) => element.getAttribute("style"),
//         renderHTML: (attributes) => {
//           if (!attributes.style) return {};
//           return { style: attributes.style };
//         },
//       },
//     };
//   },
// });

// function withStyleAttr(NodeExtension: Node) {
//   return NodeExtension.extend({
//     addAttributes() {
//       return {
//         ...this.parent?.(),
//         style: {
//           default: null,
//           parseHTML: (el) => el.getAttribute("style"),
//           renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
//         },
//       };
//     },
//   });
// }
