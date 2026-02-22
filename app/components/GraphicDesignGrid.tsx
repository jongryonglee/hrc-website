import Image from "next/image";

type GraphicDesignGridProps = {
  // TODO: プロップスの型を定義
};

type GridItem = {
  image: string;
  title: string;
  alt: string;
};

export const GraphicDesignGrid = (_props?: GraphicDesignGridProps) => {
  // Figmaデザインに基づく画像データ（2行×5列 = 10個）
  const gridItems: GridItem[] = [
    { image: "/images/graphic-302.png", title: "mono-hi\nvol.12", alt: "mono-hi vol.12" },
    { image: "/images/graphic-289.png", title: "Deey & Leo Iwamura「Deep Blue」\nOVERFALL「旋回」\nDouble Release Party", alt: "Deey & Leo Iwamura Deep Blue OVERFALL Double Release Party" },
    { image: "/images/graphic-286.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-246.png", title: "Spoil Me", alt: "Spoil Me" },
    { image: "/images/graphic-290.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-282.png", title: "mono-hi\nvol.12", alt: "mono-hi vol.12" },
    { image: "/images/graphic-IMG_4843-6deb48.png", title: "Latte Trip", alt: "Latte Trip" },
    { image: "/images/graphic-288.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-296.png", title: "YENTOTHB Tokyo - Bangkok\nHip-Hop Connection", alt: "YENTOTHB Tokyo - Bangkok Hip-Hop Connection" },
    { image: "/images/graphic-291.png", title: "FACTORY", alt: "FACTORY" },
    { image: "/images/graphic-302.png", title: "mono-hi\nvol.12", alt: "mono-hi vol.12" },
    { image: "/images/graphic-289.png", title: "Deey & Leo Iwamura「Deep Blue」\nOVERFALL「旋回」\nDouble Release Party", alt: "Deey & Leo Iwamura Deep Blue OVERFALL Double Release Party" },
    { image: "/images/graphic-286.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-246.png", title: "Spoil Me", alt: "Spoil Me" },
    { image: "/images/graphic-290.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-282.png", title: "mono-hi\nvol.12", alt: "mono-hi vol.12" },
    { image: "/images/graphic-IMG_4843-6deb48.png", title: "Latte Trip", alt: "Latte Trip" },
    { image: "/images/graphic-288.png", title: "mono-hi\nvol.10", alt: "mono-hi vol.10" },
    { image: "/images/graphic-296.png", title: "YENTOTHB Tokyo - Bangkok\nHip-Hop Connection", alt: "YENTOTHB Tokyo - Bangkok Hip-Hop Connection" },
    { image: "/images/graphic-291.png", title: "FACTORY", alt: "FACTORY" },
  ];

  return (
    <section className="mb-[0px]">
          <div className="grid grid-cols-2 gap-x-[17px] md:grid-cols-5 md:gap-x-[17px] [grid-auto-rows:17px] h-full">
            {gridItems.map((item, i) => (
              <div key={i} className="relative [grid-row:span_12] md:[grid-row:span_16] flex items-center justify-center">
              <div className="absolute left-0 top-0 text-white whitespace-pre-line">
                  {item.title}
                </div>
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={135}
                  height={135}
                  className="h-[80px] w-[80px] object-contain md:h-[135px] md:w-[135px]"
                  sizes="(max-width: 767px) 80px, 135px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
    </section>
  );
};
