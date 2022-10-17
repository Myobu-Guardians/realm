import FeedsContainer from "../containers/feeds";
import { MNSProfileCard } from "./MyobuNameServices";

export function ProfileCards() {
  const feedsContainer = FeedsContainer.useContainer();
  return (
    <div className="pt-2 sm:pt-12">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        :MNS
      </div>
      <div className="columns-1 sm:columns-[24rem]">
        {feedsContainer.mnsProfiles.map((profile) => {
          return (
            <div key={profile._id} className={"mb-2 sm:m-2"}>
              <MNSProfileCard
                labels={["MNS"]}
                profile={profile}
              ></MNSProfileCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}