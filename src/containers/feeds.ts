import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { Summary } from "../lib/note";
import { Comment, MNSProfile, RealmNote, Tab } from "../lib/types";
import AppContainer from "./app";

interface UpdateNoteArgs extends Summary {
  noteId: string;
  ipfsHash: string;
}

const FeedsContainer = createContainer(() => {
  const [mnsProfiles, setMNSProfiles] = useState<MNSProfile[]>([]);
  const [notes, setNotes] = useState<RealmNote[]>([]);
  const [note, setNote] = useState<RealmNote | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);

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

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (appContainer.client && appContainer.signerAddress && noteId) {
        await appContainer.client.db({
          match: [
            {
              key: "note",
              labels: ["Note"],
              props: {
                _id: noteId,
                _owner: appContainer.signerAddress,
              },
            },
          ],
          detachDelete: ["note"],
          return: ["note"],
        });
        setNotes((notes) => notes.filter((n) => n._id !== noteId));
      }
    },
    [appContainer.client, appContainer.signerAddress]
  );

  const updateNote = useCallback(
    async (args: UpdateNoteArgs) => {
      if (appContainer.client && appContainer.signerAddress && args.noteId) {
        const result = await appContainer.client.db({
          match: [
            {
              key: "note",
              labels: ["Note"],
              props: {
                _id: args.noteId,
                _owner: appContainer.signerAddress,
              },
            },
          ],
          set: {
            "note.ipfsHash": args.ipfsHash,
            "note.summary": args.summary,
            "note.images": args.images,
          },
          return: ["note"],
        });
        setNotes((notes) =>
          notes.map((n) => {
            if (n._id === args.noteId) {
              return {
                ...n,
                ipfsHash: args.ipfsHash,
                summary: args.summary,
                images: args.images,
                _updatedAt: Date.now(),
              };
            }
            return n;
          })
        );
      }
    },
    [appContainer.client, appContainer.signerAddress]
  );

  const makeComment = useCallback(
    async (markdown: string) => {
      if (
        appContainer.client &&
        appContainer.signerAddress &&
        note &&
        note._id
      ) {
        const result = await appContainer.client.db({
          match: [
            {
              key: "note",
              labels: ["Note"],
              props: {
                _id: note._id,
              },
            },
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
              type: "COMMENTED",
              from: { key: "author" },
              to: {
                key: "comment",
                labels: ["Comment"],
                props: {
                  markdown,
                },
              },
            },
            {
              key: "r2",
              type: "COMMENTED",
              from: { key: "comment" },
              to: { key: "note" },
            },
          ],
          return: [
            "comment",
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        });
        console.log(result);
        const comment: Comment = {
          ...(result[0].comment.props as any),
          author: {
            name: result[0].authorName,
            displayName: result[0].authorDisplayName,
            avatar: result[0].authorAvatar || "",
          } as any,
        };
        console.log(comment);
      } else {
        throw new Error("Client is not ready");
      }
    },
    [appContainer.client, appContainer.signerAddress, note]
  );

  // Fetch MNS Profiles
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
          setMNSProfiles(feeds as any);
        });
    }
  }, [appContainer.client, appContainer.tab]);

  // Fetch Notes
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

  // Fetch Note
  useEffect(() => {
    if (
      appContainer.tab === Tab.Note &&
      appContainer.params.noteId &&
      appContainer.client
    ) {
      const findNote = notes.find((x) => x._id === appContainer.params.noteId);
      if (findNote) {
        setNote(findNote);
      } else {
        appContainer.client
          .db({
            match: [
              {
                key: "note",
                labels: ["Note"],
                props: { _id: appContainer.params.noteId },
              },
              { key: "author", labels: ["MNS"] },
            ],
            where: {
              "author._owner": {
                $eq: "$note._owner",
              },
            },
            return: [
              "note",
              { key: "author.displayName", as: "authorDisplayName" },
              { key: "author.name", as: "authorName" },
              { key: "author.avatar", as: "authorAvatar" },
            ],
          })
          .then((result) => {
            const note: RealmNote = {
              ...result[0].note.props,
              author: {
                name: result[0].authorName,
                displayName: result[0].authorDisplayName,
                avatar: result[0].authorAvatar || "",
              },
            } as any;
            setNote(note);
          });
      }
    }
  }, [appContainer.client, appContainer.tab, appContainer.params, notes]);

  // Fetch note comment
  useEffect(() => {
    if (!note) {
      setComments([]);
    } else if (appContainer.client) {
      /*
      appContainer.client.db({
        match: [
          {
            key: "",
          },
        ],
      });
      */
    }
  }, [note, appContainer.client]);

  return {
    mnsProfiles,
    publishNote,
    deleteNote,
    updateNote,
    makeComment,
    notes,
    note,
    comments,
  };
});

export default FeedsContainer;
