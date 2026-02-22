const cols = Array.from({ length: 18 }, (_, i) => i + 1);

export default function TestPage() {
  return (
    <>
      <div className="-m-[17px] h-screen w-screen">
        <div className="layout-grid h-full">
          {cols.map((col) => (
            <div
              key={col}
              className="flex items-center justify-center border border-white/30 text-[10px]"
            >
              {col}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
