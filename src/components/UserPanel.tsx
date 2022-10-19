import { mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useNavigate } from "react-router-dom";
import FeedsContainer from "../containers/feeds";
import { MNSProfileCard } from "./MyobuNameServices";
import { NoteCard } from "./NoteCards";

export function UserPanel() {
  const feedsContainer = FeedsContainer.useContainer();
  const navigate = useNavigate();

  return (
    <div className="relative p-1 sm:p-4 text-left">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        <span>:MNS</span>
      </div>
      {/* User profile card */}
      {feedsContainer.userProfile ? (
        <MNSProfileCard
          profile={feedsContainer.userProfile}
          labels={["MNS"]}
        ></MNSProfileCard>
      ) : (
        <div className="text-primary-content text-left">Loading :MNS</div>
      )}
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none mt-10">
        {feedsContainer.tagName ? (
          <div className="flex flex-row items-center">
            <Icon path={mdiTag} size={1} className={"mr-1"}></Icon>
            <span>{feedsContainer.tagName}</span>
          </div>
        ) : (
          <span>:NOTE</span>
        )}
      </div>
      {feedsContainer.userProfile && feedsContainer.userTags.length > 0 && (
        <div className="flex flex-row items-center mb-4">
          {feedsContainer.userTags.map((tag) => {
            return (
              <span
                key={`user-tag-` + tag._id}
                className={
                  "badge mr-2 cursor-pointer " +
                  (feedsContainer.tagName === tag.name
                    ? "badge-info"
                    : "badge-ghost")
                }
                onClick={() => {
                  if (feedsContainer.tagName === tag.name) {
                    navigate(`/${feedsContainer.userProfile?.name}.m`);
                  } else {
                    navigate(
                      `/${feedsContainer.userProfile?.name}.m?tag=${tag.name}`
                    );
                  }
                }}
              >
                <Icon path={mdiTag} size={0.5} className={"mr-1"}></Icon>
                {tag.name} {tag.noteCount}
              </span>
            );
          })}
        </div>
      )}
      <div className="columns-1 sm:columns-[24rem]">
        {feedsContainer.userNotes ? (
          feedsContainer.userNotes.length === 0 ? (
            <div className="text-primary-content text-left">No notes found</div>
          ) : (
            feedsContainer.userNotes.map((note) => {
              return (
                <div key={note._id} className={"mb-2 sm:m-2"}>
                  <NoteCard note={note}></NoteCard>
                </div>
              );
            })
          )
        ) : (
          <div className="text-primary-content text-left">Loading :Note</div>
        )}
      </div>
    </div>
  );
}
