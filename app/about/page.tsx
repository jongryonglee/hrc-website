import Image from "next/image";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LayoutGrid } from "../components/LayoutGrid";

const producedWorks = [
  {
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix, Mastering",
    date: "2025/10/17",
  },
  {
    title: "Deep Blue / Deey & Leo Iwamura",
    label: "損保生命",
    artist: "Leo Iwamura",
    role: "Beat",
    date: "2025/09/21",
  },
  {
    title: "ラムネサイダー / ASA Wu",
    label: "hrc Label",
    artist: "theeluu",
    role: "Beat, Mix, Mastering",
    date: "2025/09/14",
  },
  {
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix, Mastering",
    date: "2025/10/17",
  },
  {
    title: "Deep Blue / Deey & Leo Iwamura",
    label: "損保生命",
    artist: "Leo Iwamura",
    role: "Beat",
    date: "2025/09/21",
  },
  {
    title: "ラムネサイダー / ASA Wu",
    label: "hrc Label",
    artist: "theeluu",
    role: "Beat, Mix, Mastering",
    date: "2025/09/14",
  },
  {
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix, Mastering",
    date: "2025/10/17",
  },
  {
    title: "Deep Blue / Deey & Leo Iwamura",
    label: "損保生命",
    artist: "Leo Iwamura",
    role: "Beat",
    date: "2025/09/21",
  },
  {
    title: "ラムネサイダー / ASA Wu",
    label: "hrc Label",
    artist: "theeluu",
    role: "Beat, Mix, Mastering",
    date: "2025/09/14",
  },
  {
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix, Mastering",
    date: "2025/10/17",
  },
  {
    title: "Deep Blue / Deey & Leo Iwamura",
    label: "損保生命",
    artist: "Leo Iwamura",
    role: "Beat",
    date: "2025/09/21",
  },
  {
    title: "ラムネサイダー / ASA Wu",
    label: "hrc Label",
    artist: "theeluu",
    role: "Beat, Mix, Mastering",
    date: "2025/09/14",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px]">
        <Header />

        <section>
          <LayoutGrid className="items-start">
            <div className="md:col-span-6">
              <h1>(About)</h1>
            </div>

            <div className="md:col-span-2 md:col-start-1 md:row-start-5">
              <p>Music Label</p>
              <p>Based in Tokyo</p>
            </div>

            <div className="md:col-span-4 md:col-start-11 md:[grid-row:span_10]">
              <Image
                src="/images/about-hero.png"
                alt=""
                width={284}
                height={159}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

<div className="md:col-span-4 md:col-start-15 md:[grid-row:span_16] space-y-[34px]">
<div>
              <p>
                hrcは世田谷・羽根木を中心に活動する音楽レーベルです。HIP
                HOPアーティストを中心として、楽曲プロデュースや自社スタジオによるレコーディング業務、所属アーティストのマネジメントなどを行っています。
              </p>
            </div>

            <div>
              <div className="grid grid-cols-4 gap-x-[17px]">
                <p className="md:col-span-1">Member</p>
                <p className="md:col-span-3">
                  takeisme / ASA Wu / minami / <br />
                  theeluu / Leo Iwamura
                </p>
              </div>

              <div className="grid grid-cols-4 gap-x-[17px]">
                <p className="md:col-span-1">Location</p>
                <p className="md:col-span-3">
                  201 Juno Hanegi Koen,
                  <br />
                  6-9-17 Matsubara, Setagaya-ku,
                  <br />
                  Tokyo 156-0043
                  <br />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=201+Juno+Hanegi+Koen,6-9-17+Matsubara,+Setagaya-ku,+Tokyo+156-0043"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border-b border-white/80 pb-[1px] hover:opacity-70 transition-opacity w-fit"
                  >
                    <span>Google Map</span>
                    <Image src="/icon-map.svg" alt="" width={9} height={9} />
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-4 gap-x-[17px]">
                <p className="md:col-span-1">Contact</p>
                <div className="md:col-span-3 flex flex-col items-start">
                  <Link
                    href="mailto:contact@hrc.com"
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity w-fit"
                  >
                    <span>mail</span>
                    <Image src="/icon-map.svg" alt="" width={9} height={9} />
                  </Link>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity w-fit"
                  >
                    <span>X</span>
                    <Image src="/icon-map.svg" alt="" width={9} height={9} />
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity w-fit"
                  >
                    <span>instagram</span>
                    <Image src="/icon-map.svg" alt="" width={9} height={9} />
                  </a>
                </div>
              </div>
            </div>
</div>


            <div className="md:col-span-18 md:[grid-row:span_12]" />

          </LayoutGrid>
        </section>

        <section className="mt-[68px]">
          <LayoutGrid>
            <div className="md:col-span-18 md:col-start-3 md:[grid-row:span_2]">
              <p>(produced works)</p>
            </div>
          </LayoutGrid>

          <LayoutGrid className="mt-[17px]">
            {producedWorks.map((work, index) => (
              <div key={`${work.title}-${work.date}-${index}`} className="contents">
                <div className="md:col-span-4 md:[grid-row:span_1]">
                  {work.title}
                </div>
                <div className="md:col-span-2 md:[grid-row:span_1] text-right">
                  {work.label}
                </div>
                <div className="md:col-span-3 md:[grid-row:span_1]" />
                <div className="md:col-span-2 md:[grid-row:span_1]">
                  {work.artist}
                </div>
                <div className="md:col-span-2 md:[grid-row:span_1] text-right">
                  {work.role}
                </div>
                <div className="md:col-span-5 md:[grid-row:span_1] text-right">
                  {work.date}
                </div>
              </div>
            ))}
          </LayoutGrid>
        </section>

        <section>
          <LayoutGrid>
            <div className="md:col-span-18 md:[grid-row:span_11]" />
          </LayoutGrid>
        </section>

        <Footer />
      </main>
    </div>
  );
}
