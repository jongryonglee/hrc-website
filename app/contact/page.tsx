"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

type ContactFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

const initialState: ContactFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  subject: "performance",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [formState, setFormState] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ContactFormErrors = {};

    if (!formState.subject) {
      nextErrors.subject = "required";
    }
    if (!formState.name.trim()) {
      nextErrors.name = "required";
    }
    if (!formState.email.trim()) {
      nextErrors.email = "required";
    } else if (!emailPattern.test(formState.email)) {
      nextErrors.email = "format";
    }
    if (!formState.message.trim()) {
      nextErrors.message = "required";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setIsSubmitted(true);
  };

  const getInputClass = (hasError: boolean) =>
    [
      "w-full bg-transparent border-b pb-[1px] focus:outline-none",
      hasError ? "border-red-500 focus:border-red-500" : "border-white/70 focus:border-white",
    ].join(" ");

  return (
    <div className="flex min-h-full flex-col flex-1">
      <Header />

      <section>
        <div className="layout-grid">
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Contact)</h1>
          </div>

          {isSubmitted ? (
            <div className="grid-full mt-[0px] md:mt-[0px]">
              <p>Thank you!</p>
              <p>内容を確認のうえ、追って連絡させていただきます。</p>
              <Link href="/" className="flex w-fit items-center hover:opacity-70 transition-opacity mt-[15px] md:mt-[15px]">
                <Image src="/arrow-right.svg" alt="" width={17} height={17} />
                <span>Back to top</span>
              </Link>
            </div>

          ) : (
            <div className="grid-full mt-[0px] whitespace-nowrap">
              <div className="flex flex-col md:flex-row items-start gap-x-[10px] md:gap-x-[17px]">
                <div className="flex-4 md:flex-7 space-y-[15px] mb-[30px] md:mb-[0px] md:space-y-[34px]">
                  <p>出演の依頼やコラボの相談等は、<br />こちらのフォームからご連絡ください。</p>
                </div>
                <form
                  className="flex-1 md:flex-11 text-[14px] leading-[1.1] md:text-[15px] space-y-[15px] md:space-y-[17px] ml-[calc((100%-80px)/9)] md:ml-0"
                  onSubmit={handleSubmit}
                  noValidate
                >
                <div className="flex items-start gap-x-[10px] md:gap-x-[17px]">
                  <label className="w-[120px] shrink-0 text-right">
                    お問い合わせ種別
                    <span className={errors.subject ? "text-red-500" : "text-white"}>*</span>
                  </label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-x-[10px] md:gap-x-[17px] whitespace-nowrap">
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="performance"
                          className="peer sr-only"
                          checked={formState.subject === "performance"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        出演・音源使用のご依頼
                      </label>
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="collab"
                          className="peer sr-only"
                          checked={formState.subject === "collab"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        楽曲制作・コラボのご相談
                      </label>
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="press"
                          className="peer sr-only"
                          checked={formState.subject === "press"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        取材・メディア関連
                      </label>
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="business"
                          className="peer sr-only"
                          checked={formState.subject === "business"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        契約・ビジネス関連
                      </label>
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="event"
                          className="peer sr-only"
                          checked={formState.subject === "event"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        イベント・ライブ関連
                      </label>
                      <label className="flex w-full md:w-auto items-center gap-x-[6px]">
                        <input
                          type="radio"
                          name="subject"
                          value="other"
                          className="peer sr-only"
                          checked={formState.subject === "other"}
                          onChange={handleChange}
                        />
                        <img
                          src="/icon/empty.svg"
                          alt=""
                          aria-hidden="true"
                          className="inline-block h-[17px] w-[17px] peer-checked:hidden"
                        />
                        <img
                          src="/icon/fulled.svg"
                          alt=""
                          aria-hidden="true"
                          className="hidden h-[17px] w-[17px] peer-checked:inline-block"
                        />
                        その他
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-x-[10px] md:gap-x-[17px]">
                  <label htmlFor="contact-name" className="w-[120px] shrink-0 text-right">
                    お名前
                    <span className={errors.name ? "text-red-500" : "text-white"}>*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-name"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      className={getInputClass(Boolean(errors.name))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-x-[10px] md:gap-x-[17px]">
                  <label htmlFor="contact-company" className="w-[120px] shrink-0 text-right">
                    会社名/団体
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-company"
                      name="company"
                      value={formState.company}
                      onChange={handleChange}
                      className={getInputClass(Boolean(errors.company))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-x-[10px] md:gap-x-[17px]">
                  <label htmlFor="contact-email" className="w-[120px] shrink-0 text-right">
                    メールアドレス
                    <span className={errors.email ? "text-red-500" : "text-white"}>*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      className={getInputClass(Boolean(errors.email))}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-x-[10px] md:gap-x-[17px] mb-[30px] md:mb-[34px]">
                  <label htmlFor="contact-message" className="w-[120px] shrink-0 text-right">
                    お問い合わせ内容
                    <span className={errors.message ? "text-red-500" : "text-white"}>*</span>
                  </label>
                  <div className="flex-1">
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={3}
                      value={formState.message}
                      onChange={handleChange}
                      className={[
                        "w-full min-h-[180px] md:min-h-[255px] bg-transparent border-b pb-[1px] focus:outline-none resize-none",
                        errors.message
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/70 focus:border-white",
                      ].join(" ")}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-x-[10px] md:gap-x-[17px]">
                  <div className="w-[120px] shrink-0" />
                  <div className="flex-1 pb-[1px]">
                    <button
                      type="submit"
                      className="text-white hover:text-white transition-colors"
                    >
                      <p>→送信する</p>
                    </button>
                  </div>
                </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

    

      <section className="mt-[68px]">
        <div className="layout-grid">
          <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]" />
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
