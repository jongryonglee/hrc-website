"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrambleText } from "../components/ScrambleText";
import { client, hasProjectId } from "@/sanity/lib/client";
import { PRODUCED_WORK_ITEMS_QUERY } from "@/sanity/lib/queries";
import { useEffect, useState } from "react";

type ProducedWorkItem = {
  _id: string;
  title: string;
  label: string;
  artist: string;
  role: string;
  date: string;
};

export default function AboutPage() {
  const [producedWorks, setProducedWorks] = useState<ProducedWorkItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasProjectId || !client) {
      setProducedWorks([
        {
          _id: "produced-work-placeholder-1",
          title: "Unpaused / Vela",
          label: "ABCDEF Label",
          artist: "theeluu",
          role: "Mix, Mastering",
          date: "2025/10/17",
        },
      ]);
      return;
    }

    let isMounted = true;
    client
      .fetch(PRODUCED_WORK_ITEMS_QUERY)
      .then((data) => {
        if (isMounted) setProducedWorks(data as ProducedWorkItem[]);
      })
      .catch(() => {
        if (isMounted) setProducedWorks([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-col flex-1">
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
                    src="/images/about-hero.png"
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
                          className="inline-flex items-center gap-1 w-fit"
                        >
                          <span className="whitespace-nowrap">
                            <ScrambleText
                              text="Google Map"
                              mode="lap"
                              speedMs={40}
                              durationMs={400}
                            />
                          </span>
                          <Image src="/icon-map.svg" alt="" width={9} height={9} />
                        </a>
                      </p>
                    </div>

                    <div className="flex items-start gap-x-[10px] md:gap-x-[17px]">
                      <p className="w-[80px] shrink-0">Contact</p>
                      <div className="flex flex-1 flex-col items-start">
                        <Link href="mailto:contact@hrc.com" className="flex items-center gap-1 w-fit">
                          <ScrambleText
                            text="mail"
                            mode="lap"
                            speedMs={40}
                            durationMs={400}
                          />
                          <Image src="/icon-map.svg" alt="" width={9} height={9} />
                        </Link>
                        <a
                          href="https://twitter.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 w-fit"
                        >
                          <ScrambleText text="X" mode="lap" speedMs={40} durationMs={400} />
                          <Image src="/icon-map.svg" alt="" width={9} height={9} />
                        </a>
                        <a
                          href="https://www.instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 w-fit"
                        >
                          <ScrambleText
                            text="instagram"
                            mode="lap"
                            speedMs={40}
                            durationMs={400}
                          />
                          <Image src="/icon-map.svg" alt="" width={9} height={9} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-[60px] md:mt-[68px]">
          <div className="layout-grid">
            <div className="col-start-3 md:[grid-row:span_2] whitespace-nowrap">
              <p>(produced works)</p>
            </div>
          </div>

          <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-nowrap">
            {producedWorks.map((work) => (
              <div
                key={work._id}
                className="group/row contents"
                onMouseEnter={() => setHoveredId(work._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="col-span-6 md:col-span-4 [grid-row:span_1]">
                  <ScrambleText
                    text={work.title}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hoveredId === work._id}
                  />
                </div>
                <div className="col-span-3 md:col-span-2 [grid-row:span_1] text-right">
                  <ScrambleText
                    text={work.label}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hoveredId === work._id}
                  />
                </div>
                <div className="hidden md:block md:col-span-3 md:[grid-row:span_1]" />
                <div className="col-span-3 md:col-span-2 [grid-row:span_1]">
                  <ScrambleText
                    text={work.artist}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hoveredId === work._id}
                  />
                </div>
                <div className="col-span-3 md:col-span-2 [grid-row:span_1] md:text-right">
                  <ScrambleText
                    text={work.role}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hoveredId === work._id}
                  />
                </div>
                <div className="col-span-3 md:col-span-5 [grid-row:span_1] text-right relative overflow-visible">
                  <ScrambleText
                    text={work.date}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hoveredId === work._id}
                  />
                  <div className="pointer-events-none absolute left-1/2 bottom-0 h-px w-[200vw] -translate-x-1/2 bg-white/0 transition-colors group-hover/row:bg-white/70" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="layout-grid">
            <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]"/>
          </div>
        </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
