import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import MyobuProtocolClient from "myobu-protocol-client";
import { MNSProfile, Tab } from "../lib/types";
import { NFTStorage } from "nft.storage";

interface ArweaveAddArgs {
  content: string;
  onIpfsUploaded?: (ipfsHash: string) => void;
  onArweaveUploaded?: (arweaveHash: string) => void;
}

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
  const [nftStorageClient] = useState(
    new NFTStorage({
      token: process.env.REACT_APP_NFTSTORAGE_TOKEN || "",
    })
  );
  const [tab, setTab] = useState<Tab>(Tab.Notes);

  const ipfsAdd = useCallback(
    async (content: string): Promise<string> => {
      return await nftStorageClient.storeBlob(new Blob([content]));
    },
    [nftStorageClient]
  );

  const arweaveAdd = useCallback(
    async (
      args: ArweaveAddArgs
    ): Promise<{
      ipfsHash: string;
      arweaveId: string;
    }> => {
      const ipfsHash = await nftStorageClient.storeBlob(
        new Blob([args.content])
      );
      if (args.onIpfsUploaded) {
        args.onIpfsUploaded(ipfsHash);
      }
      // TODO: Only images are supported
      const res = await fetch(`https://ipfs2arweave.com/permapin/${ipfsHash}`, {
        method: "POST",
      });
      const json = await res.json();
      if (args.onArweaveUploaded) {
        args.onArweaveUploaded(json.arweaveId);
      }
      return { ipfsHash, arweaveId: json.arweaveId };
    },
    [nftStorageClient]
  );

  /**
   * Get content from IPFS hash
   */
  const ipfsCat = useCallback(async (ipfsHash: string) => {
    const res = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, {
      method: "GET",
    });
    return await res.text();
  }, []);

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

  // Set up the myobu protocol client
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
          match: [
            {
              key: "profile",
              labels: ["MNS"],
              props: { _owner: signerAddress },
            },
          ],
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
    ipfsAdd,
    ipfsCat,
    arweaveAdd,
    tab,
    setTab,
  };
});

export default AppContainer;
