import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { MNSProfile } from "../lib/types";
import AppContainer from "./app";

const FeedsContainer = createContainer(() => {
  const [mnsProfiles, setMNSProfiles] = useState<MNSProfile[]>([]);
  const appContainer = AppContainer.useContainer();

  useEffect(() => {
    if (appContainer.client) {
      appContainer.client
        .db({
          match: [
            {
              key: "profile",
              labels: ["MNS"],
            },
          ],
          orderBy: {
            "profile._createdAt": MyobuDBOrder.DESC,
          },
          return: ["profile"],
        })
        .then((result) => {
          const feeds = result
            .map((x) => {
              if (x.profile) {
                return x.profile.props;
              } else {
                return null;
              }
            })
            .filter((x) => x);
          console.log(feeds);
          setMNSProfiles(feeds as any);
        });
    }
  }, [appContainer.client]);

  return {
    mnsProfiles,
  };
});

export default FeedsContainer;
