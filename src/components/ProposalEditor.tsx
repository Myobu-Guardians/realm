import {
  mdiCalendar,
  mdiChevronDown,
  mdiClose,
  mdiLanguageMarkdown,
  mdiPublish,
} from "@mdi/js";
import Icon from "@mdi/react";
import {
  MyobuDBProposal,
  MyobuDBProposalChoice,
  MyobuDBProposalVoteType,
} from "myobu-protocol-client";
import React, { useEffect, useState } from "react";
import DateTimePicker from "react-datetime-picker";
import AppContainer from "../containers/app";
import ProposalsContainer from "../containers/proposals";

interface Props {
  onClose: () => void;
  modalTitle?: string;
  confirmButtonText: string;
  onConfirm: (proposal: MyobuDBProposal) => void;
  proposalToUpdate?: MyobuDBProposal;
}

export default function ProposalEditor(props: Props) {
  const [title, setTitle] = useState<string>(
    props.proposalToUpdate?.title ?? ""
  );
  const [description, setDescription] = useState<string>(
    props.proposalToUpdate?.description ?? ""
  );
  const [minVotingPower, setMinVotingPower] = useState<number>(
    props.proposalToUpdate?.minVotingPower ?? 1
  );
  const [startDate, setStartDate] = useState<Date>(
    props.proposalToUpdate?.startDate
      ? new Date(props.proposalToUpdate?.startDate)
      : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    props.proposalToUpdate?.endDate
      ? new Date(props.proposalToUpdate?.endDate)
      : new Date(Date.now() + 86400000)
  );
  const [voteType, setVoteType] = useState<MyobuDBProposalVoteType>(
    props.proposalToUpdate?.voteType ?? MyobuDBProposalVoteType.SINGLE_CHOICE
  );
  const [choiceDescription, setChoiceDescription] = useState<string>("");
  const [choices, setChoices] = useState<MyobuDBProposalChoice[]>([]);
  const proposalsContainer = ProposalsContainer.useContainer();

  return (
    <div className="sm:modal sm:modal-open">
      <div
        className="fixed top-0 left-0 w-full h-full z-50 overflow-auto sm:relative sm:modal-box sm:max-w-full sm:w-8/12 flex flex-col"
        style={{
          backgroundColor: "#282c34",
        }}
      >
        <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
          <div className="flex-1">
            <div className="px-2 mx-2">
              <span className="text-lg font-bold">
                {props.modalTitle || "New Proposal"}
              </span>
            </div>
          </div>
          <div className="flex-none">
            <button
              className="btn btn-primary mr-2"
              onClick={() => {
                props.onConfirm({
                  title,
                  description,
                  voteType,
                  minVotingPower: minVotingPower || 1,
                  startDate: startDate.getTime(),
                  endDate: endDate.getTime(),
                  totalVotingPower: 0,
                  choices,
                });
              }}
            >
              <Icon path={mdiPublish} size={1}></Icon>
              {props.confirmButtonText}
            </button>
            <button
              className="btn btn-secondary btn-circle"
              onClick={props.onClose}
              title={"Close the editor"}
            >
              <Icon path={mdiClose} size={1}></Icon>
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/** Display ACL */}
          {proposalsContainer.proposalACL &&
            proposalsContainer.proposalACL.node.write.minBalance !==
              undefined && (
              <div className={"text-lg"}>
                Minimum $MYOBU Balance required to make proposal:{" "}
                <span className={"font-bold"}>
                  {proposalsContainer.proposalACL.node.write.minBalance}
                </span>{" "}
              </div>
            )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
              <span className="float-right">
                <Icon
                  path={mdiLanguageMarkdown}
                  size={1}
                  title={"Markdown supported"}
                ></Icon>
              </span>
            </label>
            <textarea
              className="textarea h-24 textarea-bordered"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Minimum <span className="font-bold">Voting power</span> required
                to vote
              </span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              placeholder="Minimum Voting power required to vote"
              value={minVotingPower}
              min={1}
              onChange={(e) => setMinVotingPower(parseInt(e.target.value))}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start date</span>
            </label>
            <DateTimePicker
              value={startDate}
              onChange={(date) => {
                setStartDate(date || new Date());
              }}
              minDate={new Date()}
              required={true}
              calendarIcon={<Icon path={mdiCalendar} size={1}></Icon>}
              clearIcon={<Icon path={mdiClose} size={1}></Icon>}
              closeWidgets={false}
              disabled={
                // Already started
                props.proposalToUpdate &&
                Date.now() > props.proposalToUpdate.startDate
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End date</span>
            </label>
            <DateTimePicker
              value={endDate}
              onChange={(date) => {
                setEndDate(date || new Date());
              }}
              minDate={new Date()}
              required={true}
              calendarIcon={<Icon path={mdiCalendar} size={1}></Icon>}
              clearIcon={<Icon path={mdiClose} size={1}></Icon>}
              closeWidgets={false}
              disabled={
                // Already ended
                props.proposalToUpdate &&
                Date.now() > props.proposalToUpdate.endDate
              }
            />
          </div>
          {!props.proposalToUpdate && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Vote type</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={voteType}
                onChange={(e) => {
                  setVoteType(e.target.value as any);
                }}
              >
                <option value={MyobuDBProposalVoteType.SINGLE_CHOICE}>
                  Single choice
                </option>
                <option value={MyobuDBProposalVoteType.MULTIPLE_CHOICE}>
                  Multiple choice
                </option>
              </select>
            </div>
          )}

          {/* Add choices */}
          <div className="divider font-bold text-lg">Choices</div>
          <div className="form-control flex flex-row mb-4">
            <input
              className="input input-bordered flex-1 mr-2"
              placeholder="Choice description"
              value={choiceDescription}
              onChange={(e) => setChoiceDescription(e.target.value)}
            ></input>
            <button
              className="btn btn-info flex-none"
              onClick={() => {
                setChoices((choices) => [
                  ...choices,
                  {
                    description: choiceDescription,
                    totalVotingPower: 0,
                    totalVotesCount: 0,
                  },
                ]);
                setChoiceDescription("");
              }}
            >
              Add
            </button>
          </div>
          {/* List choices and allow delete */}
          {choices.map((choice, index) => (
            <div
              className="mt-2 card card-bordered border-gray-500"
              key={`choice-${index}`}
            >
              <div className="card-body px-4 py-4 flex flex-row justify-between">
                <div className={"text-base mr-2 text-left break-words"}>
                  {choice.description}
                </div>
                <button
                  className="btn btn-error btn-circle btn-sm"
                  onClick={() => {
                    setChoices((choices) =>
                      choices.filter((_, i) => i !== index)
                    );
                  }}
                  title={"Delete choice"}
                >
                  <Icon path={mdiClose} size={0.8}></Icon>
                </button>
              </div>
            </div>
          ))}
          {props.proposalToUpdate ? (
            <div>
              <div className="divider">
                <Icon path={mdiChevronDown} size={1}></Icon>
                Current choices
              </div>
            </div>
          ) : null}
          {/* Display choices of proposalToUpdate */}
          <div>
            {props.proposalToUpdate?.choices.map((choice, index) => (
              <div
                className="mt-2 card card-bordered border-gray-500"
                key={`choice-${choice._id}`}
              >
                <div className="card-body px-4 py-4 flex flex-row justify-between">
                  <div className={"text-base mr-2 text-left break-words"}>
                    {choice.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
