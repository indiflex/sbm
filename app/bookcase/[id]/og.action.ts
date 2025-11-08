"use server";
import ogs from "open-graph-scraper";

export const scrapOg = async (url: string) => {
  const { result } = await ogs({ url });
  console.log("🚀 ~ data:", result);
  return result;
};
