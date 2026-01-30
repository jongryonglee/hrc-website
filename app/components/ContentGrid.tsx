import Image from "next/image";

export type GridItem = {
  image: string;
  title: string;
  subtitle?: string;
};

type ContentGridProps = {
  items: GridItem[];
  showMask?: boolean;
  imageClassName?: string;
  rounded?: boolean;
};

export const ContentGrid = ({
  items,
  showMask = false,
  imageClassName = "object-cover",
  rounded = false,
}: ContentGridProps) => {
  return (
    <section className="mb-[0px]">
      {/* ここはGridのデザインの範囲外 */}
      <div className="grid grid-cols-2 gap-[17px] md:grid-cols-5 md:gap-[17px]">
        {items.map((item, i) => (
          <div key={i} className="flex w-full flex-col">
            <div
              className={`relative aspect-[268/204] w-full overflow-hidden ${
                rounded ? "rounded-[12px]" : ""
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className={imageClassName}
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 25vw, 45vw"
                priority={i < 4}
                unoptimized={false}
              />
              {/* 黒い縁のマスクを上に重ねる（コンテナより少し大きくして画像のはみ出しを隠す） */}
              {showMask && (
                <Image
                  src="/works-mask.svg"
                  alt=""
                  aria-hidden="true"
                  fill
                  className="pointer-events-none select-none scale-[1.017]"
                  unoptimized
                />
              )}
            </div>
            <div className={`space-y-0.5 text-[15px] leading-[1.1] ${rounded ? "mt-1" : ""}`}>
              <p>{item.title}</p>
              {item.subtitle && (
                <p className="text-[13px]">{item.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
