import { mdiClose, mdiPublish } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";

interface Props {
  onClose: () => void;
  confirmButtonText: string;
}

export default function ProposalEditor(props: Props) {
  return (
    <div className="sm:modal sm:modal-open">
      <div
        className="fixed top-0 left-0 w-full h-full z-50 overflow-auto sm:relative sm:modal-box sm:max-w-full sm:w-8/12 flex flex-col"
        style={{
          backgroundColor: "#282c34",
        }}
      >
        <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
          <div className="flex-1"></div>
          <div className="flex-none">
            <button className="btn btn-primary mr-2" onClick={() => {}}>
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
      </div>
    </div>
  );
}
