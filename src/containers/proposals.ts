import {
  MyobuDBLabelACL,
  MyobuDBOrder,
  MyobuDBProposal,
  MyobuDBProposalVote,
} from "myobu-protocol-client";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import toastr from "toastr";
import AppContainer from "./app";
import { Comment, Tab } from "../lib/types";

const itemsPerPage = 20;

const ProposalsContainer = createContainer(() => {
  const [proposalACL, setProposalACL] = useState<MyobuDBLabelACL | undefined>(
    undefined
  );

  // :Proposal
  const [proposals, setProposals] = useState<MyobuDBProposal[] | undefined>(
    undefined
  );
  const [hasMoreProposals, setHasMoreProposals] = useState<boolean>(true);
  const [proposalsPage, setProposalsPage] = useState<number>(0);
  const [isLoadingProposals, setIsLoadingProposals] = useState<boolean>(false);

  const appContainer = AppContainer.useContainer();

  // ProposalPanel
  const [proposal, setProposal] = useState<MyobuDBProposal | undefined>(
    undefined
  );
  const [userVotes, setUserVotes] = useState<MyobuDBProposalVote[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const publishProposal = useCallback(
    async (proposal: MyobuDBProposal) => {
      if (
        appContainer.client &&
        appContainer.signerBalance !== undefined &&
        proposalACL?.node.write.minBalance !== undefined
      ) {
        if (appContainer.signerBalance < proposalACL.node.write.minBalance) {
          toastr.error(
            `You need at least ${proposalACL.node.write.minBalance} MYOBU to publish a proposal`
          );
          return;
        }

        const publishedProposal = await appContainer.client.createProposal(
          proposal
        );
        if (publishedProposal && publishedProposal._id) {
          setProposals((proposals) => {
            return [publishedProposal, ...(proposals || [])];
          });
        }
      } else {
        toastr.error("You need to connect a wallet first.");
      }
    },
    [appContainer.client, appContainer.signerBalance, proposalACL]
  );

  const vote = useCallback(
    async (choiceIds: string[]) => {
      if (proposal?._id && appContainer.client) {
        const votes = await appContainer.client.vote(proposal._id, choiceIds);
        console.log(votes);
      }
    },
    [proposal, appContainer.client]
  );

  const loadMoreProposals = useCallback(() => {
    setProposalsPage((page) => page + 1);
  }, []);

  const makeProposalComment = useCallback(
    async (markdown: string) => {
      if (
        appContainer.client &&
        appContainer.signerAddress &&
        proposal &&
        proposal._id
      ) {
        const result = await appContainer.client.applyDBEvent(
          "Realm",
          "makeProposalComment",
          {
            proposalId: proposal._id,
            markdown,
          }
        );
        const comment: Comment = {
          ...(result[0].comment.props as any),
          author: {
            name: result[0].authorName,
            displayName: result[0].authorDisplayName,
            avatar: result[0].authorAvatar || "",
          } as any,
        };
        console.log("makeProposalComment: ", comment);
        setComments((comments) => [...comments, comment]);
      } else {
        throw new Error("Client is not ready");
      }
    },
    [appContainer.client, appContainer.signerAddress, proposal]
  );
  useEffect(() => {
    if (
      appContainer.client &&
      (appContainer.tab === Tab.Proposals || appContainer.tab === Tab.Proposal)
    ) {
      appContainer.client.getLabelACL("Proposal").then((acl) => {
        setProposalACL(acl);
      });
    }
  }, [appContainer.client, appContainer.tab]);

  // Fetch proposals
  useEffect(() => {
    if (appContainer.client && appContainer.tab === Tab.Proposals) {
      setIsLoadingProposals(true);
      appContainer.client
        .queryDB({
          match: [
            {
              key: "r",
              type: "PROPOSED",
              from: {
                key: "author",
                labels: ["MNS"],
              },
              to: {
                key: "proposal",
                labels: ["Proposal"],
              },
            },
            {
              key: "r2",
              type: "HAS_CHOICE",
              from: {
                key: "proposal",
              },
              to: {
                key: "choice",
                labels: ["Choice"],
              },
            },
          ],
          where: {
            "author._owner": {
              $eq: {
                $key: "proposal._owner",
              },
            },
          },
          orderBy: {
            "proposal._createdAt": MyobuDBOrder.DESC,
          },
          skip: proposalsPage * itemsPerPage,
          limit: itemsPerPage,
          return: [
            "proposal",
            { key: "choice", collect: true, as: "choices" },
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        })
        .then((result) => {
          const proposals: MyobuDBProposal[] = result.map((entry) => {
            return {
              ...entry.proposal.props,
              choices: (entry.choices as any)
                .map((choice: any) => choice.properties)
                .reverse(),
              author: {
                displayName: entry.authorDisplayName,
                name: entry.authorName,
                avatar: entry.authorAvatar,
              },
            } as any;
          });
          console.log(`fetched proposals: `, proposals);
          setHasMoreProposals(proposals.length === itemsPerPage);
          setProposals((oldProposals) => {
            return [...(oldProposals || []), ...proposals].filter(
              (p, index, self) =>
                self.findIndex((t) => t._id === p._id) === index
            );
          });
          setIsLoadingProposals(false);
        });
    }
  }, [appContainer.client, appContainer.tab, proposalsPage]);

  // Fetch proposal
  useEffect(() => {
    if (
      appContainer.client &&
      appContainer.tab === Tab.Proposal &&
      appContainer.params.proposalId
    ) {
      setProposal(undefined);
      setComments([]);

      appContainer.client
        .queryDB({
          match: [
            {
              key: "proposal",
              labels: ["Proposal"],
              props: { _id: appContainer.params.proposalId },
            },
            {
              key: "author",
              labels: ["MNS"],
            },
            {
              key: "r",
              type: "HAS_CHOICE",
              from: {
                key: "proposal",
              },
              to: {
                key: "choice",
                labels: ["Choice"],
              },
            },
          ],
          where: {
            "author._owner": {
              $eq: {
                $key: "proposal._owner",
              },
            },
          },
          return: [
            "proposal",
            { key: "choice", collect: true, as: "choices" },
            { key: "author.displayName", as: "authorDisplayName" },
            { key: "author.name", as: "authorName" },
            { key: "author.avatar", as: "authorAvatar" },
          ],
        })
        .then((result) => {
          const proposal: MyobuDBProposal = {
            ...result[0].proposal.props,
            choices: (result[0].choices as any)
              .map((choice: any) => choice.properties)
              .reverse(),
            author: {
              displayName: result[0].authorDisplayName,
              name: result[0].authorName,
              avatar: result[0].authorAvatar,
            } as any,
          } as any;
          setProposal(proposal);
        });
    }
  }, [appContainer.client, appContainer.tab, appContainer.params]);

  // Get user votes
  useEffect(() => {
    if (
      appContainer.client &&
      appContainer.tab === Tab.Proposal &&
      appContainer.signerAddress &&
      proposal &&
      proposal._id
    ) {
      appContainer.client
        .queryDB({
          match: [
            {
              key: "vote",
              labels: ["Vote"],
              props: {
                proposalId: proposal._id,
                _owner: appContainer.signerAddress,
              },
            },
          ],
          return: ["vote"],
        })
        .then((result) => {
          console.log("fetched user votes: ", result);
          setUserVotes(result.map((entry) => entry.vote.props as any));
        });
    }
  }, [
    appContainer.client,
    appContainer.signerAddress,
    appContainer.tab,
    proposal,
  ]);

  // Fetch proposal comments
  // TODO: Pagination
  useEffect(() => {
    if (appContainer.client && proposal) {
      appContainer.client
        .queryDB({
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
                key: "proposal",
                labels: ["Proposal"],
                props: {
                  _id: proposal._id || "",
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
  }, [proposal, appContainer.client]);

  return {
    proposals,
    hasMoreProposals,
    isLoadingProposals,
    proposalACL,
    proposal,
    userVotes,
    comments,
    publishProposal,
    vote,
    loadMoreProposals,
    makeProposalComment,
  };
});

export default ProposalsContainer;
