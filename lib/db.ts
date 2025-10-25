'only server';

import { PrismaClient } from '@/lib/generated/prisma/client';

const newInstance = () => new PrismaClient();

// biome-ignore lint/suspicious/noShadowRestrictedNames: for too many connections problems
declare const globalThis: {
  prismaGlobal: ReturnType<typeof newInstance>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? newInstance();

export default prisma;
globalThis.prismaGlobal = prisma;

export const findMemberByEmail = async (
  email: string,
  isIncludePasswd: boolean = false
) =>
  prisma.member.findUnique({
    select: {
      id: true,
      nickname: true,
      isadmin: true,
      emailcheck: true,
      image: true,
      outdt: true,
      passwd: isIncludePasswd,
    },
    where: { email },
  });

export type Member = Awaited<ReturnType<typeof findMemberById>>;

export type MemberWithCount = Awaited<
  ReturnType<typeof findMemberByIdWithCount>
>;

export const findMemberById = async (id: number | string) =>
  prisma.member.findUnique({
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      isadmin: true,
    },
    where: { id: Number(id) },
  });

export const findMemberByIdWithCount = async (id: number | string) =>
  prisma.member.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      isadmin: true,
      _count: { select: { Book: true, Mark: true } },
      Book: true,
    },
  });

// book
export type BookAllColumn = Awaited<ReturnType<typeof findBookWithMarkById>>;
export type BookData = Omit<
  NonNullable<BookAllColumn>,
  'Mark' | 'createdAt' | 'updatedAt'
>;

export const findBookById = async (id: number) =>
  prisma.book.findUnique({
    where: { id },
  });

export const findBookWithMarkById = async (id: number) =>
  prisma.book.findUnique({
    where: { id },
    // include: { Mark: true },
    include: {
      Mark: {
        include: {
          _count: { select: { Likes: true, Talk: true, Report: true } },
        },
      },
    },
  });

// mark
export type MarkAllColumn = NonNullable<
  Awaited<ReturnType<typeof findMarkWithCount>>
>;
export type MarkWithCountData = Omit<MarkAllColumn, 'createdAt' | 'updatedAt'>;
export type MarkData = Omit<
  MarkAllColumn,
  'createdAt' | 'updatedAt' | '_count'
>;

export const findMarkWithCount = async (id: number) =>
  prisma.mark.findUnique({
    where: { id },
    include: {
      _count: { select: { Likes: true, Talk: true, Report: true } },
    },
  });

export const myLikedMarks = async (maker: number) =>
  prisma.mark.findMany({
    where: { maker },
    select: { id: true },
  });
