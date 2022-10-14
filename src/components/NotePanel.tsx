import { renderPreview } from "@0xgg/echomd/preview";
import { useCallback, useEffect, useRef, useState } from "react";
import AppContainer from "../containers/app";
import FeedsContainer from "../containers/feeds";
import { setTheme as EchoMDSetTheme } from "@0xgg/echomd/theme";
import { EchoMDVersion } from "../editor";
import Icon from "@mdi/react";
import { siIpfs } from "simple-icons/icons";
import { mdiArrowLeft, mdiTrashCan, mdiTrashCanOutline } from "@mdi/js";
import toastr from "toastr";
import { useLocation, useNavigate } from "react-router-dom";

export default function NotePanel() {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();
  const previewElement = useRef<HTMLDivElement>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const location = useLocation();
  const navigation = useNavigate();

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
    if (feedsContainer.note?.ipfsHash) {
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

  if (!feedsContainer.note) {
    // Loading notes
    return (
      <div className="relative text-center text-2xl top-1/3">Loading...</div>
    );
  }

  return (
    <div className="relative p-1 sm:p-4">
      {/* Check if history can go back */}
      <div className="mb-10">
        <button
          className="btn btn-circle"
          onClick={() => {
            if (location.state?.from) {
              navigation(location.state.from);
            } else {
              navigation("/");
            }
          }}
        >
          <Icon path={mdiArrowLeft} size={1}></Icon>
        </button>
      </div>

      {/* Top banner */}
      <div className="w-[800px] max-w-full mx-auto flex flex-row items-center">
        {/* author */}
        <div className="flex flex-row items-center mb-4 flex-1">
          <div className="avatar mr-2">
            <div className="w-[40px] rounded-full ring ring-white">
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
            <div className="font-bold">
              {feedsContainer.note.author?.displayName}
            </div>
            <span>@{feedsContainer.note.author?.name}.m</span>
          </div>
        </div>
        <div className="flex-none flex flex-row items-center">
          {/* date */}
          <div className="badge ml-2">
            {new Date(feedsContainer.note._createdAt || 0).toLocaleString()}
          </div>
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
            <div>
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
            </div>
          )}
        </div>
      </div>
      {/* Note markdown preview */}
      <div
        className={"preview w-[800px] max-w-full mx-auto"}
        style={{
          backgroundColor: "inherit",
        }}
        ref={previewElement}
      ></div>
    </div>
  );
}
