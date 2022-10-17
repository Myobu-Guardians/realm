import { useEffect, useRef, useState } from "react";
import { Editor as CodeMirrorEditor } from "codemirror";
import { setTheme as EchoMDSetTheme } from "@0xgg/echomd/theme";
import { EchoMDVersion } from "../editor";
import Icon from "@mdi/react";
import { mdiLanguageMarkdown } from "@mdi/js";
import toastr from "toastr";
import { EditorMode, RealmNote } from "../lib/types";
import { renderPreview } from "@0xgg/echomd/preview";
const EchoMD = require("@0xgg/echomd/core");

const HMDFold = {
  image: true,
  link: true,
  math: true,
  html: true, // maybe dangerous
  emoji: true,
  widget: true,
  code: true,
};

interface EditorProps {
  onClose: () => void;
  noteMarkdown?: string;
  placeholder?: string;
  confirmButtonText: string;
  onConfirm: (markdown: string) => void;
  disableInitialText?: boolean;
}

export default function Editor(props: EditorProps) {
  // const previewElement = useRef<HTMLDivElement>(null);
  const textAreaElement = useRef<HTMLTextAreaElement>(null);
  const previewElement = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<CodeMirrorEditor | undefined>(undefined);
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.Code);
  const [markdown, setMarkdown] = useState(
    props.disableInitialText
      ? ""
      : props.noteMarkdown ||
          localStorage.getItem("note/markdown") ||
          "# Your note title goes here"
  );

  // Set editor
  useEffect(() => {
    if (textAreaElement.current && !editor) {
      const editor: CodeMirrorEditor = EchoMD.fromTextArea(
        textAreaElement.current,
        {
          mode: {
            name: "hypermd",
            hashtag: true,
          },
          // inputStyle: "textarea", // Break mobile device paste functionality
          hmdFold: HMDFold,
          showCursorWhenSelecting: true,
          inputStyle: "contenteditable",
        }
      );
      editor.setOption("lineNumbers", false);
      editor.setOption("foldGutter", false);
      editor.setValue(markdown);
      EchoMD.switchToNormal(editor);
      setEditor(editor);

      EchoMDSetTheme({
        editor,
        themeName: "one-dark",
        baseUri: `/styles/echomd@${EchoMDVersion}/`,
      });
    }
  }, [textAreaElement, editor, markdown]);

  // Editor events
  useEffect(() => {
    if (editor) {
      const changesHandler = () => {
        const markdown = editor.getValue();
        setMarkdown(markdown);
        localStorage.setItem("note/markdown", markdown);
      };
      editor.on("changes", changesHandler);

      const loadImage = async (args: any) => {
        const element = args.element;
        const imageSrc = element.getAttribute("data-src");
        element.setAttribute("src", imageSrc);
      };
      editor.on("imageReadyToLoad" as any, loadImage);

      return () => {
        editor.off("changes", changesHandler);
        editor.off("imageReadyToLoad" as any, loadImage);
      };
    }
  }, [editor]);

  // Render Preview
  useEffect(() => {
    if (
      editorMode === EditorMode.Preview &&
      editor &&
      previewElement &&
      previewElement.current
    ) {
      try {
        renderPreview(previewElement.current, editor.getValue());
      } catch (error: any) {
        previewElement.current.innerText = error.toString();
      }
    }
  }, [editorMode, editor, previewElement]);

  return (
    <div className="sm:modal sm:modal-open editor">
      <div
        className="fixed top-0 left-0 w-full h-full z-50 overflow-auto sm:relative sm:modal-box sm:max-w-full sm:w-8/12 flex flex-col"
        style={{
          backgroundColor: "#282c34",
        }}
      >
        <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
          <div className="flex-1">
            <Icon
              path={mdiLanguageMarkdown}
              size={1}
              className={"mr-2"}
              title={"Markdown supported"}
            ></Icon>
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target={"_blank"}
              rel={"noreferrer"}
              className={"link hidden md:inline-block"}
            >
              Markdown supported
            </a>
          </div>
          <div className="flex-none">
            <div className="form-control mr-2">
              <label className="label cursor-pointer">
                <span className="label-text mr-1">Preview</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={editorMode === EditorMode.Preview}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditorMode(EditorMode.Preview);
                    } else {
                      setEditorMode(EditorMode.Code);
                    }
                  }}
                ></input>
              </label>
            </div>
            <button className="btn btn-secondary mr-2" onClick={props.onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                props.onConfirm(markdown);
              }}
            >
              {props.confirmButtonText}
            </button>
          </div>
        </div>
        <div className="editor-wrapper text-left relative flex-1">
          <textarea
            ref={textAreaElement}
            placeholder={props.placeholder || "# Your note title"}
          ></textarea>
          {editorMode === EditorMode.Preview && editor ? (
            <div
              className={"preview p-2 absolute left-0 top-0 w-full h-full"}
              ref={previewElement}
            ></div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
