import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, List, Play, Search } from "lucide-react";
import {
  channelName,
  channelUrl,
  hostName,
  lessons,
  phases,
  type Lesson,
} from "@/data/course";

const STORE = "myf-sat-with";

function readSat(): string[] {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function CourseApp() {
  const [phaseId, setPhaseId] = useState("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(lessons[0]?.id ?? "");
  const [sat, setSat] = useState<string[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSat(readSat());
    const hash = window.location.hash.replace("#", "");
    if (lessons.some((lesson) => lesson.id === hash)) setActiveId(hash);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORE, JSON.stringify(sat));
  }, [sat, ready]);

  const activeIndex = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === activeId),
  );
  const lesson = lessons[activeIndex];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((item) => {
      if (phaseId !== "all" && item.phase !== phaseId) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.crux.some((point) => point.toLowerCase().includes(q))
      );
    });
  }, [phaseId, query]);

  function openLesson(id: string) {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    setListOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSat(id: string) {
    setSat((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  if (!lesson) return null;

  const phase = phases.find((item) => item.id === lesson.phase);
  const satCount = lessons.filter((item) => sat.includes(item.id)).length;
  const start = lesson.start ? `&start=${lesson.start}` : "";
  const embed = `https://www.youtube-nocookie.com/embed/${lesson.id}?rel=0${start}`;
  const watchUrl = `https://www.youtube.com/watch?v=${lesson.id}${lesson.start ? `&t=${lesson.start}` : ""}`;
  const prev = lessons[activeIndex - 1];
  const next = lessons[activeIndex + 1];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <header className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <img
            src="/creator.jpg"
            alt={`${hostName}, host of ${channelName}`}
            className="size-16 shrink-0 rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-white/15 sm:size-20"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-widest text-accent uppercase">
              A course in deep living
            </p>
            <h1 className="mt-1 font-serif text-3xl leading-tight text-fg sm:text-4xl">
              {channelName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {lessons.length} talks by {hostName}, in the order to watch them. Each sitting
              has notes, the crux, and the video. Travel clips stay off this path. Your
              place is saved on this device.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="h-1.5 min-w-40 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-200"
              style={{ width: `${Math.round((satCount / lessons.length) * 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted">
            {satCount} of {lessons.length} sat with
          </p>
          <a
            href={channelUrl}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            His channel
          </a>
        </div>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <PhaseChip active={phaseId === "all"} onClick={() => setPhaseId("all")}>
          All
        </PhaseChip>
        {phases.map((item) => (
          <PhaseChip
            key={item.id}
            active={phaseId === item.id}
            onClick={() => setPhaseId(item.id)}
          >
            {item.numeral} {item.title}
          </PhaseChip>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className={`${listOpen ? "block" : "hidden"} lg:block`}>
          <div className="glass rounded-3xl p-3 lg:sticky lg:top-4">
            <label className="flex items-center gap-2 rounded-2xl bg-ink/40 px-3 py-2">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the path"
                className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
              />
            </label>
            <p className="px-2 pt-3 text-xs leading-relaxed text-muted">
              {phaseId === "all"
                ? "Watch straight through. The path opens on the government-job talk."
                : phases.find((item) => item.id === phaseId)?.blurb}
            </p>
            <ul className="mt-2 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
              {visible.length === 0 && (
                <li className="px-2 py-6 text-sm text-muted">Nothing on the path matches.</li>
              )}
              {visible.map((item) => (
                <li key={item.id}>
                  <TalkRow
                    lesson={item}
                    index={lessons.findIndex((row) => row.id === item.id) + 1}
                    active={item.id === lesson.id}
                    done={sat.includes(item.id)}
                    onOpen={() => openLesson(item.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <article className="glass rounded-3xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-widest text-accent uppercase">
              {phase?.numeral} {phase?.title} · {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={() => setListOpen((open) => !open)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/8 px-4 text-sm text-fg lg:hidden"
            >
              <List className="size-4" aria-hidden />
              {listOpen ? "Hide talks" : "All talks"}
            </button>
          </div>
          <h2 className="mt-3 font-serif text-2xl leading-snug text-fg sm:text-3xl">
            {lesson.title}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {lesson.minutes ? `${lesson.minutes} min · ` : ""}
            {channelName}
            {lesson.start ? " · begins at the turn in the talk" : ""}
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10">
            {lesson.gated ? (
              <a
                href={watchUrl}
                className="relative block aspect-video"
              >
                <img
                  src={`/stills/${lesson.id}.jpg`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-ink/80 p-4">
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-ink">
                    <Play className="size-4" aria-hidden />
                    Watch on YouTube
                  </span>
                  <span className="text-sm leading-relaxed text-fg">
                    YouTube age-restricts this talk, so it opens there. The notes below are from the talk.
                  </span>
                </span>
              </a>
            ) : (
              <div className="aspect-video">
                <iframe
                  key={embed}
                  src={embed}
                  title={lesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={watchUrl}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-ink"
            >
              <Play className="size-4" aria-hidden />
              Open on YouTube
            </a>
            <button
              type="button"
              onClick={() => toggleSat(lesson.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/8 px-4 text-sm text-fg"
            >
              <Check className="size-4 text-accent" aria-hidden />
              {sat.includes(lesson.id) ? "Sat with this" : "I sat with this"}
            </button>
          </div>

          <h3 className="mt-8 font-serif text-xl text-fg">Notes</h3>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-fg/90">{lesson.note}</p>

          <h3 className="mt-8 font-serif text-xl text-fg">The crux</h3>
          <ul className="mt-3 space-y-2">
            {lesson.crux.map((point) => (
              <li
                key={point}
                className="rounded-2xl bg-white/5 px-4 py-3 text-sm leading-relaxed text-fg"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between gap-3">
            <StepButton
              disabled={!prev}
              onClick={() => prev && openLesson(prev.id)}
              label="Previous"
              icon="left"
            />
            <StepButton
              disabled={!next}
              onClick={() => next && openLesson(next.id)}
              label="Next talk"
              icon="right"
            />
          </div>
          <p className="mt-8 text-xs leading-relaxed text-muted">
            A study guide of public talks, not the official channel. The videos remain on
            YouTube. If a sitting is about distress, it is not care — speak to someone near
            you.
          </p>
        </article>
      </div>
    </main>
  );
}

function PhaseChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${
        active ? "bg-accent text-ink" : "bg-white/8 text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function TalkRow({
  lesson,
  index,
  active,
  done,
  onOpen,
}: {
  lesson: Lesson;
  index: number;
  active: boolean;
  done: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full min-h-11 items-start gap-3 rounded-2xl px-2 py-2 text-left ${
        active ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      <span className={`mt-0.5 w-6 shrink-0 text-xs ${active ? "text-accent" : "text-muted"}`}>
        {String(index).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug text-fg">{lesson.title}</span>
        {lesson.minutes ? (
          <span className="mt-0.5 block text-xs text-muted">{lesson.minutes} min</span>
        ) : null}
      </span>
      {done ? <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /> : null}
    </button>
  );
}

function StepButton({
  disabled,
  onClick,
  label,
  icon,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: "left" | "right";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white/8 px-4 text-sm text-fg disabled:opacity-40"
    >
      {icon === "left" ? <ChevronLeft className="size-4" aria-hidden /> : null}
      {label}
      {icon === "right" ? <ChevronRight className="size-4" aria-hidden /> : null}
    </button>
  );
}
