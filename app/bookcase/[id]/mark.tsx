"use client";

import IconLabelButton from "@/components/icon-label-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAlerter } from "@/hooks/contexts/alerter";
import { useStore } from "@/hooks/contexts/store";
import type { MarkAllColumn } from "@/lib/db";
import {
  BookmarkXIcon,
  HatGlassesIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition, type MouseEvent } from "react";
import { deleteMark, toggleLikesOrReports } from "./book.action";

export default function Mark({
  mark,
  bookOwner,
  withdel,
}: {
  mark: MarkAllColumn;
  bookOwner: number;
  withdel: boolean;
}) {
  if (mark.id === 4)
    console.log("🚀 ~ mark:", mark.id, "->", mark.Likes.map((like) => like.member).join());
  const { data: session } = useSession();
  const userId = Number(session?.user.id);
  const { iReportedMarks } = useStore();
  // const iLikedMarks = mark.Likes.map(({ member }) => member);
  const [reported, setReported] = useState(false);

  const [optimisticLikes, setOptimisticLikes] = useOptimistic(mark.Likes);
  if (mark.id === 4) console.log("🚀 ~ optimisticLikes:", optimisticLikes);

  const router = useRouter();
  const { alert } = useAlerter();
  const [isPending, startTransition] = useTransition();

  const openLinkTrigger = async () => {
    // 좋아요 한 마크는 바로삭제에서 제외!
    if (!withdel || mark._count.Likes > 0) return;

    try {
      await deleteMark(mark.id, bookOwner);
      router.refresh();
    } catch (error) {
      console.log(error);
      await alert({ title: (error as Error).message });
    }
  };

  const toggling = async (e: MouseEvent<HTMLButtonElement>, type: "likes" | "reports") => {
    e.stopPropagation();
    e.preventDefault();
    if (!session?.user) {
      alert({ title: "Need Login!!!" });
      return;
    }

    startTransition(async () => {
      try {
        if (mark.Likes.map(({ member }) => member).includes(userId))
          setOptimisticLikes([...optimisticLikes.filter(({ member }) => member !== userId)]);
        else setOptimisticLikes([...optimisticLikes, { member: userId }]);

        await toggleLikesOrReports(mark.id, type);

        if (type === "likes") {
          // mark._count.Likes += liked ? -1 : 1;
          // toggleLiked();
          // setLiked((liked) => !liked);
          if (mark.Likes.map(({ member }) => member).includes(userId))
            mark.Likes = mark.Likes.filter(({ member }) => member !== userId);
          else mark.Likes.push({ member: userId });
        } else {
          mark._count.Report += reported ? -1 : 1;
          setReported((reported) => !reported);
        }
      } catch (error) {
        if (error instanceof Error) alert({ title: error.message });
        else alert({ title: JSON.stringify(error) });
      }
    });
  };

  const likeMark = (e: MouseEvent<HTMLButtonElement>) => toggling(e, "likes");
  const reportMark = (e: MouseEvent<HTMLButtonElement>) => toggling(e, "reports");

  // useEffect(() => {
  //   if (!mark.id) return;
  //   console.log("🚀 ~ iLikedMarks:", iLikedMarks);
  //   if (iLikedMarks.length) setLiked(iLikedMarks.includes(mark.id));
  //   if (iReportedMarks.length) setReported(iReportedMarks.includes(mark.id));
  // }, [iReportedMarks, iLikedMarks, mark]);

  return (
    <div className="group rounded-lg bg-white px-2 pt-2 pb-0.5 shadow-md hover:bg-slate-50 hover:shadow-lg">
      <Link
        href={mark.link}
        onClick={openLinkTrigger}
        target="_blank"
        rel="noopener noreferrer"
        className="mark"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-16 w-auto max-w-[50%] rounded-lg group-hover:ring-2 group-hover:ring-primary">
            <AvatarImage
              src={mark.image || `https://avatar.vercel.sh/${mark.title}}`}
              className="aspect-auto size-auto"
            />
            <AvatarFallback className="w-20">{mark.title.substring(0, 5)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col overflow-hidden [&>*]:truncate">
            <h1 className="text-lg dark:text-black/70" title={mark.title}>
              {mark.id}. {mark.title}
            </h1>
            <small className="text-muted-foreground">{mark.descript || mark.title}</small>
            <small className="text-muted-foreground underline-offset-2 group-hover:underline">
              {mark.link}
            </small>
          </div>
        </div>
        <Separator className="mt-2 mb-0.5 bg-muted-foreground/30" />
        <div className="flex items-center justify-between text-sm">
          <IconLabelButton
            icon={<ThumbsUpIcon />}
            onClick={likeMark}
            // isActive={liked}
            // isActive={mark.Likes.map((like) => like.member).includes(userId)}
            isActive={optimisticLikes.map((like) => like.member).includes(userId)}
            disabled={isPending}
          >
            {/* {mark.Likes.length} */}
            {optimisticLikes.length}
          </IconLabelButton>
          <IconLabelButton icon={<MessageCircleIcon />}>{mark._count.Talk}</IconLabelButton>
          <IconLabelButton
            icon={<HatGlassesIcon />}
            onClick={reportMark}
            isDanger
            isActive={reported}
            disabled={isPending}
          >
            {mark._count.Report}
          </IconLabelButton>
          <IconLabelButton
            icon={<BookmarkXIcon className="size-5" />}
            tooltip="Delete this right away"
            isDanger
          />
          <IconLabelButton icon={<MoreHorizontalIcon />} />
        </div>
      </Link>
    </div>
  );
}
