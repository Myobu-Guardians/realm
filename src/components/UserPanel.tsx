import { mdiChevronLeft, mdiTag } from "@mdi/js";
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
      <div className=" ml-2 mb-4 flex flex-row items-center">
        <button
          className="btn btn-circle mr-2"
          onClick={() => {
            navigate(-1);
          }}
          title={"Back"}
        >
          <Icon path={mdiChevronLeft} size={1}></Icon>
        </button>
        <div className="text-3xl text-primary-content select-none">
          <span>:MNS</span>
        </div>
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
        {feedsContainer.userNotesTagName ? (
          <div className="flex flex-row items-center">
            <Icon path={mdiTag} size={1} className={"mr-1"}></Icon>
            <span>{feedsContainer.userNotesTagName}</span>
          </div>
        ) : (
          <span>:Note</span>
        )}
      </div>
      {feedsContainer.userProfile && feedsContainer.userTags.length > 0 && (
        <div className="flex flex-row items-center mb-4">
          {feedsContainer.userTags
            .sort((x, y) => x.name.localeCompare(y.name))
            .map((tag) => {
              return (
                <span
                  key={`user-tag-` + tag._id}
                  className={
                    "badge mr-2 cursor-pointer " +
                    (feedsContainer.userNotesTagName === tag.name
                      ? "badge-info"
                      : "badge-ghost")
                  }
                  onClick={() => {
                    if (feedsContainer.userNotesTagName === tag.name) {
                      navigate(`/${feedsContainer.userProfile?.name}.m`);
                    } else {
                      navigate(
                        `/${feedsContainer.userProfile?.name}.m?tag=${tag.name}`
                      );
                    }
                  }}
                >
                  <Icon path={mdiTag} size={0.5} className={"mr-1"}></Icon>
                  {tag.name}{" "}
                  <span className="ml-1 text-gray-600">{tag.noteCount}</span>
                </span>
              );
            })}
        </div>
      )}
      {feedsContainer.userNotes ? (
        <>
          <div className="columns-1 sm:columns-[24rem]">
            {feedsContainer.userNotes.map((note) => {
              return (
                <div key={note._id} className={"mb-2 sm:m-2"}>
                  <NoteCard note={note}></NoteCard>
                </div>
              );
            })}
          </div>
          {feedsContainer.hasMoreUserNotes ? (
            <div className="ml-2 my-10 text-center">
              <button
                className="btn btn-accent"
                disabled={feedsContainer.isLoadingUserNotes}
                onClick={feedsContainer.loadMoreUserNotes}
              >
                {feedsContainer.isLoadingUserNotes ? "Loading..." : "Load More"}
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
