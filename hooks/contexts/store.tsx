"use client";

import { likesAndReports } from "@/app/bookcase/[id]/book.action";
import { useSession } from "next-auth/react";
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

type ContextValueProps = {
  iLikedMarks: number[];
  iReportedMarks: number[];
  // toggleLikesOrReports: (
  //   mark: MarkAllColumn,
  //   type: 'likes' | 'reports'
  // ) => void;
  // setMarks: (likes: number[], reports: number[]) => void;
  // isToggling: boolean;
};

const StoreContext = createContext<ContextValueProps>({
  iLikedMarks: [],
  iReportedMarks: [],
  // setMarks: () => {},
  // toggleLikesOrReports: () => {},
  // isToggling: false,
});

export function StoreProvider({ children }: PropsWithChildren) {
  const [iLikedMarks, setLikedMarks] = useState<number[]>([]);
  const [iReportedMarks, setReportedMarks] = useState<number[]>([]);
  const { data: session } = useSession();
  // const { alert } = useAlerter();

  const setMarks = useCallback((likes: number[], reports: number[]) => {
    // console.log('🚀 ~ likes/reports:', likes, reports);

    setLikedMarks(likes);
    setReportedMarks(reports);
  }, []);

  // const toggleLikesOrReports = (
  //   mark: MarkAllColumn,
  //   type: 'likes' | 'reports'
  // ) => {
  //   if (!session?.user) {
  //     alert({ title: 'Need Login!' });
  //     return;
  //   }

  // const [state, setState] =
  //   type === 'likes'
  //     ? [iLikedMarks, setLikedMarks]
  //     : [iReportedMarks, setReportedMarks];

  // const { id } = mark;
  // const hasNow = state.includes(id);
  // if (hasNow) setState([...state.filter(likeId => likeId !== id)]);
  // else setState([...state, id]);

  // await toggleLikesOrReportsAction(id, type);
  // const incdec = hasNow ? -1 : 1;
  // if (type === 'likes') mark._count.Likes += incdec;
  // else mark._count.Report += incdec;
  // };

  useEffect(() => {
    if (session?.user) {
      likesAndReports(Number(session.user.id)).then((res) => {
        // [ [{id: 1}, {id: 2}], [{id: 1}] ]
        const [likes, reports] = res;
        setMarks(
          likes.map(({ mark }) => mark),
          reports.map(({ mark }) => mark),
        );
      });
    }
  }, [session?.user, setMarks]);

  return (
    <StoreContext.Provider value={{ iLikedMarks, iReportedMarks }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => use(StoreContext);
