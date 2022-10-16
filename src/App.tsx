import React, { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@mdi/react";
import "./App.css";
import { mdiPencil, mdiMenu } from "@mdi/js";
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

interface AppProps {
  tab: Tab;
}

function App(props: AppProps) {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();
  const [showEditor, setShowEditor] = useState(false);
  const params = useParams();

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
        try {
          toastr.info("Uploading to IPFS...");
          const ipfsHash = await appContainer.ipfsAdd(markdown);
          console.log(await appContainer.ipfsCat(ipfsHash));
          const note: RealmNote = { ...summary, ipfsHash };
          await feedsContainer.publishNote(note);
          toastr.success("Note published!");
          localStorage.removeItem("note/markdown");
          setShowEditor(false);
        } catch (error) {
          console.error(error);
          toastr.error("Error publishing note");
        }
      }
    },
    [appContainer.ipfsAdd, appContainer.ipfsCat, feedsContainer.publishNote]
  );

  useEffect(() => {
    appContainer.setParams(params);
    appContainer.setTab(props.tab);
  }, [params, props.tab]);

  return (
    <div className="App">
      <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
        <div className="flex-1">
          {" "}
          <a
            className="btn btn-ghost normal-case text-xl hidden sm:flex"
            href="/"
          >
            REALM
          </a>
        </div>
        <div className="flex-none">
          {appContainer.signerProfile && (
            <button
              className="btn btn-primary mr-2"
              onClick={() => {
                setShowEditor(true);
              }}
            >
              <Icon path={mdiPencil} size={1} className={"mr-1"}></Icon> New
              Note
            </button>
          )}

          {appContainer.signer && appContainer.signerAddress ? (
            <button
              className="btn btn-secondary"
              title={appContainer.signerAddress}
            >
              {appContainer.signerAddress.slice(0, 12) + "..."}
            </button>
          ) : (
            connectWalletButton
          )}
          <div className="ml-2">
            <label
              htmlFor="my-drawer"
              className="btn btn-info drawer-button lg:hidden"
            >
              <Icon path={mdiMenu} size={1}></Icon>
            </label>
          </div>
        </div>
      </div>
      <div>
        <div
          className="drawer drawer-mobile text-left"
          style={{ height: `calc(100vh - 64px)` }}
        >
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content pt-2 px-0 sm:pt-12 sm:px-2">
            {/** right panel */}
            {props.tab === Tab.MNS && <ProfileCards></ProfileCards>}
            {props.tab === Tab.Notes && <NoteCards></NoteCards>}
            {props.tab === Tab.Note && <NotePanel></NotePanel>}
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
      </div>
      {showEditor && (
        <Editor
          onClose={() => setShowEditor(false)}
          confirmButtonText={"Publish"}
          onConfirm={publishNote}
        ></Editor>
      )}
    </div>
  );
}

export default App;
