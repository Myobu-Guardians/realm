import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { MNSProfile, Tab, WalletConnectMethod } from "../lib/types";
import { NFTStorage } from "nft.storage";
import { Params } from "react-router-dom";
import { MyobuProtocolClient } from "myobu-protocol-client";

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
  const [connectedWalletMethod, setConnectedWalletMethod] = useState<
    WalletConnectMethod | undefined
  >(
    (localStorage.getItem("wallet/connected_method") as WalletConnectMethod) ||
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
  const [tab, setTab] = useState<Tab>(Tab.Unknown);
  const [params, setParams] = useState<Params<string>>({});
  const [searchParams, setSearchParams] = useState<URLSearchParams | undefined>(
    undefined
  );
  const [signerVotingPower, setSignerVotingPower] = useState<
    number | undefined
  >(undefined);
  const [signerBalance, setSignerBalance] = useState<number | undefined>(
    undefined
  );
  const [myobuPrice, setMyobuPrice] = useState<number | undefined>(undefined);

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
    // Check if the ipfs hash is in cache
    const cached = localStorage.getItem(`ipfs/${ipfsHash}`);
    if (cached) {
      return cached;
    } else {
      const res = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, {
        method: "GET",
      });
      const result = await res.text();
      // Save to cache
      localStorage.setItem(`ipfs/${ipfsHash}`, result);
      return result;
    }
  }, []);

  const setConnectedWalletMethod_ = useCallback(
    (connectedWalletMethod: WalletConnectMethod | undefined) => {
      setConnectedWalletMethod(connectedWalletMethod);
      if (connectedWalletMethod) {
        localStorage.setItem("wallet/connected_method", connectedWalletMethod);
      } else {
        localStorage.removeItem("wallet/connected_method");
      }
    },
    []
  );

  const connectToMetaMask = useCallback(async () => {
    const ethereum = (window as any)["ethereum"];
    if (ethereum) {
      try {
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

        ethereum.on("accountsChanged", () => {
          setSigner_();
          window.location.reload();
        });
        setSigner_();

        ethereum.on("chainChanged", async function () {
          window.location.reload();
        });
        setConnectedWalletMethod_(WalletConnectMethod.MetaMask);
      } catch (error) {
        setConnectedWalletMethod_(undefined);
      }
    } else {
      alert("MetaMask not found");
      setConnectedWalletMethod_(undefined);
    }
  }, [setConnectedWalletMethod_]);

  useEffect(() => {
    (async () => {
      const connectedWalletMethod = localStorage.getItem(
        "wallet/connected_method"
      ) as WalletConnectMethod;
      if (connectedWalletMethod) {
        switch (connectedWalletMethod) {
          case WalletConnectMethod.MetaMask:
            connectToMetaMask();
            break;
          // case WalletConnectMethod.WalletConnect:
          //   connectToWalletConnect();
          //   break;
          default:
            // setProvider(undefined);
            setSigner(undefined);
            setSignerAddress(undefined);
        }
      }
    })();
  }, [connectToMetaMask]);

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
      client
        .getMNS(signerAddress)
        .then((mns) => {
          setSignerProfile(mns);
        })
        .catch(() => {
          setSignerProfile(undefined);
        });
    }
  }, [signerAddress, client]);

  useEffect(() => {
    if (client && signerProfile && signerAddress) {
      client
        .getVotingPower(signerProfile._owner || signerAddress)
        .then((vp) => {
          setSignerVotingPower(vp);
        })
        .catch(() => {
          setSignerVotingPower(undefined);
        });

      client
        .getBalance(signerAddress)
        .then((balance) => {
          console.log("balance: ", balance);
          setSignerBalance(balance);
        })
        .catch(() => {
          setSignerBalance(undefined);
        });
    }
  }, [client, signerAddress, signerProfile]);

  // Fetch MYOBU price from CoinGecko
  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=myobu&vs_currencies=usd`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        setMyobuPrice(json.myobu.usd);
        console.log(json);
      });
  }, []);

  return {
    client,
    signer,
    signerAddress,
    signerProfile,
    signerVotingPower,
    signerBalance,
    connectToMetaMask,
    ipfsAdd,
    ipfsCat,
    arweaveAdd,
    tab,
    setTab,
    params,
    setParams,
    searchParams,
    setSearchParams,
    myobuPrice,
  };
});

export default AppContainer;
