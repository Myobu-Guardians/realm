import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { MNSProfile, RealmNote } from "../lib/types";
import AppContainer from "./app";

const FeedsContainer = createContainer(() => {
  const [mnsProfiles, setMNSProfiles] = useState<MNSProfile[]>([]);
  const appContainer = AppContainer.useContainer();

  const publishNote = useCallback(
    async (note: RealmNote) => {
      if (appContainer.client) {
        const result = await appContainer.client.db({
          create: [
            {
              key: "note",
              labels: ["Note"],
              props: {
                summary: note.summary,
                images: note.images,
                ipfsHash: note.ipfsHash,
                arweaveId: note.arweaveId || "",
              },
            },
          ],
          return: ["note"],
        });
        console.log(result);
      } else {
        throw new Error("Client is not ready");
      }
    },
    [appContainer.client]
  );

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
    publishNote,
  };
});

export default FeedsContainer;
