// file: web/src/hooks/useFileUploader.ts

"use client";
import { useCallback, useEffect } from "react";
import { useFileStore } from "../store/fileStore";
import { generateCIDs } from "../utils/generateCIDs";
import { readFileContent } from "../utils/readFileContent";
import { uploadChunks } from "../utils/uploadChunks";

export const useFileUploader = () => {
  const {
    file,
    cids,
    chunkSize,
    api,
    account,
    network,
    setFile,
    setDragActive,
    setFileContent,
    setCids,
    setChunkSize,
    setIsUploading,
    setTxHash,
    setError,
    setFileFound,
  } = useFileStore();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        readFileContent(selectedFile, setFileContent);
        if (network) {
          generateCIDs(selectedFile, network.chunkSize).then(setCids);
        } else {
          generateCIDs(selectedFile, chunkSize).then(setCids);
        }
      }
    },
    [network, chunkSize, setFile, setFileContent, setCids]
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [setDragActive]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const selectedFile = e.dataTransfer.files[0];
        setFile(selectedFile);
        readFileContent(selectedFile, setFileContent);
        if (network) {
          generateCIDs(selectedFile, network.chunkSize).then(setCids);
        } else {
          generateCIDs(selectedFile, chunkSize).then(setCids);
        }
      }
    },
    [network, chunkSize, setFile, setFileContent, setCids, setDragActive]
  );

  const handleUpload = useCallback(async () => {
    if (api && account && network) {
      await uploadChunks(
        api,
        account,
        cids,
        network,
        setError,
        setIsUploading,
        setTxHash
      );
    }
  }, [api, account, network, cids, setError, setIsUploading, setTxHash]);

  const handleSearch = useCallback(async () => {
    if (cids.length > 0) {
      const search = await fetch(`/api/search-file/${cids[0].cid.toString()}`);
      const { found } = await search.json();
      setFileFound(found);
    }
  }, [cids, setFileFound]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return {
    handleFileChange,
    handleDrag,
    handleDrop,
    handleUpload,
  };
};
