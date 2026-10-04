import { ShieldIcon, SparkleIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";

const VALUES = [
  { Icon: SparkleIcon, title: "Curated with care", body: "Every piece is chosen for quality, comfort and style." },
  { Icon: WhatsAppIcon, title: "Personal service", body: "Real people helping you choose sizes, colours and more." },
  { Icon: ShieldIcon, title: "No online payment", body: "Nothing to enter on the website. Pay only once we confirm." },
  { Icon: TruckIcon, title: "Delivery arranged", body: "We agree the delivery fee and time with you directly." },
];

export function StoreValues() {
  return (
    <section className="container-page py-14 sm:py-20">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ Icon, title, body }) => (
          <li key={title} className="card p-6">
            <span className="grid size-11 place-items-center rounded-full bg-blush-100 text-coral-600">
              <Icon size={22} />
            </span>
            <h2 className="mt-4 font-semibold text-navy-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
