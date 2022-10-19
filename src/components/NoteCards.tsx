import { mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";
import FeedsContainer from "../containers/feeds";
import { RealmNote } from "../lib/types";
import { formatDistanceToNowStrict } from "date-fns";

interface NoteCardProps {
  note: RealmNote;
}
export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="card w-96 max-w-full bg-neutral text-gray-300 shadow-xl text-left">
      <Link to={`/notes/${note._id}`}>
        <div className="card-body p-0">
          {/* images */}
          <div className="flex flex-wrap bg-cover">
            {note.images.map((image) => (
              <div
                className={
                  "p-1 " +
                  (note.images.length > 4
                    ? "w-1/3"
                    : note.images.length > 1
                    ? "w-1/2"
                    : "w-full")
                }
                key={note._id + image}
              >
                <img
                  src={image}
                  alt="note"
                  className="w-full h-full rounded-md"
                />
              </div>
            ))}
          </div>
          <div className="p-[16px] pt-0">
            <div className="text-primary-content text-xl my-2">
              {note.summary}
            </div>
            <div className="flex flex-row items-center justify-between">
              <Link to={`/${note.author?.name || ""}.m`}>
                <div className="flex flex-row items-center flex-1">
                  <div className="avatar mr-2">
                    <div className="w-[40px] rounded-full ring ring-white hover:ring-slate-200">
                      <img
                        src={
                          note.author?.avatar ||
                          `https://avatars.dicebear.com/api/big-ears-neutral/${
                            note.author?.name || ""
                          }.svg`
                        }
                        alt={note.author?.name + ".m"}
                      ></img>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="font-bold hover:underline">
                      {note.author?.displayName}
                    </div>
                    <span className="hover:underline">
                      @{note.author?.name}.m
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex">
                <span className="badge">
                  {formatDistanceToNowStrict(new Date(note._updatedAt || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function NoteCards() {
  const feedsContainer = FeedsContainer.useContainer();

  return (
    <div className="pt-2 sm:pt-12">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        {feedsContainer.tagName ? (
          <div className="flex flex-row items-center">
            <Icon path={mdiTag} size={1} className={"mr-1"}></Icon>
            <span>{feedsContainer.tagName}</span>
          </div>
        ) : (
          <span>:NOTE</span>
        )}
      </div>
      <div className="columns-1 sm:columns-[24rem]">
        {feedsContainer.notes.length === 0 ? (
          <div className="text-primary-content text-left">No notes found</div>
        ) : (
          feedsContainer.notes.map((note) => {
            return (
              <div key={note._id} className={"mb-2 sm:m-2"}>
                <NoteCard note={note}></NoteCard>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
