import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { RealmFeed } from "../lib/types";
import AppContainer from "./app";

const FeedsContainer = createContainer(() => {
  const [feeds, setFeeds] = useState<RealmFeed[]>([]);
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
          console.log(result);
          const feeds = result
            .map((x) => {
              if (x.profile) {
                if (x.profile.labels?.includes("MNS")) {
                  return {
                    type: "mns",
                    props: x.profile.props,
                  };
                } else {
                  return {
                    type: "note",
                    props: x.profile.props,
                  };
                }
              } else {
                return null;
              }
            })
            .filter((x) => x);
          console.log(feeds);
          setFeeds(feeds as any);
        });
    }
  }, [appContainer.client]);

  return {
    feeds,
  };
});

export default FeedsContainer;
