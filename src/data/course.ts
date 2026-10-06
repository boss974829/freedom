import raw from "./course.json";

export type Phase = {
  id: string;
  numeral: string;
  title: string;
  blurb: string;
};

export type Lesson = {
  id: string;
  phase: string;
  title: string;
  note: string;
  crux: string[];
  minutes?: number;
  start?: number;
  gated?: boolean;
};

export const channelName = raw.channel;
export const channelUrl = raw.channelUrl;
export const hostName = raw.host;
export const phases = raw.phases as Phase[];
export const lessons = raw.lessons as Lesson[];
