// TODO: Maybe put this interface into the myobu-protocol-client library

import { Summary } from "./note";

export enum Tab {
  Notes = "notes",
  MNS = "mns",
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
