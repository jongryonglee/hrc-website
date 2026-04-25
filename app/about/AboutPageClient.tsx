"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
/** select の表示右端と filtertab.svg の間（flex gap） */
const FILTER_SELECT_ICON_GAP_PX = 6;

const filterClearBtnClass =
  "shrink-0 cursor-pointer bg-transparent p-0 text-white leading-[inherit] border-0 transition-opacity hover:opacity-65";

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
  clearSlot,
}: {
  id: string;
  value: string;
  onChange: (nextValue: string) => void;
  options: string[];
  ariaLabel: string;
  align: ProducedWorksFilterAlign;
  /** × 解除ボタン（`FilterClearButton` など）。トリガー直前に隙間なく並べる */
  clearSlot?: ReactNode;
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

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = `${id}-listbox`;
  const optionIds = useMemo(
    () => options.map((_, index) => `${id}-opt-${index}`),
    [id, options],
  );
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  const displayLabel = value === "" ? "All" : value;
  const openMenu = useCallback(() => setIsOpen(true), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div ref={rootRef} className="relative w-full min-w-0 max-w-full touch-manipulation">
      <div className={`flex max-w-full items-center ${wrapJustify}`}>
        <div className="inline-flex max-w-full min-w-0 shrink-0 items-center gap-0">
          {clearSlot}
          <div
            className="inline-flex max-w-full min-w-0 shrink-0 items-center"
            style={{ gap: FILTER_SELECT_ICON_GAP_PX }}
          >
            <button
              ref={triggerRef}
              type="button"
              id={id}
              onClick={toggleMenu}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openMenu();
                }
              }}
              aria-label={ariaLabel}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-expanded={isOpen}
              className={`inline-flex max-w-full min-w-0 w-fit cursor-pointer border-0 bg-transparent py-0 pl-[4px] pr-[2px] font-normal text-[inherit] leading-[1.1] antialiased ${textAlign}`}
            >
              <span className="min-w-0 truncate">{displayLabel}</span>
            </button>
            <span
              className="inline-flex shrink-0 cursor-pointer translate-y-[1px] select-none leading-none [-webkit-tap-highlight-color:transparent]"
              aria-hidden
              onPointerDown={(e) => {
                e.preventDefault();
                setIsOpen((prev) => !prev);
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
          </div>
        </div>
      </div>
      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 top-[calc(100%+8px)] z-30 w-full min-w-0 border border-white/20 bg-black py-[4px] text-white`}
        >
          {options.map((o, index) => (
            <li key={o} role="option" aria-selected={value === o}>
              <button
                id={optionIds[index]}
                type="button"
                className={`w-full cursor-pointer bg-transparent px-[8px] py-[4px] ${textAlign} transition-colors hover:bg-white/10`}
                onClick={() => {
                  onChange(o);
                  setIsOpen(false);
                }}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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
          <div className="col-span-7 md:col-span-5 [grid-row:span_1] min-w-0 text-right">
            <ProducedWorksFilterSelect
              id={labelFilterSelectId}
              align="end"
              value={labelFilter}
              onChange={setLabelFilter}
              options={labelOptions}
              ariaLabel="レーベルで絞り込み"
              clearSlot={
                <FilterClearButton
                  active={Boolean(labelFilter)}
                  onClear={() => setLabelFilter("")}
                  ariaLabel="レーベルの絞り込みを解除"
                />
              }
            />
          </div>
          <div className="col-span-3 md:col-span-3 [grid-row:span_1] min-w-0 text-left">
            <ProducedWorksFilterSelect
              id={artistFilterSelectId}
              align="start"
              value={artistFilter}
              onChange={setArtistFilter}
              options={artistOptions}
              ariaLabel="アーティストで絞り込み"
              clearSlot={
                <FilterClearButton
                  active={Boolean(artistFilter)}
                  onClear={() => setArtistFilter("")}
                  ariaLabel="アーティストの絞り込みを解除"
                />
              }
            />
          </div>
          <div className="col-span-4 md:col-span-3 [grid-row:span_1] min-w-0 text-left md:text-right">
            <ProducedWorksFilterSelect
              id={roleFilterSelectId}
              align="startMdEnd"
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleOptions}
              ariaLabel="ロールで絞り込み"
              clearSlot={
                <FilterClearButton
                  active={Boolean(roleFilter)}
                  onClear={() => setRoleFilter("")}
                  ariaLabel="ロールの絞り込みを解除"
                />
              }
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
