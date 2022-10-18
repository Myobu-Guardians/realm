import { mdiClose, mdiCloseBox, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { useCallback, useState } from "react";
import FeedsContainer from "../containers/feeds";
import toastr from "toastr";
import { Tag } from "../lib/types";

interface TagsModalProps {
  onClose: () => void;
}

export default function TagsModal(props: TagsModalProps) {
  const feedsContainer = FeedsContainer.useContainer();
  const [tagInput, setTagInput] = useState<string>("");
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(false);

  const addTags = useCallback(async () => {
    setAddButtonDisabled(true);
    const tags = tagInput
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      try {
        await feedsContainer.addTagToNote(tag);
      } catch (error) {
        console.error(error);
        toastr.error(`Failed to add tag ${tag}`);
      }
    }
    setTagInput("");
    setAddButtonDisabled(false);
  }, [tagInput, feedsContainer.addTagToNote]);

  const deleteTag = useCallback(
    async (tag: Tag) => {
      try {
        await feedsContainer.deleteTagFromNote(tag.name);
      } catch (error) {
        console.error(error);
        toastr.error(`Failed to delete tag ${tag.name}`);
      }
    },
    [feedsContainer.deleteTagFromNote]
  );

  return (
    <div className="sm:modal sm:modal-open">
      <div
        className="fixed top-0 left-0 w-full h-full z-50 overflow-auto sm:relative sm:modal-box sm:max-w-full sm:w-8/12 flex flex-col"
        style={{
          backgroundColor: "#282c34",
        }}
      >
        <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
          <div className="flex-1">
            <Icon path={mdiTag} size={1} className={"mr-2"}></Icon>
            Manage tags
          </div>
          <div className="flex-none">
            <button
              className="btn btn-secondary btn-circle"
              onClick={props.onClose}
              title={"Close"}
            >
              <Icon path={mdiClose} size={1}></Icon>
            </button>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex flex-row">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Separate tags with commas"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTags();
                }
              }}
            ></input>
            <button
              className="btn btn-primary ml-2"
              onClick={addTags}
              disabled={addButtonDisabled}
            >
              Add
            </button>
          </div>
          <div className="flex flex-row items-center mt-4">
            {feedsContainer.tags
              .sort((x, y) => x.name.localeCompare(y.name))
              .map((tag) => {
                return (
                  <span
                    className="badge badge-ghost cursor-pointer mr-2 text-lg cursor-pointer"
                    key={`manage-tag-${tag.name}`}
                    onClick={() => {
                      deleteTag(tag);
                    }}
                  >
                    <Icon path={mdiClose} size={0.6} className={"mr-1"}></Icon>
                    {tag.name}
                  </span>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
