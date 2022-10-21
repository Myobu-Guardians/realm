import { renderPreview } from "@0xgg/echomd/preview";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Comment } from "../lib/types";

interface Props {
  comment: Comment;
}

export default function CommentCard(props: Props) {
  const { comment } = props;
  const previewElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comment && previewElement.current) {
      renderPreview(previewElement.current, comment.markdown);
    }
  }, [comment, previewElement]);

  return (
    <div>
      {/* Top banner */}
      <div className="flex items-center justify-between">
        {/* author */}
        <Link to={`/${comment.author.name}.m`}>
          <div className="flex flex-row items-center flex-1">
            <div className="avatar mr-2">
              <div className="w-[30px] rounded-full ring ring-white hover:ring-slate-200">
                <img
                  src={
                    comment.author.avatar ||
                    `https://avatars.dicebear.com/api/big-ears-neutral/${
                      comment.author.name || ""
                    }.svg`
                  }
                  alt={comment.author.name + ".m"}
                ></img>
              </div>
            </div>
            <div className="flex flex-col text-xs">
              <div className="font-bold hover:underline">
                {comment.author.displayName}
              </div>
              <span className="hover:underline">@{comment.author.name}.m</span>
            </div>
          </div>
        </Link>
        <div className="flex-none flex flex-col sm:flex-row items-center">
          {/* date */}
          <div className="badge ml-2">
            {new Date(comment._createdAt || 0).toLocaleString()}
          </div>
        </div>
      </div>
      {/* Markdown */}
      {/* Note markdown preview */}
      <div
        className={"mt-2 preview"}
        style={{
          backgroundColor: "inherit",
        }}
        ref={previewElement}
      ></div>
    </div>
  );
}
