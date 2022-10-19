// TODO: Maybe put this interface into the myobu-protocol-client library

import { Summary } from "./note";

export enum Tab {
  Notes = "notes",
  MNS = "mns",
  Note = "note",
  User = "user",
  Unknown = "unknown",
}

export interface NodeBase {
  _id?: string;
  _updatedAt?: number;
  _createdAt?: number;
  _owner?: string;
}

export interface MNSProfile extends NodeBase {
  name: string;
  displayName: string;
  email?: string;
  avatar?: string;
  wallpaper?: string;
  description?: string;

  // Social medias
  url?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  telegram?: string;
  reddit?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitch?: string;
  linkedin?: string;

  // Wallet addresses
  eth?: string;
  btc?: string;
}

export interface RealmNote extends NodeBase, Summary {
  ipfsHash: string;
  arweaveId?: string;
  author?: {
    name: string;
    displayName: string;
    avatar: string;
  };
}

export interface Comment extends NodeBase {
  markdown: string;
  author: {
    name: string;
    displayName: string;
    avatar: string;
  };
}

export interface Tag extends NodeBase {
  name: string;
  sanitizedName: string;
}

export enum EditorMode {
  Code = "code",
  Preview = "preview",
}

export enum WalletConnectMethod {
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
}
