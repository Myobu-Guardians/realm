import React, { useMemo } from "react";
import Icon from "@mdi/react";
import "./App.css";
import { mdiPencil, mdiMenu } from "@mdi/js";
import AppContainer from "./containers/app";
import { MNSProfileCard } from "./components/MyobuNameServices";
import FeedsContainer from "./containers/feeds";

function App() {
  const appContainer = AppContainer.useContainer();
  const feedsContainer = FeedsContainer.useContainer();

  const feedElements = useMemo(() => {
    return feedsContainer.feeds.map((feed) => {
      if (feed.type === "mns") {
        return (
          <div key={feed.props._id} className={"mb-2 sm:m-2"}>
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
      <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
        <div className="flex-1">
          {" "}
          <a
            className="btn btn-ghost normal-case text-xl hidden sm:block"
            href="/"
          >
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
          className="drawer drawer-mobile"
          style={{ height: `calc(100vh - 64px)` }}
        >
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content pt-2 px-0 sm:pt-12 sm:px-2">
            {/** right panel */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start">
              {feedElements}
            </div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            {/* left panel */}
            <div className="px-0 sm:px-4 pt-2 sm:pt-14 bg-gray-800">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
