import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { MNSProfile, RealmNote } from "../lib/types";
import AppContainer from "./app";

const FeedsContainer = createContainer(() => {
  const [mnsProfiles, setMNSProfiles] = useState<MNSProfile[]>([]);
  const [notes, setNotes] = useState<RealmNote[]>([]);

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
    if (appContainer.client && appContainer.tab === "mns") {
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
  }, [appContainer.client, appContainer.tab]);

  useEffect(() => {
    if (appContainer.client && appContainer.tab === "notes") {
      appContainer.client
        .db({
          match: [
            { key: "note", labels: ["Note"] },
            { key: "author", labels: ["MNS"] },
          ],
          where: {
            "author._owner": {
              $eq: "$note._owner",
            },
          },
          orderBy: {
            "note._createdAt": MyobuDBOrder.DESC,
          },
          return: [
            "note",
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        })
        .then((result) => {
          const notes = result.map((x) => {
            return {
              ...x.note.props,
              author: {
                name: x.authorName,
                displayName: x.authorDisplayName,
                avatar: x.authorAvatar || "",
              },
            };
          });
          setNotes(notes as any);
        });
    }
  }, [appContainer.client, appContainer.tab]);

  return {
    mnsProfiles,
    publishNote,
    notes,
  };
});

export default FeedsContainer;
