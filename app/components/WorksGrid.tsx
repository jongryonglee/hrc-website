import Image from "next/image";
import { LayoutGrid } from "./LayoutGrid";

const worksImages = [
  "/images/works-1.gif",
  "/images/works-2.png",
  "/images/works-3.png",
  "/images/works-4.png",
  "/images/works-5.png",
  "/images/works-6.png",
  "/images/works-7.png",
  "/images/works-8.png",
];

export const WorksGrid = () => {
  return (
    <section className="mb-[0px]">
        {/* ここはGridのデザインの範囲外 */}
      <div className="grid grid-cols-2 gap-[17px] md:grid-cols-5 md:gap-[17px]">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex w-full flex-col">
            <div className="relative aspect-[268/204] w-full overflow-hidden">
              <Image
                src={worksImages[i % worksImages.length]}
                alt="Work thumbnail"
                fill
                className="object-cover scale-[1.05]"
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 25vw, 45vw"
                priority={i < 4}
                unoptimized={false}
              />
              {/* 黒い縁のマスクを上に重ねる（コンテナより少し大きくして画像のはみ出しを隠す） */}
              <Image
                src="/works-mask.svg"
                alt=""
                aria-hidden="true"
                fill
                className="pointer-events-none select-none scale-[1.017]"
                unoptimized
              />
            </div>
            <div className="space-y-0.5 text-[15px] leading-[1.1]">
              <p>Saiwai / takeisme</p>
              <p className="text-[13px]">03:24 - Prod.theeluu</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

