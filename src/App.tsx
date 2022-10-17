import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import AppContainer from "./containers/app";
import { MNSProfileCard } from "./components/MyobuNameServices";
import FeedsContainer from "./containers/feeds";
import "./editor";
import Editor from "./components/Editor";
import {
  generateForegroundColorBasedOnBackgroundColor,
  randomColorGenerator,
} from "./lib/utils";
import { Link, useParams } from "react-router-dom";
import { RealmNote, Tab } from "./lib/types";
import { ProfileCards } from "./components/ProfileCards";
import { NoteCards } from "./components/NoteCards";
import NotePanel from "./components/NotePanel";
import { generateSummaryFromMarkdown } from "./lib/note";
import toastr from "toastr";
import NavBar from "./components/Navbar";

interface AppProps {
  tab: Tab;
}

function App(props: AppProps) {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();
  const params = useParams();
  const [showPublishNoteEditor, setShowPublishNoteEditor] = useState(false);
  const [showUpdateNoteEditor, setShowUpdateNoteEditor] = useState(false);
  const [showMakeCommentEditor, setShowMakeCommentEditor] = useState(false);
  const [noteMarkdown, setNoteMarkdown] = useState("");

  const connectWalletButton = useMemo(() => {
    return (
      <button
        className="btn btn-primary"
        onClick={appContainer.connectToMetaMask}
      >
        Connect Wallet
      </button>
    );
  }, [appContainer.connectToMetaMask]);

  const publishNote = useCallback(
    async (markdown: string) => {
      if (!markdown.length) {
        return alert("Note is empty");
      } else {
        const summary = generateSummaryFromMarkdown(markdown);
        console.log(summary);
        setShowPublishNoteEditor(false);
        try {
          toastr.info("Uploading to IPFS...");
          const ipfsHash = await appContainer.ipfsAdd(markdown);
          console.log(await appContainer.ipfsCat(ipfsHash));
          const note: RealmNote = { ...summary, ipfsHash };
          await feedsContainer.publishNote(note);
          toastr.success("Note published!");
          localStorage.removeItem("note/markdown");
        } catch (error) {
          console.error(error);
          toastr.error("Error publishing note");
        }
      }
    },
    [appContainer.ipfsAdd, appContainer.ipfsCat, feedsContainer.publishNote]
  );

  const updateNote = useCallback(
    async (markdown: string) => {
      if (!feedsContainer.note) {
        return alert("Note not found");
      } else if (!markdown.length) {
        return alert("Note is empty");
      } else {
        const summary = generateSummaryFromMarkdown(markdown);
        console.log(summary);
        setShowUpdateNoteEditor(false);
        try {
          const note = feedsContainer.note;
          toastr.info("Uploading to IPFS...");
          const ipfsHash = await appContainer.ipfsAdd(markdown);
          console.log(await appContainer.ipfsCat(ipfsHash));
          await feedsContainer.updateNote({
            noteId: note._id || "",
            ipfsHash,
            ...summary,
          });
          toastr.success("Note updated!");
          localStorage.removeItem("note/markdown");
        } catch (error) {
          console.error(error);
          toastr.error("Error updating note");
        }
      }
    },
    [
      feedsContainer.note,
      feedsContainer.updateNote,
      appContainer.ipfsAdd,
      appContainer.ipfsCat,
    ]
  );

  const makeComment = useCallback(
    async (markdown: string) => {
      if (!feedsContainer.note) {
        return alert("Note not found");
      } else if (!markdown) {
        return alert("Comment is empty");
      } else {
        setShowMakeCommentEditor(false);
        try {
          toastr.info(`Uploading comment...`);
          await feedsContainer.makeComment(markdown);
          toastr.success("Comment made!");
        } catch (error) {
          console.error(error);
          toastr.error("Error making comment");
        }
      }
    },
    [feedsContainer.note, feedsContainer.makeComment]
  );

  useEffect(() => {
    appContainer.setParams(params);
    appContainer.setTab(props.tab);
  }, [params, props.tab]);

  return (
    <div className="App">
      <NavBar
        showPublishNoteEditor={() => {
          setShowPublishNoteEditor(true);
        }}
      ></NavBar>
      {/** Main body */}
      <div
        className="drawer drawer-mobile text-left"
        style={{ height: `calc(100vh - 64px)` }}
      >
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-0 sm:px-2">
          {/** right panel */}
          {props.tab === Tab.MNS && <ProfileCards></ProfileCards>}
          {props.tab === Tab.Notes && <NoteCards></NoteCards>}
          {props.tab === Tab.Note && (
            <NotePanel
              showUpdateNoteEditor={(markdown) => {
                setNoteMarkdown(markdown);
                setShowUpdateNoteEditor(true);
              }}
              showMakeCommentEditor={() => {
                if (appContainer.signerProfile) {
                  setShowMakeCommentEditor(true);
                } else {
                  toastr.error(
                    "Please register for MNS (Myobu Name Service) to make comment"
                  );
                  setTimeout(() => {
                    window.open(`https://protocol.myobu.io`, "_self");
                  }, 2000);
                }
              }}
            ></NotePanel>
          )}
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          {/* left panel */}
          <div className="px-0 sm:px-4 pt-2 sm:pt-14 bg-[#212630]">
            {appContainer.signerProfile ? (
              <div>
                <MNSProfileCard
                  labels={["MNS"]}
                  profile={appContainer.signerProfile}
                ></MNSProfileCard>
                {/*
                  <div className="mt-4 px-2 sm:px-0">
                    <div className="text-primary-content text-lg text-left uppercase font-bold mb-2">
                      Your Realm
                    </div>
                    <div>
                      <Link to={`/${appContainer.signerProfile.name}.m/notes`}>
                        <div
                          className="badge badge-lg cursor-pointer"
                          style={{
                            backgroundColor:
                              randomColorGenerator.generateColor(":Note"),
                            color:
                              generateForegroundColorBasedOnBackgroundColor(
                                randomColorGenerator.generateColor(":Note")
                              ),
                          }}
                        >
                          :Note
                        </div>
                      </Link>
                    </div>
                  </div>
                  */}
              </div>
            ) : (
              <div className="relative">
                <div className="blur-sm mx-auto">
                  <MNSProfileCard
                    labels={["MNS"]}
                    profile={{
                      name: "mns",
                      displayName: "Myobu Name Service",
                    }}
                  ></MNSProfileCard>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {appContainer.signer && appContainer.signerAddress ? (
                    <a
                      href="https://protocol.myobu.io/#/mns"
                      className="btn btn-secondary"
                    >
                      Register for your account
                    </a>
                  ) : (
                    connectWalletButton
                  )}
                </div>
              </div>
            )}
            {/* Navigation menu */}
            <div className="mt-4 px-2 sm:px-0">
              <div className="text-primary-content text-lg text-left uppercase font-bold mb-2">
                Myobu Realm
              </div>
              <div>
                <Link to={"/mns"}>
                  <div
                    className="badge badge-lg cursor-pointer mr-2"
                    style={{
                      backgroundColor:
                        randomColorGenerator.generateColor(":MNS"),
                    }}
                  >
                    :MNS
                  </div>
                </Link>
                <Link to={`/notes`}>
                  <div
                    className="badge badge-lg cursor-pointer mr-2"
                    style={{
                      backgroundColor:
                        randomColorGenerator.generateColor(":Note"),
                      color: generateForegroundColorBasedOnBackgroundColor(
                        randomColorGenerator.generateColor(":Note")
                      ),
                    }}
                  >
                    :Note
                  </div>
                </Link>
                <div
                  className="badge badge-lg cursor-not-allowed"
                  style={{
                    backgroundColor:
                      randomColorGenerator.generateColor(":Game"),
                    color: generateForegroundColorBasedOnBackgroundColor(
                      randomColorGenerator.generateColor(":Game")
                    ),
                  }}
                  title={"Coming soon"}
                >
                  :Game
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/** Modals */}
      {showPublishNoteEditor && (
        <Editor
          onClose={() => setShowPublishNoteEditor(false)}
          confirmButtonText={"Publish"}
          onConfirm={publishNote}
        ></Editor>
      )}
      {showUpdateNoteEditor && (
        <Editor
          onClose={() => {
            setShowUpdateNoteEditor(false);
          }}
          noteMarkdown={noteMarkdown}
          confirmButtonText={"Update"}
          onConfirm={updateNote}
        ></Editor>
      )}
      {showMakeCommentEditor && (
        <Editor
          onClose={() => {
            setShowMakeCommentEditor(false);
          }}
          noteMarkdown={""}
          placeholder={"Leave a comment"}
          confirmButtonText={"Comment"}
          onConfirm={makeComment}
          disableInitialText={true}
        ></Editor>
      )}
    </div>
  );
}

export default App;
