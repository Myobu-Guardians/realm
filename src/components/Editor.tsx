import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor as CodeMirrorEditor } from "codemirror";
import { setTheme as EchoMDSetTheme, ThemeName } from "@0xgg/echomd/theme";
import { EchoMDVersion } from "../editor";
import Icon from "@mdi/react";
import { mdiLanguageMarkdown } from "@mdi/js";
import { generateSummaryFromMarkdown } from "../lib/note";
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
}

export default function Editor(props: EditorProps) {
  // const previewElement = useRef<HTMLDivElement>(null);
  const appContainer = AppContainer.useContainer();
  const textAreaElement = useRef<HTMLTextAreaElement>(null);
  const [editor, setEditor] = useState<CodeMirrorEditor | undefined>(undefined);
  const [markdown, setMarkdown] = useState(
    localStorage.getItem("note/markdown") || "# Your note title goes here"
  );

  const publishNote = useCallback(() => {
    if (!markdown.length) {
      return alert("Note is empty");
    } else {
      const summary = generateSummaryFromMarkdown(markdown);
      console.log(summary);
    }
  }, [markdown]);

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

  return (
    <div className="modal modal-open editor">
      <div className="modal-box max-w-full w-8/12">
        <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
          <div className="flex-1">
            <Icon path={mdiLanguageMarkdown} size={1} className={"mr-2"}></Icon>
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target={"_blank"}
              rel={"noreferrer"}
              className={"link"}
            >
              markdown supported
            </a>
          </div>
          <div className="flex-none">
            <button className="btn btn-secondary mr-2" onClick={props.onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={publishNote}>
              Publish
            </button>
          </div>
        </div>
        <div className="editor-wrapper text-left">
          <textarea
            ref={textAreaElement}
            placeholder={"# Your note title"}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
