"use client";

import {
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  ProducedWorkCategory,
  ProducedWorkItem,
} from "@/app/lib/cmsTypes";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { ScrambleText } from "../components/ScrambleText";

type Props = {
  initialProducedWorks: ProducedWorkItem[];
};

function isExternalLink(link: string) {
  return /^(https?:)?\/\//i.test(link);
}

function localeCmp(a: string, b: string) {
  return a.localeCompare(b, "ja", { sensitivity: "base" });
}

function uniqSorted(values: string[]) {
  return [...new Set(values)].filter(Boolean).sort((a, b) => localeCmp(a, b));
}

/** アーティスト欄のカンマ区切りを1名ずつに分割（前後空白除去） */
function splitArtistTokens(artist: string): string[] {
  return artist
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * role 欄のトークン化。
 * カンマがあるときはカンマ区切り（`chorus direction` のような複合を1項目にできる）。
 * カンマが無いときのみ空白区切り（例: `Mix Mastering`）。
 */
function splitRoleTokens(role: string): string[] {
  const s = role.trim();
  if (!s) return [];
  if (s.includes(",")) {
    return s.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return s.split(/\s+/).filter(Boolean);
}

/** produced works タイトル／日付ソート（3 状態トグル） */
type ProducedWorksSort = "asc" | "desc" | null;

function cmpDateField(a: string | null | undefined, b: string | null | undefined) {
  const as = (a ?? "").trim();
  const bs = (b ?? "").trim();
  if (!as && !bs) return 0;
  if (!as) return 1;
  if (!bs) return -1;
  return localeCmp(as, bs);
}

const SORT_TAB_W = 17;
const SORT_TAB_HALF_H = 9;
const sortTabDimClass = "opacity-30";
const sortTabActiveClass = "opacity-100";

/** sorttab-top.svg / sorttab-bottom.svg — asc で上が明るい、desc で下が明るい、null は両方暗い */
function ProducedWorksSortTabPair({ sort }: { sort: ProducedWorksSort }) {
  const topActive = sort === "asc";
  const bottomActive = sort === "desc";
  return (
    <span
      className="inline-flex shrink-0 flex-col items-stretch leading-[0]"
      aria-hidden
    >
      <Image
        src="/icon/sorttab-top.svg"
        alt=""
        width={SORT_TAB_W}
        height={SORT_TAB_HALF_H}
        className={`block ${topActive ? sortTabActiveClass : sortTabDimClass}`}
      />
      <Image
        src="/icon/sorttab-bottom.svg"
        alt=""
        width={SORT_TAB_W}
        height={SORT_TAB_HALF_H}
        className={`block ${bottomActive ? sortTabActiveClass : sortTabDimClass}`}
      />
    </span>
  );
}

const sortFieldBtnBaseClass =
  "shrink-0 cursor-pointer whitespace-nowrap bg-transparent p-0 font-normal text-[inherit] leading-[1.1] antialiased border-0 transition-opacity hover:opacity-65 inline-flex items-center gap-x-[6px]";

/** CMS に date が無い行の仮表示（YYYYMMDD） */
const PRODUCED_WORK_DATE_PLACEHOLDER = "2026/01/01";

const FILTER_TAB_HEADER_PX = 17;
/** filtertab.svg 横並びの flex gap */
const FILTER_SELECT_ICON_GAP_PX = 6;

type ProducedWorksFilterAlign = "start" | "end" | "startMdEnd";

function producedWorksFilterAlignStyle(align: ProducedWorksFilterAlign) {
  const wrapJustify =
    align === "start"
      ? "justify-start"
      : align === "end"
        ? "justify-end"
        : "justify-start md:justify-end";
  const textAlign =
    align === "start"
      ? "text-left"
      : align === "end"
        ? "text-right"
        : "text-left md:text-right";
  return { wrapJustify, textAlign };
}

/** produced works: All → … をクリックで順に巡回（カテゴリ・アーティスト・ロール共通レイアウト） */
function ProducedWorksCycleFilterRow({
  id,
  displayLabel,
  onCycle,
  ariaLabelBase,
  align,
}: {
  id: string;
  displayLabel: string;
  onCycle: () => void;
  ariaLabelBase: string;
  align: ProducedWorksFilterAlign;
}) {
  const { wrapJustify, textAlign } = producedWorksFilterAlignStyle(align);

  return (
    <div className="relative w-full min-w-0 max-w-full touch-manipulation">
      <div className={`flex max-w-full items-center ${wrapJustify}`}>
        <div className="inline-flex max-w-full min-w-0 shrink-0 items-center gap-0">
          <button
            type="button"
            id={id}
            onClick={onCycle}
            aria-label={`${ariaLabelBase}。現在は ${displayLabel}。クリックで次に切り替え`}
            className={`inline-flex max-w-full min-w-0 shrink-0 cursor-pointer items-center border-0 bg-transparent py-0 pl-[4px] pr-[2px] font-normal text-[inherit] leading-[1.1] antialiased [-webkit-tap-highlight-color:transparent] ${textAlign}`}
            style={{ gap: FILTER_SELECT_ICON_GAP_PX }}
          >
            <span className="min-w-0 truncate">{displayLabel}</span>
            <span
              className="inline-flex shrink-0 translate-y-[1px] select-none leading-none pointer-events-none"
              aria-hidden
            >
              <Image
                src="/icon/filtertab.svg"
                alt=""
                width={FILTER_TAB_HEADER_PX}
                height={FILTER_TAB_HEADER_PX}
                className="shrink-0"
                draggable={false}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** 文字列フィルター: All（""）→ options 各項目を順に巡回 */
function cycleThroughOrdered(prev: string, orderedOptions: string[]): string {
  const states = ["", ...orderedOptions];
  const i = states.indexOf(prev);
  const idx = i >= 0 ? i : 0;
  return states[(idx + 1) % states.length] ?? "";
}

/** produced works レーベル列ヘッダー: All ↔ 各カテゴリをクリックで巡回 */
type ProducedWorksCategoryFilterUi = "all" | ProducedWorkCategory;

const PRODUCED_WORK_CATEGORY_CYCLE: ProducedWorksCategoryFilterUi[] = [
  "all",
  "commercial-projects",
  "label-releases",
  "indie-projects",
];

const PRODUCED_WORK_CATEGORY_LABELS: Record<
  ProducedWorksCategoryFilterUi,
  string
> = {
  all: "All",
  "commercial-projects": "Commercial Projects",
  "label-releases": "Label Releases",
  "indie-projects": "Indie Projects",
};

function ProducedWorksCategoryCycleFilter({
  id,
  value,
  onCycle,
  ariaLabelBase,
  align,
}: {
  id: string;
  value: ProducedWorksCategoryFilterUi;
  onCycle: () => void;
  ariaLabelBase: string;
  align: ProducedWorksFilterAlign;
}) {
  return (
    <ProducedWorksCycleFilterRow
      id={id}
      displayLabel={PRODUCED_WORK_CATEGORY_LABELS[value]}
      onCycle={onCycle}
      ariaLabelBase={ariaLabelBase}
      align={align}
    />
  );
}

type ProducedWorksListFilters = {
  category: ProducedWorksCategoryFilterUi;
  artist: string;
  role: string;
};

const INITIAL_PRODUCED_WORKS_FILTERS: ProducedWorksListFilters = {
  category: "all",
  artist: "",
  role: "",
};

export function AboutPageClient({ initialProducedWorks }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [producedWorksFilters, setProducedWorksFilters] =
    useState<ProducedWorksListFilters>(INITIAL_PRODUCED_WORKS_FILTERS);
  const [titleSort, setTitleSort] = useState<ProducedWorksSort>(null);
  const [dateSort, setDateSort] = useState<ProducedWorksSort>(null);

  const categoryFilter = producedWorksFilters.category;
  const artistFilter = producedWorksFilters.artist;
  const roleFilter = producedWorksFilters.role;

  const categoryCycleFilterId = useId();
  const artistCycleFilterId = useId();
  const roleCycleFilterId = useId();

  const orderIndex = useMemo(
    () => new Map(initialProducedWorks.map((w, i) => [w._id, i])),
    [initialProducedWorks],
  );

  const artistOptions = useMemo(
    () =>
      uniqSorted(
        initialProducedWorks.flatMap((w) => splitArtistTokens(w.artist)),
      ),
    [initialProducedWorks],
  );
  const roleOptions = useMemo(
    () =>
      uniqSorted(
        initialProducedWorks.flatMap((w) => splitRoleTokens(w.role)),
      ),
    [initialProducedWorks],
  );

  const cycleTitleSort = useCallback(() => {
    setDateSort(null);
    setTitleSort((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }, []);

  const cycleDateSort = useCallback(() => {
    setTitleSort(null);
    setDateSort((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }, []);

  const cycleCategoryFilter = useCallback(() => {
    setProducedWorksFilters((f) => {
      const i = PRODUCED_WORK_CATEGORY_CYCLE.indexOf(f.category);
      const idx = i >= 0 ? i : 0;
      const nextCat =
        PRODUCED_WORK_CATEGORY_CYCLE[
          (idx + 1) % PRODUCED_WORK_CATEGORY_CYCLE.length
        ];
      if (nextCat !== "all") {
        return { category: nextCat, artist: "", role: "" };
      }
      return { ...f, category: nextCat };
    });
  }, []);

  const cycleArtistFilter = useCallback(() => {
    setProducedWorksFilters((f) => {
      const nextArtist = cycleThroughOrdered(f.artist, artistOptions);
      if (nextArtist !== "") {
        return { category: "all", artist: nextArtist, role: "" };
      }
      return { ...f, artist: nextArtist };
    });
  }, [artistOptions]);

  const cycleRoleFilter = useCallback(() => {
    setProducedWorksFilters((f) => {
      const nextRole = cycleThroughOrdered(f.role, roleOptions);
      if (nextRole !== "") {
        return { category: "all", artist: "", role: nextRole };
      }
      return { ...f, role: nextRole };
    });
  }, [roleOptions]);

  const displayedWorks = useMemo(() => {
    const filtered = initialProducedWorks.filter((w) => {
      if (
        artistFilter &&
        !splitArtistTokens(w.artist).includes(artistFilter)
      ) {
        return false;
      }
      if (roleFilter && !splitRoleTokens(w.role).includes(roleFilter)) {
        return false;
      }
      if (
        categoryFilter !== "all" &&
        w.category !== categoryFilter
      ) {
        return false;
      }
      return true;
    });

    if (titleSort) {
      return [...filtered].sort((a, b) => {
        const c = localeCmp(a.title, b.title);
        if (c !== 0) return titleSort === "asc" ? c : -c;
        return (orderIndex.get(a._id) ?? 0) - (orderIndex.get(b._id) ?? 0);
      });
    }

    if (dateSort) {
      return [...filtered].sort((a, b) => {
        const c = cmpDateField(a.date, b.date);
        if (c !== 0) return dateSort === "asc" ? c : -c;
        return (orderIndex.get(a._id) ?? 0) - (orderIndex.get(b._id) ?? 0);
      });
    }

    return [...filtered].sort(
      (a, b) => (orderIndex.get(a._id) ?? 0) - (orderIndex.get(b._id) ?? 0),
    );
  }, [
    initialProducedWorks,
    categoryFilter,
    artistFilter,
    roleFilter,
    titleSort,
    dateSort,
    orderIndex,
  ]);

  return (
    <div className="flex min-h-full flex-col flex-1 px-[10px] py-[15px] md:p-[17px]">
      <Header />

      <section className="text-[14px] leading-[1.1] md:text-[15px]">
        <div className="flex flex-row items-start gap-x-[10px] md:gap-x-[17px] mt-[30px] md:mt-[0px]">
          <div className="flex-4 md:flex-5 space-y-[15px] md:space-y-[34px]">
            <div>
              <h1>(About)</h1>
            </div>

            <div className="whitespace-nowrap">
              <p>Music Label</p>
              <p>Based in Tokyo</p>
            </div>
          </div>

          <div className="flex-5 md:flex-4">
            <div className="flex flex-col gap-y-[30px] md:gap-y-[34px] md:flex-row md:items-start md:gap-x-[17px]">
              <div className="flex-1 md:h-[159px] md:w-[284px] md:flex-none">
                <Image
                  src="/images/about-hero.webp"
                  alt=""
                  width={284}
                  height={159}
                  className="md:h-full w-full w-object-cover"
                  priority
                />
              </div>

              <div className="flex-1 space-y-[30px] md:space-y-[34px] md:flex-[2]">
                <div>
                  <p>
                    hrcは世田谷・羽根木を中心に活動する音楽レーベルです。HIP
                    HOPアーティストを中心として、楽曲プロデュースや自社スタジオによるレコーディング業務、所属アーティストのマネジメントなどを行っています。
                  </p>
                </div>

                <div className="space-y-[15px] md:space-y-[17px]">
                  <div className="flex items-start gap-x-[10px] md:gap-x-[17px]">
                    <p className="w-[80px] shrink-0">Member</p>
                    <p className="flex-1">
                      takeisme / ASA Wu/ minami /
                      theeluu / Leo Iwamura
                    </p>
                  </div>

                  <div className="flex items-start gap-x-[10px] md:gap-x-[17px]">
                    <p className="w-[80px] shrink-0">Location</p>
                    <p className="flex-1">
                      201 Juno Hanegi Koen,
                      <br className="hidden md:block" />
                      <span>
                        6-9-17 Matsubara, <br className="md:hidden" />
                        <span className="whitespace-nowrap">Setagaya-ku,</span>
                      </span>
                      <br className="hidden md:block" />
                      Tokyo 156-0043
                      <br />
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=201+Juno+Hanegi+Koen,6-9-17+Matsubara,+Setagaya-ku,+Tokyo+156-0043"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link_co inline-flex items-center gap-1 w-fit"
                      >
                        <span className="whitespace-nowrap">
                          <ScrambleText
                            text="Google Map"
                            mode="lap"
                            speedMs={40}
                            durationMs={400}
                          />
                        </span>
                        <Image src="/icon-map.svg" alt="" width={9} height={9} className="link_co-icon" />
                      </a>
                    </p>
                  </div>

                  <div className="flex items-start gap-x-[10px] md:gap-x-[17px]">
                    <p className="w-[80px] shrink-0">Contact</p>
                    <div className="flex flex-1 flex-col items-start">
                      <Link href="mailto:contact@hrc.com" className="link_co flex items-center gap-1 w-fit">
                        <ScrambleText
                          text="mail"
                          mode="lap"
                          speedMs={40}
                          durationMs={400}
                        />
                        <Image src="/icon-map.svg" alt="" width={9} height={9} className="link_co-icon" />
                      </Link>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link_co flex items-center gap-1 w-fit"
                      >
                        <ScrambleText text="X" mode="lap" speedMs={40} durationMs={400} />
                        <Image src="/icon-map.svg" alt="" width={9} height={9} className="link_co-icon" />
                      </a>
                      <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link_co flex items-center gap-1 w-fit"
                      >
                        <ScrambleText
                          text="instagram"
                          mode="lap"
                          speedMs={40}
                          durationMs={400}
                        />
                        <Image src="/icon-map.svg" alt="" width={9} height={9} className="link_co-icon" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[60px] md:mt-[68px] text-[15px] font-normal leading-[1.1] antialiased max-md:text-[14px]">
        <div className="layout-grid">
          <div className="col-start-3 md:[grid-row:span_2] whitespace-nowrap">
            <p>(produced works)</p>
          </div>
        </div>

        <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-normal">
          <div className="col-span-2 md:col-span-5 [grid-row:span_1] min-w-0 text-left">
            <button
              type="button"
              className={`${sortFieldBtnBaseClass} text-left`}
              aria-label="タイトル: ソートなし・昇順・降順を切り替え"
              aria-pressed={titleSort !== null}
              onClick={cycleTitleSort}
            >
              <span>AtoZ</span>
              <ProducedWorksSortTabPair sort={titleSort} />
            </button>
          </div>
          <div className="col-span-7 md:col-span-5 [grid-row:span_1] min-w-0 text-right">
            <ProducedWorksCategoryCycleFilter
              id={categoryCycleFilterId}
              align="end"
              value={categoryFilter}
              onCycle={cycleCategoryFilter}
              ariaLabelBase="プロジェクト種別で絞り込み"
            />
          </div>
          <div className="col-span-3 md:col-span-3 [grid-row:span_1] min-w-0 text-left">
            <ProducedWorksCycleFilterRow
              id={artistCycleFilterId}
              align="start"
              displayLabel={artistFilter === "" ? "All" : artistFilter}
              onCycle={cycleArtistFilter}
              ariaLabelBase="アーティストで絞り込み"
            />
          </div>
          <div className="col-span-4 md:col-span-3 [grid-row:span_1] min-w-0 text-left md:text-right">
            <ProducedWorksCycleFilterRow
              id={roleCycleFilterId}
              align="startMdEnd"
              displayLabel={roleFilter === "" ? "All" : roleFilter}
              onCycle={cycleRoleFilter}
              ariaLabelBase="ロールで絞り込み"
            />
          </div>
          <div className="col-span-2 col-start-8 md:col-span-2 md:col-start-17 [grid-row:span_1] min-w-0 text-right">
            <button
              type="button"
              className={`${sortFieldBtnBaseClass} w-full min-w-0 justify-end text-right`}
              aria-label="日付: ソートなし・昇順・降順を切り替え"
              aria-pressed={dateSort !== null}
              onClick={cycleDateSort}
            >
              <span>Newest</span>
              <ProducedWorksSortTabPair sort={dateSort} />
            </button>
          </div>
        </div>

        <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-nowrap">
          {displayedWorks.map((work) => {
            const isActive = hoveredId === work._id;
            const rowContent = (
              <>
                <div className="col-span-2 md:col-span-5 [grid-row:span_1] text-left">
                  <ScrambleText
                    text={work.title}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={isActive}
                  />
                </div>
                <div className="col-span-7 md:col-span-5 [grid-row:span_1] text-right">
                  <ScrambleText
                    text={work.label}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={isActive}
                  />
                </div>
                <div className="col-span-3 md:col-span-3 [grid-row:span_1] text-left">
                  <ScrambleText
                    text={work.artist}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={isActive}
                  />
                </div>
                <div className="col-span-4 md:col-span-3 [grid-row:span_1] md:text-right">
                  <ScrambleText
                    text={work.role}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={isActive}
                  />
                </div>
                <div className="col-span-2 md:col-span-2 [grid-row:span_1] min-w-0 text-right relative overflow-visible">
                  <span className="relative inline-block max-w-full">
                    <ScrambleText
                      text={(work.date ?? "").trim() || PRODUCED_WORK_DATE_PLACEHOLDER}
                      mode="lap"
                      speedMs={40}
                      durationMs={400}
                      active={isActive}
                    />
                    <div className="pointer-events-none absolute left-1/2 bottom-0 h-px w-[200vw] -translate-x-1/2 bg-white/0 transition-colors group-hover/row:bg-white/70" />
                  </span>
                </div>
              </>
            );

            const commonProps = {
              className: `group/row contents${work.link ? " cursor-pointer" : ""}`,
              onMouseEnter: () => setHoveredId(work._id),
              onMouseLeave: () => setHoveredId(null),
              onFocus: () => setHoveredId(work._id),
              onBlur: () => setHoveredId(null),
            };

            if (!work.link) {
              return (
                <div key={work._id} {...commonProps}>
                  {rowContent}
                </div>
              );
            }

            return (
              <a
                key={work._id}
                href={work.link}
                {...commonProps}
                target={isExternalLink(work.link) ? "_blank" : undefined}
                rel={isExternalLink(work.link) ? "noopener noreferrer" : undefined}
              >
                {rowContent}
              </a>
            );
          })}
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
