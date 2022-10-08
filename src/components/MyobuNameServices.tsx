import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { MNSProfile } from "../lib/types";
import {
  mdiBitcoin,
  mdiEthereum,
  mdiFacebook,
  mdiGithub,
  mdiInstagram,
  mdiLinkedin,
  mdiReddit,
  mdiTwitch,
  mdiTwitter,
  mdiWeb,
  mdiYoutube,
} from "@mdi/js";
import { siDiscord, siTelegram, siTiktok } from "simple-icons/icons";
import { randomColorGenerator } from "../lib/utils";

const defaultWallpaper = "https://wallpaperaccess.com/full/1727918.jpg";

export function MNSProfileCard({
  profile,
  labels,
}: {
  profile: MNSProfile;
  labels: string[];
}) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const hasSocialMedias = Object.keys(profile).some((key) =>
    [
      "url",
      "twitter",
      "discord",
      "github",
      "telegram",
      "reddit",
      "youtube",
      "instagram",
      "facebook",
      "tiktok",
      "twitch",
      "linkedin",
    ].includes(key)
  );

  useEffect(() => {
    if (!profile.avatar) {
      setAvatarUrl(
        `https://avatars.dicebear.com/api/big-ears-neutral/${profile.name}.svg`
      );
    } else {
      setAvatarUrl(profile.avatar);
    }
  }, [profile.avatar, profile.name]);

  return (
    <div className="card w-96 max-w-full bg-neutral text-gray-300 shadow-xl mx-auto text-left">
      <div
        className="h-48 bg-cover"
        style={{
          backgroundImage: `url(${profile.wallpaper || defaultWallpaper})`,
        }}
      ></div>
      <div className="card-body relative">
        <div className="avatar absolute -top-8">
          <div className="w-[80px] rounded-full ring ring-white">
            <img src={avatarUrl} alt={`${profile.name}.m`} />
          </div>
        </div>
        <div className="flex flex-col absolute left-[128px] -top-[-4px]">
          <h3 className="card-title">{profile.displayName}</h3>
          <span className="-mt-1">@{profile.name}.m</span>
        </div>
        {hasSocialMedias && (
          <div className="mt-8 flex flex-row items-center flex-wrap">
            {profile.url && (
              <a
                title={`@${profile.name}.m's url`}
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiWeb} size={1}></Icon>
              </a>
            )}
            {profile.twitter && (
              <a
                title={`@${profile.name}.m's twitter`}
                href={profile.twitter}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiTwitter} size={1}></Icon>
              </a>
            )}
            {profile.telegram && (
              <a
                title={`@${profile.name}.m's telegram`}
                href={profile.telegram}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={siTelegram.path} size={0.9}></Icon>
              </a>
            )}
            {profile.discord && (
              <a
                title={`@${profile.name}.m's discord`}
                href={profile.discord}
                target="_blank"
                rel="noreferrer"
                className="mr-1.5"
              >
                <Icon path={siDiscord.path} size={1}></Icon>
              </a>
            )}
            {profile.github && (
              <a
                title={`@${profile.name}.m's github`}
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiGithub} size={1}></Icon>
              </a>
            )}
            {profile.reddit && (
              <a
                title={`@${profile.name}.m's reddit`}
                href={profile.reddit}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiReddit} size={1}></Icon>
              </a>
            )}
            {profile.youtube && (
              <a
                title={`@${profile.name}.m's youtube`}
                href={profile.youtube}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiYoutube} size={1}></Icon>
              </a>
            )}
            {profile.instagram && (
              <a
                title={`@${profile.name}.m's instagram`}
                href={profile.instagram}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiInstagram} size={1}></Icon>
              </a>
            )}
            {profile.facebook && (
              <a
                title={`@${profile.name}.m's facebook`}
                href={profile.facebook}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiFacebook} size={1}></Icon>
              </a>
            )}
            {profile.tiktok && (
              <a
                title={`@${profile.name}.m's tiktok`}
                href={profile.tiktok}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={siTiktok.path} size={0.8}></Icon>
              </a>
            )}
            {profile.twitch && (
              <a
                title={`@${profile.name}.m's twitch`}
                href={profile.twitch}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiTwitch} size={1}></Icon>
              </a>
            )}
            {profile.linkedin && (
              <a
                title={`@${profile.name}.m's linkedin`}
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mr-0.5"
              >
                <Icon path={mdiLinkedin} size={1}></Icon>
              </a>
            )}
            {profile.eth && (
              <a
                title={`@${profile.name}.m's eth address`}
                href={`https://etherscan.io/address/${profile.eth}`}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiEthereum} size={1}></Icon>
              </a>
            )}
            {profile.btc && (
              <a
                title={`@${profile.name}.m's btc address`}
                href={`https://www.blockchain.com/btc/address/${profile.btc}`}
                target="_blank"
                rel="noreferrer"
                className="mr-1"
              >
                <Icon path={mdiBitcoin} size={1}></Icon>
              </a>
            )}
          </div>
        )}
        <p className={`${hasSocialMedias ? `mt-1` : "mt-8"} text-gray-400`}>
          {profile.description}
        </p>
        <div>
          <span
            className="text-xs float-right"
            style={{
              color: randomColorGenerator.generateColor(":" + labels.join(":")),
            }}
          >
            {":" + labels.join(":")}
          </span>
        </div>
      </div>
    </div>
  );
}
