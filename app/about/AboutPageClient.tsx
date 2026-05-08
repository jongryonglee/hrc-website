"use client";

import {
  useCallback,
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

/** Categories 固定キーが role 欄にマッチするか */
function roleFieldMatchesFixedFilter(role: string, filterKey: string): boolean {
  if (!filterKey) return true;
  const s = role.trim();
  if (!s) return false;
  const segments = s.includes(",")
    ? s.split(",").map((t) => t.trim()).filter(Boolean)
    : [s];
  return segments.some(
    (seg) =>
      seg === filterKey || splitRoleTokens(seg).includes(filterKey),
  );
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
  "shrink-0 cursor-pointer whitespace-nowrap bg-transparent p-0 font-normal text-[inherit] leading-[1.1] antialiased border-0 transition-opacity hover:opacity-65 inline-flex items-center gap-x-[3px]";

/** CMS に date が無い行の仮表示（YYYYMMDD） */
const PRODUCED_WORK_DATE_PLACEHOLDER = "2026/01/01";

/** produced works プロジェクト種別 UI 値 */
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

/** All / … のインライン切り替え（選択＝斜線・不透過、未選択＝薄色） */
function ProducedWorksSlashFilterRow({
  ariaLabel,
  value,
  options,
  onChange,
  justifyClassName,
  /** md 以上：キー単位で行を固定（2行目は先頭に ` / ` を付ける） */
  mdGroupedKeys,
}: {
  ariaLabel: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (key: string) => void;
  justifyClassName: string;
  mdGroupedKeys?: string[][];
}) {
  const pClass = `flex flex-wrap text-[inherit] leading-[1.1] ${justifyClassName}`;

  const slash = (
    <span aria-hidden className="opacity-45">
      {" "}
      /{" "}
    </span>
  );

  const optButton = (opt: { key: string; label: string }) => (
    <button
      type="button"
      onClick={() => onChange(opt.key)}
      className={`cursor-pointer border-0 bg-transparent p-0 font-normal text-[inherit] antialiased [-webkit-tap-highlight-color:transparent] ${
        value === opt.key
          ? "opacity-100 line-through"
          : "opacity-40 transition-opacity hover:opacity-65"
      }`}
      aria-pressed={value === opt.key}
    >
      {opt.label}
    </button>
  );

  const flatRow = (
    <p className={pClass}>
      {options.map((opt, i) => (
        <span key={opt.key} className="inline whitespace-nowrap">
          {i > 0 && slash}
          {optButton(opt)}
        </span>
      ))}
    </p>
  );

  if (!mdGroupedKeys?.length) {
    return (
      <div role="group" aria-label={ariaLabel}>
        {flatRow}
      </div>
    );
  }

  const keyToOpt = new Map(options.map((o) => [o.key, o]));

  const mdRows = mdGroupedKeys
    .map((keys) => keys.flatMap((k) => keyToOpt.get(k) ?? []))
    .filter((row) => row.length > 0);

  return (
    <div role="group" aria-label={ariaLabel}>
      <div className="md:hidden">{flatRow}</div>
      <div className="max-md:hidden space-y-[0.35em]">
        {mdRows.map((rowOpts, rowIdx) => (
          <p key={rowIdx} className={pClass}>
            {rowOpts.map((opt, i) => (
              <span key={opt.key} className="inline whitespace-nowrap">
                {(rowIdx > 0 || i > 0) && slash}
                {optButton(opt)}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

/** (Categories) 固定リスト — 3 行レイアウト、compact で 1 行に並べる */
function ProducedWorksFixedRoleCategoryFilter({
  value,
  onChange,
  justifyClassName,
  compact,
}: {
  value: string;
  onChange: (key: string) => void;
  justifyClassName: string;
  /** モバイル2列など：全ロールを1行（折り返し）に並べる */
  compact?: boolean;
}) {
  const optCls = (k: string) =>
    `cursor-pointer border-0 bg-transparent p-0 font-normal text-[inherit] antialiased [-webkit-tap-highlight-color:transparent] ${
      value === k
        ? "opacity-100 line-through"
        : "opacity-40 transition-opacity hover:opacity-65"
    }`;

  const slash = (
    <span aria-hidden className="opacity-45">
      {" "}
      /{" "}
    </span>
  );

  const row1 = [
    { key: "", label: "All" },
    { key: "Mix", label: "Mix" },
    { key: "Mastering", label: "Mastering" },
    { key: "Beat", label: "Beat" },
  ];
  const row2 = [
    { key: "Director", label: "Director" },
    { key: "Director of Photography", label: "Director of Photography" },
  ];
  const row3 = [
    { key: "Edit", label: "Edit" },
    { key: "Title Design", label: "Title Design" },
  ];
  const allOptions = row1.concat(row2, row3);

  if (compact) {
    return (
      <div role="group" aria-label="ロールで絞り込み" className="w-full">
        <p
          className={`flex flex-wrap text-[inherit] leading-[1.1] ${justifyClassName}`}
        >
          {allOptions.map((opt, i) => (
            <span key={opt.key || "__all__"} className="inline whitespace-nowrap">
              {i > 0 && slash}
              <button
                type="button"
                onClick={() => onChange(opt.key)}
                className={optCls(opt.key)}
                aria-pressed={value === opt.key}
              >
                {opt.label}
              </button>
            </span>
          ))}
        </p>
      </div>
    );
  }

  return (
    <div role="group" aria-label="ロールで絞り込み" className="w-full space-y-[0.35em]">
      <p
        className={`flex flex-wrap text-[inherit] leading-[1.35] ${justifyClassName}`}
      >
        {row1.map((opt, i) => (
          <span key={opt.key || "__all__"} className="inline whitespace-nowrap">
            {i > 0 && slash}
            <button
              type="button"
              onClick={() => onChange(opt.key)}
              className={optCls(opt.key)}
              aria-pressed={value === opt.key}
            >
              {opt.label}
            </button>
          </span>
        ))}
      </p>
      <p
        className={`flex flex-wrap text-[inherit] leading-[1.35] ${justifyClassName}`}
      >
        {row2.map((opt, i) => (
          <span key={opt.key} className="inline whitespace-nowrap">
            {i > 0 && slash}
            <button
              type="button"
              onClick={() => onChange(opt.key)}
              className={optCls(opt.key)}
              aria-pressed={value === opt.key}
            >
              {opt.label}
            </button>
          </span>
        ))}
      </p>
      <p
        className={`flex flex-wrap text-[inherit] leading-[1.35] ${justifyClassName}`}
      >
        {row3.map((opt, i) => (
          <span key={opt.key} className="inline whitespace-nowrap">
            {i > 0 && slash}
            <button
              type="button"
              onClick={() => onChange(opt.key)}
              className={optCls(opt.key)}
              aria-pressed={value === opt.key}
            >
              {opt.label}
            </button>
          </span>
        ))}
      </p>
    </div>
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

  const categorySlashOptions = useMemo(
    () =>
      PRODUCED_WORK_CATEGORY_CYCLE.map((key) => ({
        key,
        label: PRODUCED_WORK_CATEGORY_LABELS[key],
      })),
    [],
  );

  const artistSlashOptions = useMemo(
    () => [
      { key: "", label: "All" },
      ...artistOptions.map((a) => ({ key: a, label: a })),
    ],
    [artistOptions],
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

  const selectCategory = useCallback((key: string) => {
    const category = key as ProducedWorksCategoryFilterUi;
    setProducedWorksFilters((f) => {
      if (category !== "all") {
        return { category, artist: "", role: "" };
      }
      return { ...f, category: "all" };
    });
  }, []);

  const selectArtist = useCallback((artist: string) => {
    setProducedWorksFilters((f) => {
      if (artist !== "") {
        return { category: "all", artist, role: "" };
      }
      return { ...f, artist: "" };
    });
  }, []);

  const selectRole = useCallback((role: string) => {
    setProducedWorksFilters((f) => {
      if (role !== "") {
        return { category: "all", artist: "", role };
      }
      return { ...f, role: "" };
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
      if (
        roleFilter &&
        !roleFieldMatchesFixedFilter(w.role, roleFilter)
      ) {
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

      <div className="page-main-bottom-spacer">
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
              <div className="relative w-full min-w-0 flex-1 aspect-[284/159] overflow-hidden">
                <Image
                  src="/images/about-hero.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
              </div>

              <div className="w-full min-w-0 flex-1 space-y-[30px] md:space-y-[34px]">
                <div>
                  <p>
                    hrcは世田谷・羽根木を中心に活動する音楽レーベルです。HIP
                    HOPアーティストを中心として、楽曲プロデュースや自社スタジオによるレコーディング業務、所属アーティストのマネジメントなどを行っています。
                  </p>
                </div>

                <div className="">
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
        {/* モバイル：comps どおり (Clients)×ロール左寄せ、(Categories)×種別右寄せの2列のみ */}
        <div className="md:hidden">
          <div className="mt-[15px] grid grid-cols-2 gap-x-[10px] min-w-0">
            <div className="min-w-0 text-left">
              <p>(Clients)</p>
              <ProducedWorksFixedRoleCategoryFilter
                value={roleFilter}
                onChange={selectRole}
                justifyClassName="justify-start"
                compact
              />
            </div>
            <div className="min-w-0 flex flex-col items-end text-right">
              <p>(Categories)</p>
              <ProducedWorksSlashFilterRow
                ariaLabel="プロジェクト種別で絞り込み"
                value={categoryFilter}
                options={categorySlashOptions}
                onChange={selectCategory}
                justifyClassName="justify-end"
              />
            </div>
          </div>
        </div>

        <div className="max-md:hidden">
          <div className="layout-grid mt-[15px] md:mt-[17px] gap-y-[21px] md:gap-y-0">
            <div className="col-span-9 md:col-span-5 min-w-0 text-left">
              <p>(produced works)</p>
              <button
                type="button"
                className={`${sortFieldBtnBaseClass} flex-row items-center text-left`}
                aria-label="タイトル: ソートなし・昇順・降順を切り替え"
                aria-pressed={titleSort !== null}
                onClick={cycleTitleSort}
              >
                <ProducedWorksSortTabPair sort={titleSort} />
                <span>AtoZ</span>
              </button>
            </div>
            <div className="col-span-9 md:col-span-5 min-w-0 flex flex-col items-end text-right">
              <p>(Clients)</p>
              <ProducedWorksSlashFilterRow
                ariaLabel="プロジェクト種別で絞り込み"
                value={categoryFilter}
                options={categorySlashOptions}
                onChange={selectCategory}
                justifyClassName="justify-end"
                mdGroupedKeys={[
                  ["all", "commercial-projects"],
                  ["label-releases", "indie-projects"],
                ]}
              />
            </div>
            <div className="col-span-9 md:col-span-3 min-w-0 text-left">
              <p>(Sound Engineer)</p>
              <ProducedWorksSlashFilterRow
                ariaLabel="アーティストで絞り込み"
                value={artistFilter}
                options={artistSlashOptions}
                onChange={selectArtist}
                justifyClassName="justify-start"
              />
            </div>
            <div className="col-span-9 md:col-span-3 min-w-0 text-left md:text-right">
              <p>(Categories)</p>
              <ProducedWorksFixedRoleCategoryFilter
                value={roleFilter}
                onChange={selectRole}
                justifyClassName="justify-start md:justify-end"
              />
            </div>
            <div className="col-span-9 md:col-span-2 min-w-0 flex flex-col items-end text-right">
              <p>(Dates)</p>
              <button
                type="button"
                className={`${sortFieldBtnBaseClass} flex-row items-center justify-end text-right`}
                aria-label="日付: ソートなし・昇順・降順を切り替え"
                aria-pressed={dateSort !== null}
                onClick={cycleDateSort}
              >
                <ProducedWorksSortTabPair sort={dateSort} />
                <span>Newest</span>
              </button>
            </div>
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
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
