import FeedsContainer from "../containers/feeds";
import { MNSProfileCard } from "./MyobuNameServices";

export function ProfileCards() {
  const feedsContainer = FeedsContainer.useContainer();
  return (
    <div className="pt-2 sm:pt-12">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        :MNS
      </div>
      {feedsContainer.mnsProfiles ? (
        <>
          <div className="columns-1 sm:columns-[24rem]">
            {feedsContainer.mnsProfiles.map((profile) => {
              return (
                <div key={profile._id} className={"mb-4 sm:m-4"}>
                  <MNSProfileCard
                    labels={["MNS"]}
                    profile={profile}
                  ></MNSProfileCard>
                </div>
              );
            })}
          </div>
          {feedsContainer.hasMoreMNSProfiles ? (
            <div className="ml-2 my-10 text-center">
              <button
                className="btn btn-accent"
                disabled={feedsContainer.isLoadingMNSProfiles}
                onClick={feedsContainer.loadMoreMNSProfiles}
              >
                {feedsContainer.isLoadingMNSProfiles
                  ? "Loading..."
                  : "Load More"}
              </button>
            </div>
          ) : (
            <div className="ml-2 my-10 text-center">
              <span className="text-primary-content">No more :MNS</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-primary-content text-left">Loading :MNS</div>
      )}
    </div>
  );
}
