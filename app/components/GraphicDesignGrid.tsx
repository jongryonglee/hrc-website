import Image from "next/image";

type GridItem = {
  image: string;
  title: string;
  alt: string;
};

type GraphicDesignGridProps = {
  items: GridItem[];
};

export const GraphicDesignGrid = ({ items }: GraphicDesignGridProps) => {
  // Figmaデザインに基づく画像データ（2行×5列 = 10個）
  return (
    <section className="mb-[0px]">
          <div className="grid grid-cols-2 gap-x-[17px] md:grid-cols-5 md:gap-x-[17px] [grid-auto-rows:17px] h-full">
            {items.map((item, i) => (
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
