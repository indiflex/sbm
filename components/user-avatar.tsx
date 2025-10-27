"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findMemberByIdWithCount, type MemberWithCount } from "@/lib/db";
import { DummyProfileFile } from "@/lib/utils";
import { use } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

type PartialExclude<T, E extends keyof T> = Partial<T> & Required<Pick<T, E>>;

type Props =
  | {
      id: number | string;
      member?: undefined;
      withName?: boolean;
    }
  | {
      id?: undefined;
      member: PartialExclude<NonNullable<MemberWithCount>, "nickname">;
      withName?: boolean;
    };

export default function UserAvatar({ id, member, withName }: Props) {
  const mbr = member ? member : use(findMemberByIdWithCount(id));

  if (!mbr)
    return (
      <Avatar>
        <AvatarImage src={"/profile_dummy.png"} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );

  console.log("mbr.image>>>", mbr.image);
  return (
    <div className="flex items-center gap-1">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar>
            <AvatarImage src={mbr.image || DummyProfileFile} />
            <AvatarFallback className="text-xl">
              {mbr.nickname.substring(0, /[0-9A-Za-z]/.test(mbr.nickname) ? 2 : 1)}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>

        {mbr._count && (
          <HoverCardContent className="w-auto max-w-80">
            <div className="flex justify-between gap-1">
              <div className="w-20">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mbr.image || DummyProfileFile} className="" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-shrink-0 space-y-1">
                <h4 className="font-semibold text-sm">@{mbr.nickname}</h4>
                <p className="text-muted-foreground text-sm">{mbr.email}</p>
                <div className="text-muted-foreground text-xs">
                  {mbr._count.Book} Books
                  {mbr._count.Mark} Marks 00 Followers
                </div>
              </div>
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
      {withName && decodeURI(mbr.nickname)}
    </div>
  );
}
