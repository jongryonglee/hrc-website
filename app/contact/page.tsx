"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

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
  subject: "",
  message: "",
};

const subjectOptions = [
  { value: "", label: "選択してください" },
  { value: "project", label: "制作依頼" },
  { value: "consulting", label: "ご相談" },
  { value: "press", label: "取材・メディア" },
  { value: "other", label: "その他" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const updateField = (key: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (values: ContactFormState) => {
    const nextErrors: ContactFormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "お名前を入力してください。";
    }

    if (!values.email.trim()) {
      nextErrors.email = "メールアドレスを入力してください。";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "メールアドレスの形式が正しくありません。";
    }

    if (!values.subject) {
      nextErrors.subject = "お問い合わせ内容を選択してください。";
    }

    if (!values.message.trim()) {
      nextErrors.message = "お問い合わせ内容を入力してください。";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialState);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <section>
        <div className="layout-grid">
          <div className="grid-full [grid-row:span_5]">
            <h1>(Contact)</h1>
          </div>
          <div className="flex flex-row items-start gap-x-[17px] mt-[30px] md:mt-[0px]">
          <div className="flex-4 md:flex-5 space-y-[15px] md:space-y-[34px]">出演の依頼やコラボの相談等は、<br  />
          こちらのフォームからご連絡ください。</div>
          </div>
        </div>
      </section>

      <section className="mt-[34px]">
        <div className="layout-grid">
          <div className="col-span-9 md:col-span-12 md:col-start-4">
            {isSubmitted ? (
              <div className="space-y-[17px] md:space-y-[24px]">
                <div className="space-y-[8px]">
                  <p>送信が完了しました。</p>
                  <p>お問い合わせありがとうございます。内容を確認のうえご連絡いたします。</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <span>フォームに戻る</span>
                  <Image src="/arrow-right.svg" alt="" width={11} height={11} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-[20px] md:space-y-[24px]">
                {hasErrors && (
                  <p className="text-[12px] text-red-600">
                    入力内容をご確認ください。
                  </p>
                )}

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-name" className="w-[90px] shrink-0">
                    Name
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-name"
                      name="name"
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      className={`w-full border-b bg-transparent outline-none ${
                        errors.name ? "border-red-500 text-red-600" : "border-current"
                      }`}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="mt-[6px] text-[12px] text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-company" className="w-[90px] shrink-0">
                    Company
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-company"
                      name="company"
                      value={form.company}
                      onChange={(event) => updateField("company", event.target.value)}
                      className="w-full border-b border-current bg-transparent outline-none"
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-email" className="w-[90px] shrink-0">
                    Email
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className={`w-full border-b bg-transparent outline-none ${
                        errors.email ? "border-red-500 text-red-600" : "border-current"
                      }`}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="mt-[6px] text-[12px] text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-phone" className="w-[90px] shrink-0">
                    Phone
                  </label>
                  <div className="flex-1">
                    <input
                      id="contact-phone"
                      name="phone"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      className="w-full border-b border-current bg-transparent outline-none"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-subject" className="w-[90px] shrink-0">
                    Subject
                  </label>
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={(event) => updateField("subject", event.target.value)}
                        className={`w-full border-b bg-transparent outline-none ${
                          errors.subject ? "border-red-500 text-red-600" : "border-current"
                        }`}
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.subject && (
                      <p id="contact-subject-error" className="mt-[6px] text-[12px] text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-x-[17px]">
                  <label htmlFor="contact-message" className="w-[90px] shrink-0">
                    Message
                  </label>
                  <div className="flex-1">
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={(event) => updateField("message", event.target.value)}
                      rows={5}
                      className={`w-full border-b bg-transparent outline-none ${
                        errors.message ? "border-red-500 text-red-600" : "border-current"
                      }`}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="contact-message-error" className="mt-[6px] text-[12px] text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity disabled:opacity-40"
                  >
                    <span>{isSubmitting ? "送信中..." : "送信"}</span>
                    <Image src="/arrow-right.svg" alt="" width={11} height={11} />
                  </button>
                </div>
              </form>
            )}
          </div>
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
