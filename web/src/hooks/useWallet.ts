// file: web/src/hooks/useWallet.ts

"use client";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { useEffect } from "react";
import { networks } from "../constants/networks";
import { useFileStore } from "../store/fileStore";

const useWallet = () => {
  const { account, network, api, setAccount, setNetwork, setApi } =
    useFileStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const init = async () => {
        const { web3Enable, web3Accounts } = await import(
          "@polkadot/extension-dapp"
        );
        const extensions = await web3Enable("FileOnChain");
        if (extensions.length === 0) {
          return;
        }

        const allAccounts = await web3Accounts();
        if (allAccounts.length > 0) {
          const account = allAccounts[0];
          if (account.meta.genesisHash === undefined) {
            account.meta.genesisHash = "";
          }
          setAccount({
            ...account,
            meta: {
              ...account.meta,
              genesisHash: account.meta.genesisHash || "",
              name: account.meta.name || "defaultName",
            },
            type: account.type || "defaultType",
          });
        }
      };

      init();
    }
  }, [setAccount]);

  useEffect(() => {
    const connectApi = async () => {
      if (network) {
        const provider = new WsProvider(network.rpcUrl);
        const api = await ApiPromise.create({ provider });
        setApi(api);
      }
    };

    connectApi();
  }, [network, setApi]);

  const connectWallet = async () => {
    if (account && api && typeof window !== "undefined") {
      const { web3FromSource } = await import("@polkadot/extension-dapp");
      const injector = await web3FromSource(account.meta.source);
      api.setSigner(injector.signer);
    }
  };

  return {
    connectWallet,
    setNetwork: (network: any) => {
      setNetwork(network);
      setApi(null); // Reset API when network changes
    },
  };
};

export default useWallet;
