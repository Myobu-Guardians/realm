import { renderPreview } from "@0xgg/echomd/preview";
import { mdiChevronLeft, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { formatDistanceToNowStrict } from "date-fns";
import { MyobuDBProposalVoteType } from "myobu-protocol-client";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppContainer from "../containers/app";
import ProposalsContainer from "../containers/proposals";
import toastr from "toastr";

export default function ProposalPanel() {
  const navigate = useNavigate();
  const proposalsContainer = ProposalsContainer.useContainer();
  const appContainer = AppContainer.useContainer();
  const previewElement = useRef<HTMLDivElement>(null);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  useEffect(() => {
    if (previewElement.current) {
      renderPreview(
        previewElement.current,
        proposalsContainer.proposal?.description || ""
      );
    }
  }, [proposalsContainer.proposal, previewElement]);

  useEffect(() => {
    setSelectedChoices(
      proposalsContainer.userVotes.map((x) => x.choiceId) || []
    );
  }, [proposalsContainer.userVotes]);

  if (!proposalsContainer.proposal) {
    // Loading proposal
    return (
      <div className="relative text-center text-2xl top-1/3">Loading...</div>
    );
  }

  return (
    <div className="relative p-1 sm:p-4">
      {/* Top banner */}
      <div className="w-full bg-[#2A303C] sticky top-0">
        <div className="w-[800px] max-w-full mx-auto flex flex-row items-center px-1 sm:px-0 py-2">
          <div className="flex flex-row items-center flex-1">
            {/* Check if history can go back */}
            <button
              className="btn btn-circle"
              onClick={() => {
                navigate(-1);
              }}
              title={"Back"}
            >
              <Icon path={mdiChevronLeft} size={1}></Icon>
            </button>
            {/* author */}
            <Link to={`/${proposalsContainer.proposal.author?.name || ""}.m`}>
              <div className="flex flex-row items-center">
                <div className="avatar mr-2">
                  <div className="w-[40px] rounded-full ring ring-white hover:bg-slate-200">
                    <img
                      src={
                        proposalsContainer.proposal.author?.avatar ||
                        `https://avatars.dicebear.com/api/big-ears-neutral/${
                          proposalsContainer.proposal.author?.name || ""
                        }.svg`
                      }
                      alt={proposalsContainer.proposal.author?.name + ".m"}
                    ></img>
                  </div>
                </div>
                <div className="flex flex-col text-sm">
                  <div className="font-bold hover:underline">
                    {proposalsContainer.proposal.author?.displayName}
                  </div>
                  <span className="hover:underline">
                    @{proposalsContainer.proposal.author?.name}.m
                  </span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex-none flex flex-col sm:flex-row items-center">
            {/* date */}
            <div className="badge ml-2">
              {new Date(
                proposalsContainer.proposal._createdAt || 0
              ).toLocaleString()}
            </div>
            <div className="flex flex-row items-center">
              {/* buttons */}
              {/*
              // TODO: support edit
              {proposalsContainer.proposal._owner ===
                appContainer.signerAddress && (
                <>
                  <button
                    className="btn btn-circle btn-success btn-sm ml-2"
                    title={"Edit proposal"}
                  >
                    <Icon className="" path={mdiPencil} size={1}></Icon>
                  </button>
                </>
              )}
                */}
            </div>
          </div>
        </div>
        <div className="w-[800px] max-w-full mx-auto px-1 sm:px-0 py-2">
          <span className="mr-2">
            {Date.now() <= proposalsContainer.proposal.endDate
              ? `Closes in `
              : `Closed `}{" "}
            {formatDistanceToNowStrict(
              new Date(proposalsContainer.proposal.endDate || 0)
            )}
            {Date.now() > proposalsContainer.proposal.endDate && " ago"}
          </span>
          {Date.now() > proposalsContainer.proposal.endDate && (
            <span className="badge bg-red-500">Ended</span>
          )}
          {Date.now() < proposalsContainer.proposal.startDate && (
            <span className="badge bg-blue-500">Upcoming</span>
          )}
          {Date.now() > proposalsContainer.proposal.startDate &&
            Date.now() < proposalsContainer.proposal.endDate && (
              <span className="badge bg-green-800">Active</span>
            )}
        </div>
        {/** Display the proposal */}
        <div className="w-[800px] max-w-full mx-auto px-1 sm:px-0 py-2">
          <div className="text-2xl font-bold">
            {proposalsContainer.proposal.title}
          </div>
          <div
            style={{
              backgroundColor: "inherit",
            }}
            className={"preview w-[800px] max-w-full mt-5"}
            ref={previewElement}
          ></div>
          <div className="mt-4">
            <div className="card shadow-sm w-full bg-neutral">
              <div className="card-body">
                <h2 className="card-title flex flex-row justify-between">
                  Votes{" "}
                  <span className="badge badge-info badge-sm float-right">
                    {proposalsContainer.proposal.voteType ===
                      MyobuDBProposalVoteType.SINGLE_CHOICE && "Single choice"}
                    {proposalsContainer.proposal.voteType ===
                      MyobuDBProposalVoteType.MULTIPLE_CHOICE &&
                      "Multiple choice"}
                  </span>
                </h2>
                <p>
                  Minimum voting power required to vote:{" "}
                  <span className="font-bold text-orange-400">
                    {proposalsContainer.proposal.minVotingPower}
                  </span>
                </p>
                {/** Display choices */}
                {proposalsContainer.proposal.choices.map((choice, index) => {
                  const proposal = proposalsContainer.proposal;
                  if (!proposal) return null;

                  return (
                    <div
                      className={`flex flex-row w-full items-center justify-between mb-2 rounded-md border ${
                        selectedChoices.includes(choice._id || "")
                          ? "border-orange-400"
                          : "border-gray-800"
                      } cursor-pointer hover:bg-gray-800 relative`}
                      key={`choice-${choice._id}`}
                      onClick={() => {
                        const proposal = proposalsContainer.proposal;
                        if (proposal) {
                          if (
                            proposal.voteType ===
                            MyobuDBProposalVoteType.SINGLE_CHOICE
                          ) {
                            // Single choice
                            setSelectedChoices((choices) => {
                              if (choices.includes(choice._id || "")) {
                                return [];
                              } else {
                                return [choice._id || ""];
                              }
                            });
                          } else if (
                            proposal.voteType ===
                            MyobuDBProposalVoteType.MULTIPLE_CHOICE
                          ) {
                            // Multiple choice
                            setSelectedChoices((choices) => {
                              if (choices.includes(choice._id || "")) {
                                return choices.filter(
                                  (c) => c !== (choice._id || "")
                                );
                              } else {
                                return [...choices, choice._id || ""];
                              }
                            });
                          }
                        }
                      }}
                    >
                      {/* bar */}
                      <div
                        style={{
                          width: `${(
                            (choice.totalVotingPower /
                              proposal.totalVotingPower || 0) * 100
                          ).toFixed(2)}%`,
                        }}
                        className={
                          "absolute left-0 top-0 h-full rounded-md bg-[#262d38] hover:bg-transparent"
                        }
                      ></div>

                      <div className="flex flex-row items-center relative flex-1 z-50">
                        {/* description */}
                        <div className="p-2 z-50 flex flex-row items-center">
                          <div className="text-lg z-50">
                            {choice.description}
                          </div>
                          <span className="text-gray-600 text-sm ml-2 z-50">
                            {choice.totalVotingPower} voting power collected
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-gray-400 text-lg flex-none mr-4 w-[64px] text-right z-50">{`${(
                        (choice.totalVotingPower / proposal.totalVotingPower ||
                          0) * 100
                      ).toFixed(2)}%`}</div>
                    </div>
                  );
                })}
                {/** Vote button */}
                {Date.now() >= proposalsContainer.proposal.startDate &&
                  Date.now() <= proposalsContainer.proposal.endDate && (
                    <button
                      className="btn btn-primary w-full"
                      disabled={
                        selectedChoices.length === 0 ||
                        appContainer.signerVotingPower === undefined ||
                        appContainer.signerVotingPower <
                          proposalsContainer.proposal.minVotingPower
                      }
                      onClick={() => {
                        if (
                          selectedChoices.length &&
                          proposalsContainer.proposal
                        ) {
                          proposalsContainer
                            .vote(selectedChoices)
                            .then(() => {
                              window.location.reload();
                            })
                            .catch(() => {
                              toastr.error("Failed to vote");
                            });
                        }
                      }}
                    >
                      {!appContainer.signerAddress
                        ? `Please connect wallet first`
                        : (appContainer.signerVotingPower || 0) <
                          proposalsContainer.proposal.minVotingPower
                        ? `You voting power ${
                            appContainer.signerVotingPower === undefined
                              ? "..."
                              : appContainer.signerVotingPower
                          } is too low to vote`
                        : `Vote`}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
