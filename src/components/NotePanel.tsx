import { renderPreview } from "@0xgg/echomd/preview";
import { useCallback, useEffect, useRef, useState } from "react";
import AppContainer from "../containers/app";
import FeedsContainer from "../containers/feeds";
import { setTheme as EchoMDSetTheme } from "@0xgg/echomd/theme";
import { EchoMDVersion } from "../editor";
import Icon from "@mdi/react";
import { siIpfs } from "simple-icons/icons";
import {
  mdiChevronLeft,
  mdiClose,
  mdiComment,
  mdiPencil,
  mdiPlus,
  mdiTableOfContents,
  mdiTag,
  mdiTrashCanOutline,
} from "@mdi/js";
import toastr from "toastr";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommentCard from "./CommentCard";

interface Props {
  showUpdateNoteEditor: (markdown: string) => void;
  showMakeCommentEditor: () => void;
  showEditTagsModal: () => void;
}

export default function NotePanel(props: Props) {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();
  const containerElement = useRef<HTMLDivElement>(null);
  const previewElement = useRef<HTMLDivElement>(null);
  const tocElement = useRef<HTMLDivElement>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [tocEnabled, setTocEnabled] = useState<boolean>(false);

  const navigate = useNavigate();

  const deleteNote = useCallback(() => {
    if (feedsContainer.note) {
      const answer = prompt(
        "Are you sure you want to delete this note? Type 'yes' to confirm."
      );
      if (answer === "yes") {
        feedsContainer
          .deleteNote(feedsContainer.note._id || "")
          .then(() => {
            toastr.success("Note deleted");
          })
          .catch((error) => {
            console.error(error);
            toastr.error("Failed to delete note");
          });
      }
    }
  }, [feedsContainer.note]);

  useEffect(() => {
    if (feedsContainer.note?.markdown) {
      setMarkdown(feedsContainer.note.markdown);
    } else if (feedsContainer.note?.ipfsHash) {
      appContainer
        .ipfsCat(feedsContainer.note.ipfsHash)
        .then((data) => {
          setMarkdown(data.toString());
        })
        .catch((err) => {
          console.error(err);
          setMarkdown(
            `Error loading note from IPFS [${feedsContainer.note?.ipfsHash}](https://ipfs.io/ipfs/${feedsContainer.note?.ipfsHash})`
          );
        });
    } else {
      setMarkdown("");
    }
  }, [feedsContainer.note, appContainer.ipfsCat]);

  useEffect(() => {
    if (previewElement.current) {
      renderPreview(previewElement.current, markdown);
    }
  }, [markdown, previewElement]);

  useEffect(() => {
    EchoMDSetTheme({
      themeName: "one-dark",
      baseUri: `/styles/echomd@${EchoMDVersion}/`,
    });
  }, []);

  /*
  useEffect(() => {
    if (containerElement.current && feedsContainer.note) {
      setTocEnabled(containerElement.current.offsetWidth > 768);
    }
  }, [containerElement, feedsContainer.note]);
  */

  useEffect(() => {
    if (tocEnabled && tocElement.current && previewElement.current) {
      if (!markdown) {
        tocElement.current.innerHTML = "<p>Empty ToC</p>";
      } else {
        let tocHtml = "";
        const headerElements = previewElement.current.querySelectorAll(
          "h1, h2, h3, h4, h5, h6"
        );
        headerElements.forEach((headerElement, index) => {
          headerElement.id = `toc-${index}`;
          headerElement.classList.add("toc-anchor");
          const level = parseInt(headerElement.tagName[1]);
          const title = headerElement.innerHTML;

          tocHtml +=
            `<div class="toc-item cursor-pointer" data-index="${index}" style="padding-left:${level}em">` +
            title +
            "</div>";
        });

        tocElement.current.innerHTML = tocHtml;
        // Scroll to very top
        tocElement.current.scrollTop = 0;
        // Click handler
        const tocItems = tocElement.current.querySelectorAll(".toc-item");
        tocItems.forEach((tocItem) => {
          tocItem.addEventListener("click", (e) => {
            const index = (e.target as HTMLElement).getAttribute("data-index");
            const targetElement = document.getElementById(`toc-${index}`);
            if (
              targetElement &&
              containerElement &&
              containerElement.current &&
              containerElement.current.parentElement
            ) {
              containerElement.current.parentElement.scrollTop =
                targetElement.offsetTop - 100;
            }
          });
        });
      }
    }
  }, [markdown, tocEnabled, tocElement, previewElement, containerElement]);

  if (!feedsContainer.note) {
    // Loading notes
    return (
      <div className="relative text-center text-2xl top-1/3">Loading...</div>
    );
  }

  return (
    <div className="relative p-1 sm:p-4" ref={containerElement}>
      {/* Top banner */}
      <div className="w-full bg-[#2A303C] sticky top-0">
        <div className="w-[800px] max-w-full mx-auto flex flex-row items-center px-1 sm:px-0 py-2">
          <div className="flex flex-row items-center flex-1">
            {/* Check if history can go back */}
            <button
              className="btn btn-circle"
              onClick={() => {
                navigate(-1);
              }}
              title={"Back"}
            >
              <Icon path={mdiChevronLeft} size={1}></Icon>
            </button>
            {/* author */}
            <Link to={`/${feedsContainer.note.author?.name || ""}.m`}>
              <div className="flex flex-row items-center">
                <div className="avatar mr-2">
                  <div className="w-[40px] rounded-full ring ring-white hover:bg-slate-200">
                    <img
                      src={
                        feedsContainer.note.author?.avatar ||
                        `https://avatars.dicebear.com/api/big-ears-neutral/${
                          feedsContainer.note.author?.name || ""
                        }.svg`
                      }
                      alt={feedsContainer.note.author?.name + ".m"}
                    ></img>
                  </div>
                </div>
                <div className="flex flex-col text-sm">
                  <div className="font-bold hover:underline">
                    {feedsContainer.note.author?.displayName}
                  </div>
                  <span className="hover:underline">
                    @{feedsContainer.note.author?.name}.m
                  </span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex-none flex flex-col sm:flex-row items-center">
            {/* date */}
            <div className="badge ml-2">
              {new Date(feedsContainer.note._createdAt || 0).toLocaleString()}
            </div>
            <div className="flex flex-row items-center">
              {/* ipfs */}
              <a
                href={`https://ipfs.io/ipfs/${feedsContainer.note.ipfsHash}`}
                target={"_blank"}
                rel={"noreferrer"}
              >
                <Icon
                  className="ml-2"
                  path={siIpfs.path}
                  size={1}
                  title={`This note has been permanently stored on IPFS: ${feedsContainer.note.ipfsHash}`}
                ></Icon>
              </a>
              {/* buttons */}
              {feedsContainer.note._owner === appContainer.signerAddress && (
                <>
                  <button
                    onClick={deleteNote}
                    className={"btn btn-circle btn-sm ml-2"}
                    title={"Delete this note"}
                  >
                    <Icon
                      className="cursor-pointer text-red-400"
                      path={mdiTrashCanOutline}
                      size={1}
                    ></Icon>
                  </button>
                  <button
                    className="btn btn-circle btn-success btn-sm ml-2"
                    title={"Edit note content"}
                    onClick={() => props.showUpdateNoteEditor(markdown)}
                  >
                    <Icon className="" path={mdiPencil} size={1}></Icon>
                  </button>
                  {tocEnabled ? (
                    <button
                      className="btn btn-circle btn-sm ml-2"
                      title={`Close table of contents`}
                      onClick={() => setTocEnabled(false)}
                    >
                      <Icon path={mdiClose} size={1}></Icon>
                    </button>
                  ) : (
                    <button
                      className="btn btn-circle btn-sm ml-2"
                      title={`Open table of contents`}
                      onClick={() => setTocEnabled(true)}
                    >
                      <Icon path={mdiTableOfContents} size={1}></Icon>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Loading */}
      {!feedsContainer.note && (
        <div className="relative text-center text-2xl top-1/3">Loading...</div>
      )}
      <div
        className={
          "mx-auto w-full mb-10 block sm:flex sm:flex-row-reverse sm:justify-center"
        }
        style={{
          backgroundColor: "inherit",
        }}
      >
        {/* Table of contents */}
        {tocEnabled && (
          <div
            className={`absolute bg-[#2A303C] top-0 sm:w-[300px] w-full max-w-full h-full left-0 sm:sticky sm:top-[100px] p-2 sm:ml-4 z-50 overflow-auto`}
          >
            <button
              className="btn btn-circle btn-sm float-right sm:hidden"
              title={`Close table of contents`}
              onClick={() => setTocEnabled(false)}
            >
              <Icon path={mdiClose} size={1}></Icon>
            </button>

            {<div ref={tocElement}></div>}
          </div>
        )}
        {/* Note markdown preview */}
        <div
          style={{
            backgroundColor: "inherit",
          }}
          className={"preview w-[800px] max-w-full"}
          ref={previewElement}
        ></div>
      </div>
      {/* Tags */}
      <div className="w-[800px] max-w-full mx-auto mb-10">
        <div className="flex flex-row items-center">
          {feedsContainer.tags
            .sort((x, y) => x.name.localeCompare(y.name))
            .map((tag) => {
              return (
                <Link to={`/notes?tag=${tag.name}`} key={`tag-` + tag.name}>
                  <span className="badge badge-ghost mr-2">
                    <Icon path={mdiTag} size={0.5} className={"mr-1"}></Icon>
                    {tag.name}
                  </span>
                </Link>
              );
            })}
          {appContainer.signerAddress &&
            appContainer.signerAddress === feedsContainer.note._owner && (
              <span
                className="badge badge-info cursor-pointer"
                onClick={props.showEditTagsModal}
              >
                <Icon path={mdiPlus} size={0.5}></Icon>
                Manage tags
              </span>
            )}
        </div>
      </div>
      {/* Comments */}
      {feedsContainer.comments.length > 0 && (
        <div className="w-[800px] max-w-full mx-auto">
          <div className="mb-4 mt-10 text-lg font-bold border-l-4 pl-2 border-secondary">
            Comments
          </div>
          {feedsContainer.comments.map((comment) => {
            return (
              <div key={comment._id} className={"mb-8"}>
                <CommentCard comment={comment}></CommentCard>
              </div>
            );
          })}
        </div>
      )}
      {/* Bottom banner */}
      <div className="w-full bg-[#2A303C] sticky bottom-0 ">
        <div className="w-[800px] max-w-full mx-auto flex flex-row items-center px-1 sm:px-0 py-2 border-t-2 border-gray-600">
          <div className="flex-1">
            {/* comment button */}
            <button
              className="btn btn-outline btn-ghost"
              onClick={props.showMakeCommentEditor}
            >
              <Icon path={mdiComment} size={1} className={"mr-2"}></Icon>
              Leave a comment
            </button>
          </div>
          <div className="flex-none"></div>
        </div>
      </div>
    </div>
  );
}
