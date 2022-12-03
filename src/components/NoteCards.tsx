import { mdiPencil, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";
import FeedsContainer from "../containers/feeds";
import { RealmNote } from "../lib/types";
import { formatDistanceToNowStrict } from "date-fns";
import AppContainer from "../containers/app";

interface NoteCardProps {
  note: RealmNote;
}
export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="card w-auto sm:w-96 max-w-full bg-neutral text-gray-300 shadow-xl text-left mx-auto sm:mx-0 h-[440px]">
      <Link to={`/notes/${note._id}`} className="h-full">
        <div className="card-body p-0 justify-between h-full">
          {/* images */}
          {note.images.length > 0 && (
            <div className="flex flex-wrap bg-cover h-[280px]">
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
                    className="w-full h-full rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="p-3 flex flex-col justify-between h-full">
            <div className="text-primary-content text-lg my-2">
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

interface NoteCardsProps {
  showPublishNoteEditor: () => void;
}

export function NoteCards(props: NoteCardsProps) {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();

  return (
    <div className="pt-2 sm:pt-12">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none flex flex-row justify-between">
        {feedsContainer.notesTagName ? (
          <div className="flex flex-row items-center">
            <Icon path={mdiTag} size={1} className={"mr-1"}></Icon>
            <span>{feedsContainer.notesTagName}</span>
          </div>
        ) : (
          <span>:Note</span>
        )}
        {appContainer.signerProfile && (
          <button
            className="btn btn-primary mr-2"
            onClick={props.showPublishNoteEditor}
          >
            <Icon path={mdiPencil} size={1} className={"mr-1"}></Icon> New Note
          </button>
        )}
      </div>
      {feedsContainer.notes ? (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap">
            {feedsContainer.notes.map((note) => {
              return (
                <div key={note._id} className={"mb-2 sm:m-2"}>
                  <NoteCard note={note}></NoteCard>
                </div>
              );
            })}
          </div>
          {feedsContainer.hasMoreNotes ? (
            <div className="ml-2 my-10 text-center">
              <button
                className="btn btn-accent"
                disabled={feedsContainer.isLoadingNotes}
                onClick={feedsContainer.loadMoreNotes}
              >
                {feedsContainer.isLoadingNotes ? "Loading..." : "Load More"}
              </button>
            </div>
          ) : (
            <div className="ml-2 my-10 text-center">
              <span className="text-primary-content">No more :Note</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-primary-content text-left">Loading :Note</div>
      )}
    </div>
  );
}
