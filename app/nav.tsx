import ThemeChanger from "@/components/theme-changer";
import UserAvatar from "@/components/user-avatar";
import { auth } from "@/lib/auth";

import { SquareLibraryIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function Nav() {
  const session = use(auth());
  const didLogin = !!session?.user;
  // console.log('🚀 ~ session:', session?.user);
  return (
    <div className="flex items-center gap-5 py-1">
      <Link href="/bookcase" className="btn-icon">
        <SquareLibraryIcon />
      </Link>

      <ThemeChanger />

      {didLogin ? (
        <Link href="/my" className="relative overflow-hidden rounded-full border">
          {/* <Image
            src={existsFile(session.user?.image) || DummyProfile}
            alt={session.user?.name || "guest"}
            unoptimized={process.env.NODE_ENV === "development"}
            fill
          /> */}
          <UserAvatar member={{ nickname: session.user.name || "", image: session.user.image }} />
        </Link>
      ) : (
        <Link href="/sign">Login</Link>
      )}
    </div>
  );
}
