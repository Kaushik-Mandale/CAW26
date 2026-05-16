// Campus Achievement NFT Contract — Base Sepolia
// This file is auto-updated by scripts/deploy.js after deployment.
// Until deployed, the placeholder address is used for UI demo.

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const CHAIN_ID    = 84532;
export const NETWORK_NAME = "Base Sepolia";
export const EXPLORER_URL = "https://sepolia.basescan.org";

// Full ABI for CampusAchievement.sol
export const CONTRACT_ABI = [
  // ERC-721 standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalMinted() view returns (uint256)",

  // Achievement-specific
  "function mintAchievement(address to, string tokenURI, string title, string achievementType, string issuerName, string eventName) returns (uint256)",
  "function getAchievement(uint256 tokenId) view returns (tuple(string title, string achievementType, string issuerName, string eventName, address studentAddress, uint256 issuedAt, bool verified))",
  "function hasAchievement(address student, string title) view returns (bool, uint256)",

  // AccessControl
  "function addMinter(address minter)",
  "function hasRole(bytes32 role, address account) view returns (bool)",

  // Events
  "event AchievementMinted(uint256 indexed tokenId, address indexed student, string title, string achievementType, string issuerName, uint256 timestamp)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
