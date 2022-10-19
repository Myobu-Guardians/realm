import { MyobuDBOrder } from "myobu-protocol-client/out/src/types";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { sanitizeTag, Summary } from "../lib/note";
import { Comment, MNSProfile, RealmNote, Tab, Tag } from "../lib/types";
import AppContainer from "./app";

const itemsPerPage = 1;

interface UpdateNoteArgs extends Summary {
  noteId: string;
  ipfsHash: string;
}

const FeedsContainer = createContainer(() => {
  // :MNS
  const [mnsProfiles, setMNSProfiles] = useState<MNSProfile[] | undefined>(
    undefined
  );
  const [hasMoreMNSProfiles, setHasMoreMNSProfiles] = useState<boolean>(true);
  const [mnsProfilesPage, setMNSProfilesPage] = useState<number>(0);
  const [isLoadingMNSProfiles, setIsLoadingMNSProfiles] =
    useState<boolean>(false);

  // :Note
  const [notes, setNotes] = useState<RealmNote[]>([]);
  const [hasMoreNotes, setHasMoreNotes] = useState<boolean>(true);
  const [notesPage, setNotesPage] = useState<number>(0);
  const [tagName, setTagName] = useState<string | undefined>(undefined);

  // NotePanel
  const [note, setNote] = useState<RealmNote | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // UserPanel
  const [userNotes, setUserNotes] = useState<RealmNote[] | undefined>(
    undefined
  );
  const [hasMoreUserNotes, setHasMoreUserNotes] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<MNSProfile | undefined>(
    undefined
  );
  const [userTags, setUserTags] = useState<Tag[]>([]);

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
              key: "note",
              labels: ["Note"],
              props: {
                summary: note.summary,
                images: note.images,
                ipfsHash: note.ipfsHash,
                arweaveId: note.arweaveId || "",
              },
            },
            {
              key: "r",
              type: "POSTED",
              from: { key: "author" },
              to: { key: "note" },
            },
            {
              key: "r2",
              type: "SUBSCRIBED_TO",
              from: { key: "author" },
              to: { key: "note" },
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
              key: "comment",
              labels: ["Comment"],
              props: {
                markdown,
              },
            },
            {
              key: "r",
              type: "POSTED",
              from: { key: "author" },
              to: { key: "comment" },
            },
            {
              key: "r2",
              type: "COMMENTED_ON",
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
        const comment: Comment = {
          ...(result[0].comment.props as any),
          author: {
            name: result[0].authorName,
            displayName: result[0].authorDisplayName,
            avatar: result[0].authorAvatar || "",
          } as any,
        };
        console.log("makeComment: ", comment);
        setComments((comments) => [...comments, comment]);
      } else {
        throw new Error("Client is not ready");
      }
    },
    [appContainer.client, appContainer.signerAddress, note]
  );

  const addTagToNote = useCallback(
    async (tagName: string): Promise<Tag | undefined> => {
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
                _owner: appContainer.signerAddress,
              },
            },
          ],
          merge: [
            {
              key: "tag",
              labels: ["Tag"],
              props: {
                _owner: appContainer.signerAddress,
                name: tagName,
                sanitizedName: sanitizeTag(tagName),
              },
            },
            {
              key: "r",
              type: "TAGGED_WITH",
              from: { key: "note" },
              to: { key: "tag" },
            },
          ],
          return: ["tag"],
        });
        console.log("addTagToNote: ", result);
        const tag = result[0].tag.props as any;
        setTags((tags) => [...tags, tag]);
      } else {
        return undefined;
      }
    },
    [appContainer.client, appContainer.signerAddress, note]
  );

  const deleteTagFromNote = useCallback(
    async (tagName: string) => {
      if (
        appContainer.client &&
        appContainer.signerAddress &&
        note &&
        note._id
      ) {
        const result = await appContainer.client.db({
          match: [
            {
              type: "TAGGED_WITH",
              key: "r",
              from: {
                key: "note",
                labels: ["Note"],
                props: {
                  _id: note._id,
                },
              },
              to: {
                key: "tag",
                labels: ["Tag"],
                props: {
                  _owner: appContainer.signerAddress,
                  name: tagName,
                },
              },
            },
          ],
          delete: ["r"],
          return: ["tag"],
        });
        console.log("deleteTagFromNote: ", result);
        setTags((tags) => {
          return tags.filter((t) => t.name !== tagName);
        });
      }
    },
    [appContainer.client, appContainer.signerAddress, note]
  );

  const getTagsOfNote = useCallback(async (): Promise<Tag[]> => {
    if (appContainer.client && note && note._id && note._owner) {
      const result = await appContainer.client.db({
        match: [
          {
            type: "TAGGED_WITH",
            key: "r",
            from: {
              key: "note",
              labels: ["Note"],
              props: {
                _id: note._id,
              },
            },
            to: {
              key: "tag",
              labels: ["Tag"],
              props: {
                _owner: note._owner,
              },
            },
          },
        ],
        return: ["tag"],
      });
      console.log("getTagsOfNote: ", result);
      return result.map((r) => r.tag.props) as any;
    } else {
      return [];
    }
  }, [appContainer.client, note]);

  const loadMoreMNSProfiles = useCallback(async () => {
    setMNSProfilesPage((page) => page + 1);
  }, []);

  // Fetch MNS Profiles
  useEffect(() => {
    if (appContainer.client && appContainer.tab === "mns") {
      setIsLoadingMNSProfiles(true);
      appContainer.client
        .db({
          match: [
            {
              key: "profile",
              labels: ["MNS"],
            },
          ],
          limit: itemsPerPage,
          skip: mnsProfilesPage * itemsPerPage,
          orderBy: {
            "profile._createdAt": MyobuDBOrder.DESC,
          },
          return: ["profile"],
        })
        .then((result) => {
          const profiles = result
            .map((x) => {
              if (x.profile) {
                return x.profile.props;
              } else {
                return null;
              }
            })
            .filter((x) => x);
          setHasMoreMNSProfiles(profiles.length === itemsPerPage);
          setMNSProfiles((oldProfiles) => {
            return (
              ([...(oldProfiles || []), ...profiles] as MNSProfile[])
                // Remove duplicates
                .filter((p, index, self) => {
                  return index === self.findIndex((t) => t._id === p._id);
                })
            );
          });
          setIsLoadingMNSProfiles(false);
        })
        .catch((error) => {
          setIsLoadingMNSProfiles(false);
        });
    }
  }, [appContainer.client, appContainer.tab, mnsProfilesPage]);

  // Fetch Notes
  useEffect(() => {
    if (appContainer.client && appContainer.tab === "notes") {
      const tag = appContainer.searchParams?.get("tag");
      setTagName(tag || undefined);

      appContainer.client
        .db({
          match: [
            {
              type: "POSTED",
              from: {
                key: "author",
                labels: ["MNS"],
              },
              to: {
                key: "note",
                labels: ["Note"],
              },
              key: "r",
            },
            ...(tag
              ? [
                  {
                    key: "r2",
                    type: "TAGGED_WITH",
                    from: {
                      key: "note",
                    },
                    to: {
                      key: "tag",
                      labels: ["Tag"],
                      props: {
                        sanitizedName: sanitizeTag(tag),
                      },
                    },
                  },
                ]
              : []),
          ],
          where: {
            "author._owner": {
              $eq: "$note._owner",
            },
            ...(tag
              ? {
                  "note._owner": {
                    $eq: "$tag._owner",
                  },
                }
              : {}),
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
          console.log("fetched notes: ", notes);
          setNotes(notes as any);
        });
    }
  }, [appContainer.client, appContainer.tab, appContainer.searchParams]);

  // Fetch User Profile
  useEffect(() => {
    if (
      appContainer.tab === Tab.User &&
      appContainer.params.username &&
      appContainer.client
    ) {
      const username = appContainer.params.username.replace(/\.m$/, "");

      if (!userProfile || (userProfile && userProfile.name !== username)) {
        setUserProfile(undefined);
        setUserNotes(undefined);
        setUserTags([]);

        // Fetch User Profile
        appContainer.client
          .db({
            match: [
              {
                key: "profile",
                labels: ["MNS"],
                props: { name: username },
              },
            ],
            return: ["profile"],
          })
          .then((result) => {
            console.log(result, username);
            if (result.length && result[0].profile) {
              setUserProfile(result[0].profile.props as any);
            }
          })
          .catch(() => {
            setUserProfile(undefined);
          });
      }
    }
  }, [appContainer.client, appContainer.tab, appContainer.params, userProfile]);

  // Fetch User Notes
  useEffect(() => {
    if (appContainer.client && userProfile) {
      appContainer.client
        .db({
          match: [
            {
              key: "r",
              type: "POSTED",
              from: {
                key: "author",
                labels: ["MNS"],
                props: {
                  name: userProfile.name,
                  _owner: userProfile._owner || "",
                },
              },
              to: {
                key: "note",
                labels: ["Note"],
                props: {
                  _owner: userProfile._owner || "",
                },
              },
            },
            ...(tagName
              ? [
                  {
                    key: "r2",
                    type: "TAGGED_WITH",
                    from: {
                      key: "note",
                    },
                    to: {
                      key: "tag",
                      labels: ["Tag"],
                      props: {
                        sanitizedName: sanitizeTag(tagName),
                        _owner: userProfile._owner || "",
                      },
                    },
                  },
                ]
              : []),
          ],
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
          setUserNotes(notes as any);
        });
    }
  }, [appContainer.client, userProfile, tagName]);

  // Set User Tag
  useEffect(() => {
    if (appContainer.tab === Tab.User) {
      const tag = appContainer.searchParams?.get("tag");
      setTagName(tag || undefined);
    }
  }, [appContainer.tab, appContainer.searchParams]);

  // Fetch User Tags
  useEffect(() => {
    if (appContainer.client && userProfile) {
      appContainer.client
        .db({
          match: [
            {
              key: "r",
              type: "TAGGED_WITH",
              from: { key: "note", labels: ["Note"] },
              to: { key: "tag", labels: ["Tag"] },
            },
          ],
          return: [
            { key: "tag", distinct: true },
            { key: "tag", count: true, as: "noteCount" },
          ],
        })
        .then((result) => {
          const tags = result.map((x) => {
            return { ...x.tag.props, noteCount: x.noteCount };
          });
          console.log("userTags: ", tags);
          setUserTags(tags as any);
        });
    }
  }, [appContainer.client, userProfile]);

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

  // Reset note comments on note change
  useEffect(() => {
    if (appContainer.tab === Tab.Note) {
      setComments([]);
      setTags([]);
    }
  }, [appContainer.tab]);

  useEffect(() => {
    getTagsOfNote()
      .then((tags) => {
        setTags(tags);
      })
      .catch(() => {
        setTags([]);
      });
  }, [getTagsOfNote]);

  // Fetch note comments
  useEffect(() => {
    if (!note) {
      setComments([]);
    } else if (appContainer.client) {
      appContainer.client
        .db({
          match: [
            {
              key: "r1",
              type: "POSTED",
              from: {
                key: "author",
              },
              to: {
                key: "comment",
              },
            },
            {
              key: "r2",
              type: "COMMENTED_ON",
              from: {
                key: "comment",
              },
              to: {
                key: "note",
                labels: ["Note"],
                props: {
                  _id: note._id || "",
                },
              },
            },
          ],
          orderBy: {
            "comment._createdAt": MyobuDBOrder.ASC,
          },
          return: [
            "comment",
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        })
        .then((result) => {
          const comments = result.map((x) => {
            return {
              ...x.comment.props,
              author: {
                name: x.authorName,
                displayName: x.authorDisplayName,
                avatar: x.authorAvatar || "",
              },
            };
          });
          console.log("fetch comments: ", comments);
          setComments(comments as any);
        });
    }
  }, [note, appContainer.client]);

  return {
    publishNote,
    deleteNote,
    updateNote,
    makeComment,
    addTagToNote,
    deleteTagFromNote,
    getTagsOfNote,
    loadMoreMNSProfiles,
    mnsProfiles,
    hasMoreMNSProfiles,
    isLoadingMNSProfiles,
    notes,
    hasMoreNotes,
    note,
    comments,
    tags,
    tagName,
    userNotes,
    hasMoreUserNotes,
    userProfile,
    userTags,
  };
});

export default FeedsContainer;
