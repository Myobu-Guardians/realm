import FeedsContainer from "../containers/feeds";
import { RealmNote } from "../lib/types";

interface NoteCardProps {
  note: RealmNote;
}
export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="card w-96 max-w-full bg-neutral text-gray-300 shadow-xl mx-auto text-left">
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
          <div className="flex flex-row items-center">
            <div className="avatar mr-2">
              <div className="w-[40px] rounded-full ring ring-white">
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
              <div className="font-bold">{note.author?.displayName}</div>
              <span>@{note.author?.name}.m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NoteCards() {
  const feedsContainer = FeedsContainer.useContainer();

  return (
    <div>
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        :NOTE
      </div>
      <div className="columns-1 sm:columns-[24rem]">
        {feedsContainer.notes.length === 0 ? (
          <div className="text-primary-content text-center">No notes found</div>
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
