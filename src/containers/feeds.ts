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
      if (appContainer.client && appContainer.signerAddress) {
        const result = await appContainer.client.db({
          match: [
            {
              key: "author",
              labels: ["MNS"],
              props: {
                _owner: appContainer.signerAddress,
              },
            },
          ],
          create: [
            {
              key: "r",
              type: "POSTED",
              from: { key: "author" },
              to: {
                key: "note",
                labels: ["Note"],
                props: {
                  summary: note.summary,
                  images: note.images,
                  ipfsHash: note.ipfsHash,
                  arweaveId: note.arweaveId || "",
                },
              },
            },
          ],
          return: [
            "note",
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        });
        console.log(result);
        setNotes((notes) => [
          {
            ...result[0].note.props,
            author: {
              name: result[0].authorName,
              displayName: result[0].authorDisplayName,
              avatar: result[0].authorAvatar || "",
            },
          } as any,
          ...notes,
        ]);
      } else {
        throw new Error("Client is not ready");
      }
    },
    [appContainer.client, appContainer.signerAddress]
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
