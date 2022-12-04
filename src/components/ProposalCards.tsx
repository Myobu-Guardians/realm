import { mdiVote } from "@mdi/js";
import Icon from "@mdi/react";
import { formatDistanceToNowStrict } from "date-fns";
import { MyobuDBProposal } from "myobu-protocol-client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContainer from "../containers/app";
import ProposalsContainer from "../containers/proposals";
import AuthorDiv from "./AuthorDiv";
interface ProposalCardProps {
  proposal: MyobuDBProposal;
}

function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <div className="card w-[800px] max-w-full bg-neutral text-gray-300 shadow-xl text-left mx-auto sm:mx-0">
      <Link to={`/proposals/${proposal._id}`} className="h-full">
        <div className="card-body justify-between h-full">
          <h2 className="card-title">{proposal.title}</h2>
          {/** Display description in 2 lines */}
          <p className="card-subtitle text-gray-400 overflow-hidden overflow-ellipsis whitespace-pre-line h-12">
            {proposal.description}
          </p>
          {/** Display choices totalVotingPower distribution */}
          <div className="flex flex-col justify-between mb-2">
            {proposal.choices.map((choice, index) => (
              <div className="flex flex-row w-full items-center justify-between mb-2 relative">
                {/* bar */}
                <div
                  style={{
                    width: `${(
                      (choice.totalVotingPower / proposal.totalVotingPower ||
                        0) * 100
                    ).toFixed(2)}%`,
                    backgroundColor: "#262d38",
                  }}
                  className={"absolute left-0 top-0 h-full rounded-md"}
                ></div>

                <div className="flex flex-row items-center relative flex-1 z-50">
                  {/* description */}
                  <div className="p-2 z-50 flex flex-row items-center">
                    <div className="text-lg z-50">{choice.description}</div>
                    <span className="text-gray-600 text-sm ml-2">
                      {choice.totalVotingPower} voting power collected
                    </span>
                  </div>
                </div>
                <div className="font-bold text-gray-400 text-lg flex-none w-[64px] text-right z-50 mr-4">{`${(
                  (choice.totalVotingPower / proposal.totalVotingPower || 0) *
                  100
                ).toFixed(2)}%`}</div>
              </div>
            ))}
          </div>

          {/** Author */}
          {proposal.author && (
            <AuthorDiv
              author={proposal.author}
              rightContent={
                <div className="flex">
                  <span className="badge">
                    {Date.now() <= proposal.endDate ? `Closes in ` : `Closed `}{" "}
                    {formatDistanceToNowStrict(new Date(proposal.endDate || 0))}
                    {Date.now() > proposal.endDate && " ago"}
                  </span>
                  {Date.now() > proposal.endDate && (
                    <span className="badge bg-red-500">Ended</span>
                  )}
                  {Date.now() < proposal.startDate && (
                    <span className="badge bg-blue-500">Upcoming</span>
                  )}
                  {Date.now() > proposal.startDate &&
                    Date.now() < proposal.endDate && (
                      <span className="badge bg-green-800">Active</span>
                    )}
                </div>
              }
            ></AuthorDiv>
          )}
        </div>
      </Link>
    </div>
  );
}

interface ProposalCardsProps {
  showProposalEditor: () => void;
}

export function ProposalCards(props: ProposalCardsProps) {
  const appContainer = AppContainer.useContainer();
  const proposalsContainer = ProposalsContainer.useContainer();

  return (
    <div className="pt-2 sm:pt-12">
      <div className="text-3xl ml-2 mb-4 text-primary-content select-none flex flex-row justify-between">
        <span>:Proposal</span>
        <button
          className="btn btn-primary mr-2"
          onClick={() => {
            if (appContainer.signerProfile) {
              props.showProposalEditor();
            } else if (!appContainer.signerAddress) {
              toastr.error("Please connect your wallet first.");
            } else {
              toastr.error(
                "Please register for MNS (Myobu Name Service) to make comment"
              );
              setTimeout(() => {
                window.open(`https://protocol.myobu.io`, "_self");
              }, 2000);
            }
          }}
        >
          <Icon path={mdiVote} size={1} className="mr-1"></Icon>
          New Proposal
        </button>
      </div>
      {/** Proposals */}
      {proposalsContainer.proposals ? (
        <>
          <div className="flex flex-col flex-wrap">
            {proposalsContainer.proposals.map((proposal, index) => {
              return (
                <div
                  key={`proposal-${proposal._id}`}
                  className={"mb-2 sm:m-2 flex flex-row justify-center"}
                >
                  <ProposalCard proposal={proposal}></ProposalCard>
                </div>
              );
            })}
          </div>
          {proposalsContainer.hasMoreProposals ? (
            <div className="ml-2 my-10 text-center">
              <button
                className="btn btn-accent"
                disabled={proposalsContainer.isLoadingProposals}
                onClick={proposalsContainer.loadMoreProposals}
              >
                {proposalsContainer.isLoadingProposals
                  ? "Loading..."
                  : "Load More"}
              </button>
            </div>
          ) : (
            <div className="ml-2 my-10 text-center">
              <span className="text-primary-content">No more :Proposal</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-primary-content text-left">Loading :Proposal</div>
      )}
    </div>
  );
}
