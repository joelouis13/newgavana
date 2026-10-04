import type { SVGProps } from "react";
import { BagIcon, SparkleIcon, TagIcon } from "@/components/icons";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const CorsetIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3c1.6 3 1.6 6 0 9s-1.6 6 0 9h10c-1.6-3-1.6-6 0-9s-1.6-6 0-9H7Z" />
    <path d="M12 3v18M10 7l4 2M14 7l-4 2M10 12l4 2M14 12l-4 2M10 16.5l4 2M14 16.5l-4 2" />
  </Svg>
);
const BraIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 4 8 9.5M17.5 4 16 9.5" />
    <path d="M3 10c0 3.5 2.5 6 5.5 6 1.6 0 2.8-.9 3.5-2.2.7 1.3 1.9 2.2 3.5 2.2 3 0 5.5-2.5 5.5-6-1.5-.6-3.4-.8-5.5 0-1.4.6-2.6 1.6-3.5 3-.9-1.4-2.1-2.4-3.5-3-2.1-.8-4-.6-5.5 0Z" />
  </Svg>
);
const PantyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18l-.8 3.5c-3 .8-5.4 4-6.2 8.5h-4c-.8-4.5-3.2-7.7-6.2-8.5L3 6Z" />
    <path d="M3.6 8.5h16.8" />
  </Svg>
);
const DumbbellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
  </Svg>
);
const MoonIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    <path d="M17 3.5v3M15.5 5h3" />
  </Svg>
);
const DressIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 3 10 7.5h4L14.5 3" />
    <path d="M10 7.5 6 21h12L14 7.5" />
    <path d="M8.6 12.5h6.8" />
  </Svg>
);
const TopIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 4 4 6.5l1.8 4L8 9.6V20h8V9.6l2.2.9 1.8-4L15.5 4a3.5 3.5 0 0 1-7 0Z" />
  </Svg>
);
const TrousersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3h10l1.5 18h-4.2L12 10l-2.3 11H5.5L7 3Z" />
    <path d="M7 6.5h10" />
  </Svg>
);
const GemIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 4h11L21 9l-9 11L3 9l3.5-5Z" />
    <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
  </Svg>
);
const ShoeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 18v-7l3.5 1.5L10 16h8.5a2.5 2.5 0 0 1 2.5 2.5v.5H3V18Z" />
    <path d="M3 11c1.5-2 3-2.5 4-2.5M11 16l1.5-2.5M14 16l1.2-2" />
  </Svg>
);

type IconComponent = (p: IconProps) => React.ReactElement;

// Matched against the category slug/name, so categories added in the admin
// still get a fitting icon (e.g. "Handbags" → bag, "Sleepwear" → moon).
const RULES: [RegExp, IconComponent][] = [
  [/corset|shape|waist|trainer/, CorsetIcon],
  [/linger|bra\b|bralette/, BraIcon],
  [/pant(y|ies)|underwear|brief|thong/, PantyIcon],
  [/gym|sport|active|fitness|workout/, DumbbellIcon],
  [/night|sleep|lounge|pajama|pyjama|robe/, MoonIcon],
  [/bag|purse|tote|clutch|wallet/, BagIcon],
  [/dress|gown/, DressIcon],
  [/top|blouse|shirt|tee|crop/, TopIcon],
  [/bottom|trouser|pant\b|pants|jean|skirt|short|legging/, TrousersIcon],
  [/accessor|jewel|earring|necklace|bracelet|ring|watch/, GemIcon],
  [/shoe|heel|sandal|sneaker|slipper|footwear/, ShoeIcon],
  [/other|beauty|home|lifestyle|misc/, SparkleIcon],
];

export function CategoryIcon({ slug, name, size }: { slug: string; name: string; size?: number }) {
  const key = `${slug} ${name}`.toLowerCase();
  const Icon = RULES.find(([re]) => re.test(key))?.[1] ?? TagIcon;
  return <Icon size={size} />;
}
