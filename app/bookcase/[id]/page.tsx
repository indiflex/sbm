import IconLabel from "@/components/icon-label";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import { auth } from "@/lib/auth";
import prisma, { findMemberByIdWithCount } from "@/lib/db";
import { AlbumIcon, BookMarkedIcon, HeartPlusIcon, PlusIcon } from "lucide-react";
import { use } from "react";
import Book from "./book";
import BookDialog from "./book-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

export default function BookcaseNickname({ params }: Props) {
  const { id } = use(params);
  const session = use(auth());
  const isMyBookcase = !!session?.user && id === session.user.id;

  const mbr = use(findMemberByIdWithCount(id));
  if (!mbr) return <h1 className="text-2xl">User Not Found</h1>;

  const books = use(
    prisma.book.findMany({
      where: { member: Number(id) },
      include: {
        Mark: {
          include: {
            _count: { select: { Report: true, Talk: true } },
            Likes: { select: { member: true } },
            // Likes: { select: { member: true }, where: { member: Number(session?.user.id ?? 0) } },
          },
        },
        FollowBook: { select: { member: true } },
      },
    }),
  );
  console.log("🚀 ~ books:", books);

  return (
    <div className="flex h-full flex-col pt-2">
      <h1 className="flex items-center justify-between px-5 font-semibold text-2xl">
        <div className="flex items-center tracking-wider">
          {/* <UserAvatar id={id} withName={true} /> */}
          {mbr && <UserAvatar member={mbr} withName={true} />}
          <span className="ml-2 hidden font-medium text-green-600 tracking-tighter sm:block">
            Bookcase
          </span>
        </div>
        <span className="flex gap-3 text-lg">
          <IconLabel icon={<BookMarkedIcon />}>{mbr._count.Book}</IconLabel>
          <IconLabel icon={<AlbumIcon />} noti="muted">
            {mbr._count.Mark}
          </IconLabel>
          <IconLabel icon={<HeartPlusIcon />} noti="destructive">
            50
          </IconLabel>
        </span>
      </h1>

      <div className="h-full overflow-x-scroll">
        <div className="flex gap-3 py-2">
          {books.length ? (
            books.map((book) => <Book key={book.id} book={book} />)
          ) : (
            <h1 className="min-w-64 rounded-lg bg-slate-300 p-5 text-center font-medium text-muted-foreground text-xl">
              <span className="rounded-lg bg-white p-2 px-5">There is no books.</span>
            </h1>
          )}

          {isMyBookcase && (
            <BookDialog>
              <Button
                variant={"ghost"}
                className="flex w-60 justify-start rounded-full bg-slate-200 font-semibold text-lg hover:bg-muted-foreground/30 dark:bg-muted dark:hover:bg-muted-foreground/30"
              >
                <PlusIcon /> Add a Book
              </Button>
            </BookDialog>
          )}
        </div>
      </div>
    </div>
  );
}
