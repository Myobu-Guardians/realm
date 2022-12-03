import { mdiVote } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useEffect, useState } from "react";
import AppContainer from "../containers/app";

interface ProposalCardsProps {
  showProposalEditor: () => void;
}

export function ProposalCards(props: ProposalCardsProps) {
  const appContainer = AppContainer.useContainer();

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
    </div>
  );
}
