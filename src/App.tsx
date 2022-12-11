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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RealmNote, Tab } from "./lib/types";
import { ProfileCards } from "./components/ProfileCards";
import { NoteCards } from "./components/NoteCards";
import NotePanel from "./components/NotePanel";
import { generateSummaryFromMarkdown } from "./lib/note";
import toastr from "toastr";
import NavBar from "./components/Navbar";
import TagsModal from "./components/TagsModal";
import { UserPanel } from "./components/UserPanel";
import { ProposalCards } from "./components/ProposalCards";
import millify from "millify";
import Icon from "@mdi/react";
import { mdiGold, mdiVote } from "@mdi/js";
import ProposalEditor from "./components/ProposalEditor";
import { MyobuDBProposal } from "myobu-protocol-client";
import ProposalsContainer from "./containers/proposals";
import ProposalPanel from "./components/ProposalPanel";

interface AppProps {
  tab: Tab;
}

function App(props: AppProps) {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();
  const proposalsContainer = ProposalsContainer.useContainer();

  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPublishNoteEditor, setShowPublishNoteEditor] = useState(false);
  const [showUpdateNoteEditor, setShowUpdateNoteEditor] = useState(false);
  const [showMakeNoteCommentEditor, setShowMakeNoteCommentEditor] =
    useState(false);
  const [showEditTagsModal, setShowEditTagsModal] = useState(false);
  const [showPublishProposalEditor, setShowPublishProposalEditor] =
    useState(false);
  const [showMakeProposalCommentEditor, setShowMakeProposalCommentEditor] =
    useState(false);
  const [showUpdateProposalEditor, setShowUpdateProposalEditor] =
    useState(false);

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
          const note: RealmNote = { ...summary, ipfsHash, markdown };
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
            markdown,
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

  const makeNoteComment = useCallback(
    async (markdown: string) => {
      if (!feedsContainer.note) {
        return alert("Note not found");
      } else if (!markdown) {
        return alert("Comment is empty");
      } else {
        setShowMakeNoteCommentEditor(false);
        try {
          toastr.info(`Uploading comment...`);
          await feedsContainer.makeNoteComment(markdown);
          toastr.success("Comment made!");
        } catch (error) {
          console.error(error);
          toastr.error("Error making comment");
        }
      }
    },
    [feedsContainer.note, feedsContainer.makeNoteComment]
  );

  const makeProposalComment = useCallback(
    async (markdown: string) => {
      if (!proposalsContainer.proposal) {
        return alert("Proposal not found");
      } else if (!markdown) {
        return alert("Comment is empty");
      } else {
        setShowMakeProposalCommentEditor(false);
        try {
          toastr.info(`Uploading comment...`);
          await proposalsContainer.makeProposalComment(markdown);
          toastr.success("Comment made!");
        } catch (error) {
          console.error(error);
          toastr.error("Error making comment");
        }
      }
    },
    [proposalsContainer.proposal, proposalsContainer.makeProposalComment]
  );

  const publishProposal = useCallback(
    async (proposal: MyobuDBProposal) => {
      console.log("Publish proposal: ", proposal);
      try {
        await proposalsContainer.publishProposal(proposal);
        setShowPublishProposalEditor(false);
        toastr.success("Proposal published!");
      } catch (error) {
        console.error(error);
        toastr.error("Error publishing proposal");
      }
    },
    [proposalsContainer.publishProposal]
  );

  const updateProposal = useCallback(
    async (newProposal: MyobuDBProposal) => {
      const newChoices = newProposal.choices || [];
      // Update proposal
      try {
        await proposalsContainer.updateProposal(newProposal);

        for (let i = 0; i < newChoices.length; i++) {
          const choice = newChoices[i];
          await proposalsContainer.addProposalChoice(choice.description);
        }
        setShowUpdateProposalEditor(false);
        toastr.success("Proposal updated!");
        window.location.reload();
      } catch (error) {
        console.error(error);
        toastr.error("Error updating proposal");
      }
    },
    [proposalsContainer.publishProposal, proposalsContainer.updateProposal]
  );

  useEffect(() => {
    appContainer.setParams(params);
    appContainer.setSearchParams(searchParams);
    appContainer.setTab(props.tab);
  }, [params, searchParams, props.tab]);

  return (
    <div className="App">
      <NavBar></NavBar>
      {/** Main body */}
      <div
        className="drawer drawer-mobile text-left"
        style={{ height: `calc(100vh - 64px)` }}
      >
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-1 sm:px-2 box-border">
          {/** right panel */}
          {props.tab === Tab.MNS && <ProfileCards></ProfileCards>}
          {props.tab === Tab.Notes && (
            <NoteCards
              showPublishNoteEditor={() => {
                setShowPublishNoteEditor(true);
              }}
            ></NoteCards>
          )}
          {props.tab === Tab.Note && (
            <NotePanel
              showUpdateNoteEditor={(markdown) => {
                setNoteMarkdown(markdown);
                setShowUpdateNoteEditor(true);
              }}
              showMakeNoteCommentEditor={() => {
                if (appContainer.signerProfile) {
                  setShowMakeNoteCommentEditor(true);
                } else {
                  if (!appContainer.signerAddress) {
                    toastr.error("Please connect wallet first");
                  } else {
                    toastr.error(
                      "Please register for MNS (Myobu Name Service) to make comment"
                    );
                    setTimeout(() => {
                      window.open(`https://protocol.myobu.io`, "_self");
                    }, 2000);
                  }
                }
              }}
              showEditTagsModal={() => {
                setShowEditTagsModal(true);
              }}
            ></NotePanel>
          )}
          {props.tab === Tab.Proposals && (
            <ProposalCards
              showProposalEditor={() => {
                setShowPublishProposalEditor(true);
              }}
            ></ProposalCards>
          )}
          {props.tab === Tab.Proposal && (
            <ProposalPanel
              showMakeProposalCommentEditor={() => {
                setShowMakeProposalCommentEditor(true);
              }}
              showUpdateProposalEditor={() => {
                setShowUpdateProposalEditor(true);
              }}
            ></ProposalPanel>
          )}
          {props.tab === Tab.User && <UserPanel></UserPanel>}
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          {/* left panel */}
          <div className="px-1 sm:px-4 pt-2 sm:pt-14 bg-[#212630] box-border">
            {appContainer.signerProfile ? (
              <div>
                <MNSProfileCard
                  labels={["MNS"]}
                  profile={appContainer.signerProfile}
                ></MNSProfileCard>
                <div className="stats shadow mt-4 mx-auto bg-neutral scale-[90%] sm:scale-100">
                  <div
                    className="stat"
                    title={(appContainer.signerVotingPower || "...").toString()}
                  >
                    <div className="stat-figure text-secondary">
                      <Icon path={mdiGold} size={1}></Icon>
                    </div>
                    <div className="stat-title">$MYOBU Balance</div>
                    <div className="stat-value text-primary">
                      {typeof appContainer.signerBalance === "undefined"
                        ? "..."
                        : millify(appContainer.signerBalance, {
                            precision: 2,
                          })}
                    </div>
                    <div className="stat-desc">
                      {typeof appContainer.myobuPrice !== "undefined" &&
                      typeof appContainer.signerBalance !== "undefined"
                        ? `≈ ${(
                            appContainer.myobuPrice * appContainer.signerBalance
                          ).toFixed(2)} USD`
                        : ""}
                      <br></br>On both ETH & BNB<br></br>including staked
                    </div>
                  </div>

                  <div
                    className="stat"
                    title={(appContainer.signerVotingPower || "...").toString()}
                  >
                    <div className="stat-figure text-secondary">
                      <Icon path={mdiVote} size={1}></Icon>
                    </div>
                    <div className="stat-title">Voting power</div>
                    <div className="stat-value text-primary">
                      {typeof appContainer.signerVotingPower === "undefined"
                        ? "..."
                        : millify(appContainer.signerVotingPower, {
                            precision: 2,
                          })}
                    </div>
                    <div className="stat-desc">
                      <a
                        href="https://myobu.io/#/staking"
                        target={"_blank"}
                        rel={"noreferrer"}
                        className="link"
                      >
                        Stake more
                      </a>{" "}
                      <br></br>to get more power
                    </div>
                  </div>
                </div>
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
                <label htmlFor="my-drawer" onClick={() => navigate(`/notes`)}>
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
                </label>
                <label
                  htmlFor="my-drawer"
                  onClick={() => navigate(`/proposals`)}
                >
                  <div
                    className="badge badge-lg cursor-pointer mr-2"
                    style={{
                      backgroundColor:
                        randomColorGenerator.generateColor(":proposal"),
                      color: generateForegroundColorBasedOnBackgroundColor(
                        randomColorGenerator.generateColor(":proposal")
                      ),
                    }}
                  >
                    :Proposal
                  </div>
                </label>
                <label htmlFor="my-drawer" onClick={() => navigate("/mns")}>
                  <div
                    className="badge badge-lg cursor-pointer mr-2"
                    style={{
                      backgroundColor:
                        randomColorGenerator.generateColor(":MNS"),
                    }}
                  >
                    :MNS
                  </div>
                </label>
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
      {showMakeNoteCommentEditor && (
        <Editor
          onClose={() => {
            setShowMakeNoteCommentEditor(false);
          }}
          noteMarkdown={""}
          placeholder={"Leave a comment"}
          confirmButtonText={"Comment"}
          onConfirm={makeNoteComment}
          disableInitialText={true}
        ></Editor>
      )}
      {showEditTagsModal && (
        <TagsModal
          onClose={() => {
            setShowEditTagsModal(false);
          }}
        ></TagsModal>
      )}
      {showPublishProposalEditor && (
        <ProposalEditor
          onClose={() => {
            setShowPublishProposalEditor(false);
          }}
          confirmButtonText={"Publish"}
          onConfirm={publishProposal}
        ></ProposalEditor>
      )}
      {showMakeProposalCommentEditor && (
        <Editor
          onClose={() => {
            setShowMakeProposalCommentEditor(false);
          }}
          noteMarkdown={""}
          placeholder={"Leave a comment"}
          confirmButtonText={"Comment"}
          onConfirm={makeProposalComment}
          disableInitialText={true}
        ></Editor>
      )}
      {showUpdateProposalEditor && proposalsContainer.proposal && (
        <ProposalEditor
          onClose={() => {
            setShowUpdateProposalEditor(false);
          }}
          confirmButtonText={"Update"}
          onConfirm={updateProposal}
          proposalToUpdate={proposalsContainer.proposal}
        ></ProposalEditor>
      )}
    </div>
  );
}

export default App;
