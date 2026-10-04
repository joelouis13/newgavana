import { BagIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";

const STEPS = [
  {
    Icon: BagIcon,
    title: "Pick your favourites",
    body: "Add items to your cart, or tap Buy on WhatsApp on any single product.",
  },
  {
    Icon: WhatsAppIcon,
    title: "Send your order on WhatsApp",
    body: "We prepare one neat message with every item, size and price — just press send.",
  },
  {
    Icon: TruckIcon,
    title: "Confirm & receive",
    body: "We confirm availability, your delivery fee and payment with you directly in the chat.",
  },
];

export function HowItWorks({ storeName }: { storeName: string }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page">
        <div className="overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-coral-400 uppercase">
              How ordering works
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Shop here, order on WhatsApp.</h2>
            <p className="mt-3 text-white/70">
              {storeName} doesn&apos;t take online payments. There&apos;s no card form and no checkout fees —
              just a friendly conversation with our team.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-coral-500 text-white">
                    <Icon size={22} />
                  </span>
                  <span className="font-display text-3xl text-white/25 italic">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-white/70">
            <ShieldIcon size={18} className="text-coral-400" />
            Payment and order confirmation are handled directly through WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
