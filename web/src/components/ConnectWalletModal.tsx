"use client";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { use, useCallback, useEffect, useState } from "react";
import { networks } from "../constants/networks";
import { useFileStore } from "../store/fileStore";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectWalletModal = ({ isOpen, onClose }: ConnectWalletModalProps) => {
  const { account, network, api, setAccount, setNetwork, setApi, setAccounts } =
    useFileStore();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const initializeWallet = async () => {
      const { web3Enable, web3Accounts } = await import(
        "@polkadot/extension-dapp"
      );
      const extensions = await web3Enable("FileOnChain");
      if (extensions.length === 0) {
        console.error("No extension found");
        return;
      }

      const allAccounts = await web3Accounts();
      const formattedAccounts = allAccounts.map((acc) => ({
        ...acc,
        meta: {
          ...acc.meta,
          genesisHash: acc.meta.genesisHash || "",
          name: acc.meta.name || "",
        },
        type: acc.type || "",
      }));
      setAccounts(formattedAccounts);

      if (formattedAccounts.length > 0 && !account) {
        setAccount(formattedAccounts[0]);
      }
    };

    // Set default network if none is selected
    if (!network) {
      setNetwork(networks[0]);
      setSelectedNetwork(networks[0].name);
    }

    initializeWallet();
  }, [isOpen, setAccounts, setAccount, account, network, setNetwork]);

  const handleNetworkChange = useCallback(
    async (networkName: string) => {
      setSelectedNetwork(networkName);
      const selectedNetwork = networks.find((net) => net.name === networkName);
      if (selectedNetwork) {
        setNetwork(selectedNetwork);
        if (api) {
          await api.disconnect();
        }
        const provider = new WsProvider(selectedNetwork.rpcUrl);
        const newApi = await ApiPromise.create({ provider });
        setApi(newApi);
      }
    },
    [api, setApi, setNetwork]
  );

  useEffect(() => {
    if (api === null && network !== null) {
      handleNetworkChange(network.name);
    }
  }, [api, handleNetworkChange, network]);

  const handleAccountChange = (address: string) => {
    const selectedAccount = useFileStore
      .getState()
      .accounts.find((acc) => acc.address === address);
    if (selectedAccount) {
      setAccount(selectedAccount);
    }
  };

  const handleConnect = async () => {
    if (account && api) {
      console.log("Connecting to wallet");
      const { web3FromSource } = await import("@polkadot/extension-dapp");
      console.log("Account:", account);
      const injector = await web3FromSource(account.meta.source);
      console.log("Injector:", injector);
      api.setSigner(injector.signer);
      console.log("Signer:", api.signer);
      onClose();
      console.log("Connected to wallet");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-md w-96 text-white">
        <h2 className="text-xl mb-4">Connect Wallet</h2>
        <select
          value={selectedNetwork}
          onChange={(e) => handleNetworkChange(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white border-gray-600"
        >
          {networks.map((net) => (
            <option key={net.name} value={net.name}>
              {net.name}
            </option>
          ))}
        </select>
        <select
          value={account?.address || ""}
          onChange={(e) => handleAccountChange(e.target.value)}
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white border-gray-600"
        >
          <option value="" disabled>
            Select an account
          </option>
          {useFileStore.getState().accounts.map((acc) => (
            <option key={acc.address} value={acc.address}>
              {acc.meta.name || acc.address}
            </option>
          ))}
        </select>
        <button
          onClick={handleConnect}
          className="w-full bg-button-connect text-white p-2 rounded hover:bg-button-connectHover"
        >
          Connect
        </button>
        <button
          onClick={onClose}
          className="w-full bg-button-cancel text-white p-2 rounded mt-2 hover:bg-button-cancelHover"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
