import Link from "next/link";
import Image from "next/image";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mt-[17px]">
          <div className="layout-grid">
            <div className="grid-full [grid-row:span_1] md:[grid-row:span_1]">404 not found.</div>
            <div className="grid-full [grid-row:span_2] md:[grid-row:span_2]">Have a nice day.</div>
            <div className="grid-full [grid-row:span_1] md:[grid-row:span_1]">
              <Link href="/" className="flex w-fit items-center hover:opacity-70 transition-opacity">
                <Image src="/arrow-right.svg" alt="" width={17} height={17} />
                <span>Back to top</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
