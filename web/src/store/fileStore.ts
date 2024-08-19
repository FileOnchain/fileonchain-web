import { networks } from "@/constants/networks";
import { create } from "zustand";
import { Account, Network } from "../types/types";
import { ChunkData } from "../utils/generateCIDs";

interface FileState {
  file: File | null;
  dragActive: boolean;
  fileContent: string | null;
  cids: ChunkData[];
  chunkSize: number;
  isOpen: boolean;
  selectedCidData: any | null;
  isWalletModalOpen: boolean;
  isUploading: boolean;
  txHash: string | null;
  fileFound: boolean;
  explorer: string | null;
  error: string | null;
  api: any | null;
  account: Account | null;
  network: Network | null;
  accounts: Account[];

  setFile: (file: File | null) => void;
  setDragActive: (dragActive: boolean) => void;
  setFileContent: (fileContent: string | null) => void;
  setCids: (cids: ChunkData[]) => void;
  setChunkSize: (chunkSize: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  setSelectedCidData: (selectedCidData: any | null) => void;
  setIsWalletModalOpen: (isWalletModalOpen: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  setTxHash: (txHash: string | null) => void;
  setFileFound: (fileFound: boolean) => void;
  setExplorer: (explorer: string | null) => void;
  setError: (error: string | null) => void;
  setApi: (api: any | null) => void;
  setAccount: (account: Account | null) => void;
  setNetwork: (network: Network | null) => void;
  setAccounts: (accounts: Account[]) => void;
}

export const useFileStore = create<FileState>((set) => ({
  file: null,
  dragActive: false,
  fileContent: null,
  cids: [],
  chunkSize: 256 * 1024,
  isOpen: false,
  selectedCidData: null,
  isWalletModalOpen: false,
  isUploading: false,
  txHash: null,
  fileFound: false,
  explorer: null,
  error: null,
  api: null,
  account: null,
  network: networks[0],
  accounts: [],

  setFile: (file) => set({ file }),
  setDragActive: (dragActive) => set({ dragActive }),
  setFileContent: (fileContent) => set({ fileContent }),
  setCids: (cids) => set({ cids }),
  setChunkSize: (chunkSize) => set({ chunkSize }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setSelectedCidData: (selectedCidData) => set({ selectedCidData }),
  setIsWalletModalOpen: (isWalletModalOpen) => set({ isWalletModalOpen }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setTxHash: (txHash) => set({ txHash }),
  setFileFound: (fileFound) => set({ fileFound }),
  setExplorer: (explorer) => set({ explorer }),
  setError: (error) => set({ error }),
  setApi: (api) => set({ api }),
  setAccount: (account) => set({ account }),
  setNetwork: (network) => set({ network }),
  setAccounts: (accounts) => set({ accounts }),
}));
