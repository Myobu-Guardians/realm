import React, { useMemo } from "react";
import Icon from "@mdi/react";
import "./App.css";
import { mdiPencil } from "@mdi/js";
import AppContainer from "./containers/app";
import { MNSProfileCard } from "./components/MyobuNameServices";
import FeedsContainer from "./containers/feeds";
import Masonry from "react-masonry-component";

function App() {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();

  const feedElements = useMemo(() => {
    return feedsContainer.feeds.map((feed) => {
      if (feed.type === "mns") {
        return (
          <div key={feed.props._id} className={"m-2"}>
            <MNSProfileCard
              labels={["MNS"]}
              profile={feed.props}
            ></MNSProfileCard>
          </div>
        );
      } else {
        return <div></div>;
      }
    });
  }, [feedsContainer.feeds]);

  return (
    <div className="App">
      <div className="navbar bg-neutral text-neutral-content">
        <div className="flex-1">
          {" "}
          <a className="btn btn-ghost normal-case text-xl" href="/">
            REALM
          </a>
        </div>
        <div className="flex-none">
          {appContainer.signerProfile && (
            <button className="btn btn-primary mr-2">
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
            <button
              className="btn btn-primary"
              onClick={appContainer.connectToMetaMask}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* left panel */}
        <div className="col-span-1 px-4 pt-14">
          {appContainer.signerProfile ? (
            <div>
              <MNSProfileCard
                labels={["MNS"]}
                profile={appContainer.signerProfile}
              ></MNSProfileCard>
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
              <a
                href="https://protocol.myobu.io/#/mns"
                className="btn btn-secondary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                Register for your account
              </a>
            </div>
          )}
        </div>
        {/* right panel */}
        <div className="col-span-2 px-4 py-12">
          <div className="flex flex-row flex-wrap justify-start">
            {feedElements}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
