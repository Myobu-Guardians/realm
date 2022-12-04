import { Link } from "react-router-dom";
import { MNSProfile } from "../lib/types";

interface Props {
  author: MNSProfile;
  rightContent?: React.ReactNode;
}

export default function AuthorDiv({ author, rightContent }: Props) {
  return (
    <div className="flex flex-row items-center justify-between">
      <Link to={`/${author.name || ""}.m`}>
        <div className="flex flex-row items-center flex-1">
          <div className="avatar mr-2">
            <div className="w-[40px] rounded-full ring ring-white hover:ring-slate-200">
              <img
                src={
                  author?.avatar ||
                  `https://avatars.dicebear.com/api/big-ears-neutral/${
                    author.name || ""
                  }.svg`
                }
                alt={author.name + ".m"}
              ></img>
            </div>
          </div>
          <div className="flex flex-col text-sm">
            <div className="font-bold hover:underline">
              {author.displayName}
            </div>
            <span className="hover:underline">@{author?.name}.m</span>
          </div>
        </div>
      </Link>
      {rightContent}
    </div>
  );
}
