"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaSpinner,
  FaUpload,
  FaWallet,
} from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useFileUploader } from "../hooks/useFileUploader";
import { useFileStore } from "../store/fileStore";
import { truncateFileName } from "../utils/truncateFileName";
import ConnectWalletModal from "./ConnectWalletModal";

const FileUploader = () => {
  const {
    file,
    dragActive,
    fileContent,
    cids,
    chunkSize,
    isOpen,
    selectedCidData,
    isWalletModalOpen,
    isUploading,
    txHash,
    fileFound,
    explorer,
    error,
    account,
    network,
    setIsOpen,
    setIsWalletModalOpen,
    setSelectedCidData,
  } = useFileStore();

  const { handleFileChange, handleDrag, handleDrop, handleUpload } =
    useFileUploader();

  const renderFileSnippet = () => {
    if (fileContent) {
      if (file?.type === "application/json") {
        try {
          const jsonSnippet = JSON.stringify(
            JSON.parse(fileContent),
            null,
            2
          ).substring(0, 500);
          return (
            <pre className="bg-gray-700 text-white p-4 rounded mb-4">
              {jsonSnippet}...
            </pre>
          );
        } catch (error) {
          return (
            <p className="bg-red-500 text-white p-4 rounded mb-4">
              Invalid JSON file
            </p>
          );
        }
      } else if (file?.type.startsWith("text/")) {
        return (
          <pre className="bg-gray-700 text-white p-4 rounded mb-4">
            {fileContent.substring(0, 500)}...
          </pre>
        );
      } else if (file?.type.startsWith("image/")) {
        return (
          <div className="flex justify-center items-center">
            <Image
              src={fileContent}
              alt="Preview"
              width={300}
              height={300}
              className="mb-4"
            />
          </div>
        );
      }
    }
    return null;
  };

  const uploadSection = useMemo(() => {
    return (
      <div className="space-y-4">
        {txHash && (
          <a
            href={`${explorer}/extrinsic/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-button-connect text-white p-2 rounded mb-4 cursor-pointer w-full text-center hover:bg-button-connectHover"
          >
            <FaEye className="mr-2" /> View Transaction
          </a>
        )}
        {isUploading ? (
          <div className="flex items-center justify-center w-full">
            <FaSpinner className="mr-2 animate-spin" />
            Uploading to blockchain...
          </div>
        ) : (
          <button
            onClick={handleUpload}
            className="bg-button-connect text-white py-2 px-4 rounded hover:bg-button-connectHover mb-4 w-full"
          >
            Upload to Blockchain
          </button>
        )}
      </div>
    );
  }, [txHash, explorer, isUploading, handleUpload]);

  const handleCidClick = (cid: any, data: any, nextCid: any) => {
    setSelectedCidData({
      cid: cid.toString(),
      data: JSON.stringify(new TextDecoder().decode(data)),
      nextCid: nextCid ? nextCid.toString() : undefined,
    });
  };

  return (
    <div
      className={`max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 ${
        dragActive ? "border-2 border-blue-500" : ""
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <h2 className="text-2xl font-bold text-white mb-6">File Uploader</h2>
      {network && (
        <p className="text-gray-400 mb-4">Connected to: {network.name}</p>
      )}
      <div className="mb-8">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-300"
        >
          <FaUpload className="text-gray-400 text-3xl mb-2" />
          <span className="text-gray-400">Choose a file or drag it here</span>
        </label>
      </div>

      {file && (
        <>
          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              File Details
            </h3>
            <p className="text-gray-300 mb-2">
              Selected file: {truncateFileName(file.name, 40)}
            </p>
            <p className="text-gray-300 mb-4">
              Chunk size: {chunkSize / 1024} KB
            </p>
            {renderFileSnippet()}
          </div>

          <div className="flex flex-col space-y-4">
            {(fileFound || txHash) && (
              <a
                href={`/api/cid/${cids[0].cid.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-button-secondary text-white py-2 px-4 rounded-lg hover:bg-button-secondaryHover transition-colors duration-300 w-full"
              >
                <FaEye className="mr-2" /> View File
              </a>
            )}

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center justify-center bg-button-connect text-white py-2 px-4 rounded-lg hover:bg-button-connectHover transition-colors duration-300 w-full"
            >
              <FaWallet className="mr-2" />
              {account
                ? truncateFileName(account.address, 20)
                : "Connect Wallet"}
            </button>

            {uploadSection}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 w-full"
            >
              {isOpen ? (
                <FaChevronUp className="mr-2" />
              ) : (
                <FaChevronDown className="mr-2" />
              )}
              {isOpen ? "Hide" : "Show"} Multi-DAG Structure
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="bg-red-500 text-white p-4 rounded-lg mt-4">{error}</p>
      )}

      {isOpen && file && (
        <div className="mt-8 bg-gray-700 text-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Multi-DAG Structure</h3>
          <ul className="space-y-2">
            {cids.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors duration-300"
                onClick={() =>
                  handleCidClick(item.cid, item.data, item.nextCid)
                }
              >
                Chunk {index + 1}: {truncateFileName(item.cid.toString(), 30)}
              </li>
            ))}
          </ul>
          {selectedCidData && (
            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">CID Data</h4>
              <SyntaxHighlighter language="json" style={dark} wrapLongLines>
                {JSON.stringify(selectedCidData, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};

export default FileUploader;
