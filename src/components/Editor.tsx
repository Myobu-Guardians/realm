import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Editor as CodeMirrorEditor } from "codemirror";
import { setTheme as EchoMDSetTheme } from "@0xgg/echomd/theme";
import { EchoMDVersion } from "../editor";
import Icon from "@mdi/react";
import {
  mdiClose,
  mdiFormatBold,
  mdiFormatHeader1,
  mdiFormatHeader2,
  mdiFormatHeader3,
  mdiFormatItalic,
  mdiImage,
  mdiLanguageMarkdown,
  mdiPublish,
} from "@mdi/js";
import { EditorMode } from "../lib/types";
import { renderPreview } from "@0xgg/echomd/preview";
import toastr from "toastr";
import AppContainer from "../containers/app";
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
  const appContainer = AppContainer.useContainer();
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
  const uploadImageRef = createRef<HTMLInputElement>();
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const insertHeader = useCallback(
    (headerLevel: number) => {
      if (editor) {
        setEditorMode(EditorMode.Code);
        editor.replaceSelection(
          `${"#".repeat(headerLevel)} ${editor.getSelection() || "Header"}`
        );
      }
    },
    [editor]
  );

  const insertBold = useCallback(() => {
    if (editor) {
      setEditorMode(EditorMode.Code);
      editor.replaceSelection(`**${editor.getSelection() || "Bold text"}**`);
    }
  }, [editor]);

  const insertItalic = useCallback(() => {
    if (editor) {
      setEditorMode(EditorMode.Code);
      editor.replaceSelection(`*${editor.getSelection() || "Italic text"}*`);
    }
  }, [editor]);

  const uploadImages = useCallback(async () => {
    if (editor && uploadImageRef.current?.files && appContainer.client) {
      const files = Array.from(uploadImageRef.current?.files || []);

      setIsUploadingImages(true);
      try {
        const { urls } = await appContainer.client.uploadImages(files);
        editor.replaceSelection(
          urls
            .map(
              (url, index) => `![${files[index]?.name || "unknown"}](${url})`
            )
            .join("\n\n")
        );
      } catch (error) {
        toastr.error(`Failed to upload images`);
      }
      setIsUploadingImages(false);

      if (uploadImageRef.current) {
        uploadImageRef.current.value = "";
      }
    }
  }, [editor, uploadImageRef, appContainer.client]);

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
            <button
              className="btn btn-ghost px-2 hidden md:inline-block"
              onClick={() => insertHeader(1)}
              title="Insert header 1"
            >
              <Icon path={mdiFormatHeader1} size={1}></Icon>
            </button>
            <button
              className="btn btn-ghost px-2 hidden md:inline-block"
              onClick={() => {
                insertHeader(2);
              }}
              title="Insert header 2"
            >
              <Icon path={mdiFormatHeader2} size={1}></Icon>
            </button>
            <button
              className="btn btn-ghost px-2 hidden md:inline-block"
              onClick={() => {
                insertHeader(3);
              }}
              title="Insert header 3"
            >
              <Icon path={mdiFormatHeader3} size={1}></Icon>
            </button>
            <button
              className="btn btn-ghost px-2 hidden md:inline-block"
              onClick={() => {
                insertBold();
              }}
              title="Insert bold text"
            >
              <Icon path={mdiFormatBold} size={1}></Icon>
            </button>
            <button
              className="btn btn-ghost px-2 hidden md:inline-block"
              onClick={() => {
                insertItalic();
              }}
              title="Insert italic text"
            >
              <Icon path={mdiFormatItalic} size={1}></Icon>
            </button>
            <button
              className="btn btn-ghost px-2"
              onClick={() => {
                if (uploadImageRef && uploadImageRef.current) {
                  uploadImageRef.current.click();
                }
              }}
              title="Upload image"
              disabled={isUploadingImages}
            >
              <Icon path={mdiImage} size={1}></Icon>
            </button>
            <input
              className="hidden"
              type={"file"}
              ref={uploadImageRef}
              onChange={uploadImages}
              multiple
            ></input>
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
            <button
              className="btn btn-primary mr-2"
              onClick={() => {
                props.onConfirm(markdown);
              }}
            >
              <Icon path={mdiPublish} size={1}></Icon>
              {props.confirmButtonText}
            </button>
            <button
              className="btn btn-secondary btn-circle"
              onClick={props.onClose}
              title={"Close the editor"}
            >
              <Icon path={mdiClose} size={1}></Icon>
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
