"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { validate, validateAsync } from "@/lib/validator";
import z from "zod";

export const saveBook = async (formData: FormData) => {
  const user = await checkLogin();

  const member = Number(user.id);

  console.log("🚀 ~ formData:", Object.fromEntries(formData.entries()));

  const zobj = z
    .object({
      title: z.string().min(1),
      ispublic: z.string().optional(),
      withdel: z.string().optional(),
      remark: z.string().optional(),
    })
    .refine(({ ispublic, withdel }) => !ispublic || (ispublic && !withdel), {
      path: ["withdel"],
      message: "Public book cannot have open with deletion!",
    });

  const [err, data] = validate(zobj, formData);
  // console.log('🚀 ~ err:', err, data);
  if (err) return err;

  const id = Number(formData.get("id"));
  const { id: userId, isadmin } = user;

  if (id) {
    await prisma.book.update({
      where: isadmin ? { id } : { id, member: Number(userId) },
      data: {
        ...data,
        ispublic: data.ispublic === "on",
        withdel: !!data.withdel,
      },
    });
  } else {
    await prisma.book.create({
      data: {
        ...data,
        ispublic: data.ispublic === "on",
        withdel: !!data.withdel,
        member,
      },
    });
  }
};

const checkLogin = async () => {
  const session = await auth();
  if (!session?.user || !session.user.id) throw new Error("Need Login");
  return session.user;
};

export const deleteBook = async (id: number) => {
  // const session = await auth();
  // if (!session?.user || !session.user.id) throw new Error('Need Login');
  const user = await checkLogin();

  const zobj = z
    .object({
      id: z.number(),
    })
    .superRefine(async ({ id }, ctx) => {
      const book = await prisma.book.findUnique({
        where: { id },
        // where: { id: id + 10000 },
      });

      if (!book) {
        ctx.addIssue({
          code: "custom",
          message: `This Book(#${id}) is not exists!`,
          path: ["id"],
        });
      }
    });

  const [err] = await validateAsync(zobj, { id });
  if (err) return err;

  const { id: userId, isadmin } = user;

  await prisma.book.delete({
    where: isadmin ? { id } : { id, member: Number(userId) },
  });
};

export const likesAndReports = async (member: number) => {
  const ilikes = await prisma.likes.findMany({
    where: { member },
    select: { mark: true },
  });

  const ireports = await prisma.report.findMany({
    where: { member },
    select: { mark: true },
  });

  return [ilikes, ireports];
};

export const deleteMark = async (id: number, bookOwner: number) => {
  const { id: userId, isadmin } = await checkLogin();
  console.log("🚀 ~ userId:", userId, id, bookOwner);

  // check exists
  const mark = await prisma.mark.findUnique({
    where: { id },
  });

  if (!mark) throw new Error(`This Mark(#${id}) is not exists!`);

  if (!isadmin && Number(userId) !== bookOwner && mark.maker !== Number(userId))
    throw new Error(`You have not authentication!`);

  await prisma.mark.delete({
    where: { id },
  });
};

export const toggleLikesOrReports = async (mark: number, type: "likes" | "reports") => {
  const { id } = await checkLogin();
  const mark_member = { mark, member: Number(id) };
  const where = {
    where: { mark_member },
  };

  // await new Promise((resolve) => setTimeout(resolve, 3000));
  // if (mark === 4) throw new Error("xxxxxx");

  const preData = await (type === "likes"
    ? prisma.likes.findUnique(where)
    : prisma.report.findUnique(where));

  if (preData) {
    return type === "likes" ? prisma.likes.delete(where) : prisma.report.delete(where);
  } else {
    return type === "likes"
      ? prisma.likes.create({ data: mark_member })
      : prisma.report.create({ data: mark_member });
  }
};

export const saveMark = async (formData: FormData) => {
  const user = await checkLogin();

  const maker = Number(user.id);

  console.log("🚀 ~ formData:", Object.fromEntries(formData.entries()));

  const zobj = z
    .object({
      title: z.string().min(1),
      link: z.string().min(1),
      image: z.string().optional(),
      descript: z.string().optional(),
    })
    .refine(({ ispublic, withdel }) => !ispublic || (ispublic && !withdel), {
      path: ["withdel"],
      message: "Public book cannot have open with deletion!",
    });

  const [err, data] = validate(zobj, formData);
  // console.log('🚀 ~ err:', err, data);
  if (err) return err;

  const id = Number(formData.get("id"));
  const { id: userId, isadmin } = user;

  if (id) {
    await prisma.book.update({
      where: isadmin ? { id } : { id, member: Number(userId) },
      data: {
        ...data,
        ispublic: data.ispublic === "on",
        withdel: !!data.withdel,
      },
    });
  } else {
    await prisma.book.create({
      data: {
        ...data,
        ispublic: data.ispublic === "on",
        withdel: !!data.withdel,
        member: maker,
      },
    });
  }
};
