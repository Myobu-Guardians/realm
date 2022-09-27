import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import MyobuProtocolClient from "myobu-protocol-client";
import { MNSProfile } from "../lib/types";

const AppContainer = createContainer(() => {
  const [client, setClient] = useState<MyobuProtocolClient | undefined>(
    undefined
  );
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [signerAddress, setSignerAddress] = useState<string | undefined>(
    undefined
  );
  const [signerProfile, setSignerProfile] = useState<MNSProfile | undefined>(
    undefined
  );

  const connectToMetaMask = useCallback(async () => {
    const ethereum = (window as any)["ethereum"];
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      setSigner(signer);

      const setSigner_ = async () => {
        const signer = provider.getSigner();
        setSigner(signer);

        const signerAddress = await signer.getAddress();
        setSignerAddress(signerAddress);
      };

      ethereum.on("accountsChanged", setSigner_);
      setSigner_();

      ethereum.on("chainChanged", async function () {
        window.location.reload();
      });
    } else {
      alert("MetaMask not found");
    }
  }, []);

  useEffect(() => {
    console.log(process.env.REACT_APP_MYOBU_PROTOCOL_SERVER_URL);
    const client = new MyobuProtocolClient({
      server: process.env.REACT_APP_MYOBU_PROTOCOL_SERVER_URL,
    });
    setClient(client);
  }, []);

  useEffect(() => {
    if (client && signer) {
      client.setSigner(signer);
    }
  }, [signer, client]);

  useEffect(() => {
    if (client && signerAddress) {
      // Fetch mns
      client
        .db({
          match: [{ key: "profile", props: { _owner: signerAddress } }],
          return: ["profile"],
        })
        .then((result) => {
          console.log(result);
          if (result.length && result[0].profile) {
            setSignerProfile(result[0].profile.props as any);
          }
        })
        .catch(() => {
          setSignerProfile(undefined);
        });
    }
  }, [signerAddress, client]);

  return {
    client,
    signer,
    signerAddress,
    signerProfile,
    connectToMetaMask,
  };
});

export default AppContainer;
