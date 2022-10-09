import FeedsContainer from "../containers/feeds";
import { MNSProfileCard } from "./MyobuNameServices";

export function ProfileCards() {
  const feedsContainer = FeedsContainer.useContainer();
  return (
    <div>
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none">
        :MNS
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start">
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
