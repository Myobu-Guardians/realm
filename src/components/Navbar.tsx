import { mdiMenu, mdiPencil } from "@mdi/js";
import AppContainer from "../containers/app";
import Icon from "@mdi/react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";

interface Props {
  showPublishNoteEditor: () => void;
}

export default function NavBar(props: Props) {
  const appContainer = AppContainer.useContainer();

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

  return (
    <>
      <div className="navbar sticky top-0 z-20 bg-neutral text-neutral-content">
        <div className="flex-1">
          {" "}
          <Link
            className="btn btn-ghost normal-case text-xl hidden sm:flex"
            to="/"
          >
            <img src={Logo} alt={"Realm"} className={"h-[40px] mr-2"}></img>
            REALM
          </Link>
        </div>
        <div className="flex-none">
          {appContainer.signerProfile && (
            <button
              className="btn btn-primary mr-2"
              onClick={props.showPublishNoteEditor}
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
    </>
  );
}
