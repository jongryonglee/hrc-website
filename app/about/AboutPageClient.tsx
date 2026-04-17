"use client";

import type { ChangeEvent } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProducedWorkItem } from "@/app/lib/cmsTypes";
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

/** role 欄の空白区切り（連続空白は1つにまとめる） */
function splitRoleTokens(role: string): string[] {
  return role.trim().split(/\s+/).filter(Boolean);
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
/** select の表示右端と filtertab.svg の間（flex gap） */
const FILTER_SELECT_ICON_GAP_PX = 6;

const filterClearBtnClass =
  "shrink-0 cursor-pointer bg-transparent p-0 text-[inherit] leading-[inherit] border-0 opacity-55 transition-opacity hover:opacity-100";

function FilterClearButton({
  active,
  onClear,
  ariaLabel,
}: {
  active: boolean;
  onClear: () => void;
  ariaLabel: string;
}) {
  if (!active) return null;
  return (
    <button
      type="button"
      onClick={onClear}
      className={filterClearBtnClass}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
}

type ProducedWorksFilterAlign = "start" | "end" | "startMdEnd";

/** produced works 見出し行: All + filtertab.svg + オプション絞り込み */
function ProducedWorksFilterSelect({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  align,
}: {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  ariaLabel: string;
  align: ProducedWorksFilterAlign;
}) {
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

  /**
   * アイコンは select の外側に flex で並べる（select 内の padding-right に頼らない）。
   * 幅は選択テキスト分だけに近づけ、最長 option 幅に引き伸ばされないようにする。
   */
  const displayLabel = value === "" ? "All" : value;
  const chCount = Math.max(displayLabel.length + 1, 3);
  const selectStyle = {
    maxWidth: "100%" as const,
    width: `min(100%, calc(${chCount}ch + 8px))`,
    paddingRight: 2,
    fieldSizing: "content" as const,
  };

  const selectRef = useRef<HTMLSelectElement>(null);
  const openSelectMenu = useCallback(() => {
    const el = selectRef.current;
    if (!el) return;
    el.focus();
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* 非対応・ユーザー操作外など */
      }
    }
    el.click();
  }, []);

  return (
    <label
      className={`inline-flex min-w-0 max-w-full shrink cursor-pointer touch-manipulation items-center ${wrapJustify}`}
      style={{ gap: FILTER_SELECT_ICON_GAP_PX }}
    >
      <select
        ref={selectRef}
        id={id}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`max-w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-[4px] pr-[2px] font-normal text-[inherit] leading-[1.1] antialiased ${textAlign}`}
        style={selectStyle}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        className="inline-flex shrink-0 cursor-pointer translate-y-[1px] select-none leading-none [-webkit-tap-highlight-color:transparent]"
        aria-hidden
        onPointerDown={(e) => {
          e.preventDefault();
          openSelectMenu();
        }}
      >
        <Image
          src="/icon/filtertab.svg"
          alt=""
          width={FILTER_TAB_HEADER_PX}
          height={FILTER_TAB_HEADER_PX}
          className="pointer-events-none shrink-0"
          draggable={false}
        />
      </span>
    </label>
  );
}

export function AboutPageClient({ initialProducedWorks }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [titleSort, setTitleSort] = useState<ProducedWorksSort>(null);
  const [dateSort, setDateSort] = useState<ProducedWorksSort>(null);

  const labelFilterSelectId = useId();
  const artistFilterSelectId = useId();
  const roleFilterSelectId = useId();

  const orderIndex = useMemo(
    () => new Map(initialProducedWorks.map((w, i) => [w._id, i])),
    [initialProducedWorks],
  );

  const labelOptions = useMemo(
    () => uniqSorted(initialProducedWorks.map((w) => w.label)),
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
      if (labelFilter && w.label !== labelFilter) return false;
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
    labelFilter,
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
          <div className="col-span-7 md:col-span-3 [grid-row:span_1] min-w-0 text-right">
            <div className="flex w-full min-w-0 items-center justify-end gap-x-[4px]">
              <FilterClearButton
                active={Boolean(labelFilter)}
                onClear={() => setLabelFilter("")}
                ariaLabel="レーベルの絞り込みを解除"
              />
              <ProducedWorksFilterSelect
                id={labelFilterSelectId}
                align="end"
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                options={labelOptions}
                ariaLabel="レーベルで絞り込み"
              />
            </div>
          </div>
          <div
            className="max-md:hidden md:col-span-2 [grid-row:span_1]"
            aria-hidden
          />
          <div className="col-span-3 md:col-span-3 [grid-row:span_1] min-w-0 text-left">
            <div className="flex w-full min-w-0 items-center justify-start gap-x-[4px]">
              <FilterClearButton
                active={Boolean(artistFilter)}
                onClear={() => setArtistFilter("")}
                ariaLabel="アーティストの絞り込みを解除"
              />
              <ProducedWorksFilterSelect
                id={artistFilterSelectId}
                align="start"
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                options={artistOptions}
                ariaLabel="アーティストで絞り込み"
              />
            </div>
          </div>
          <div className="col-span-4 md:col-span-3 [grid-row:span_1] min-w-0 text-left md:text-right">
            <div className="flex w-full min-w-0 items-center justify-start md:justify-end gap-x-[4px]">
              <FilterClearButton
                active={Boolean(roleFilter)}
                onClear={() => setRoleFilter("")}
                ariaLabel="ロールの絞り込みを解除"
              />
              <ProducedWorksFilterSelect
                id={roleFilterSelectId}
                align="startMdEnd"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={roleOptions}
                ariaLabel="ロールで絞り込み"
              />
            </div>
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
                <div className="col-span-7 md:col-span-3 [grid-row:span_1] text-right">
                  <ScrambleText
                    text={work.label}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={isActive}
                  />
                </div>
                <div
                  className="max-md:hidden md:col-span-2 [grid-row:span_1]"
                  aria-hidden
                />
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
