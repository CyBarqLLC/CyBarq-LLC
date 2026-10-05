import { Globe } from "@/components/brand/globe";
import { GlobeStatic } from "@/components/brand/globe-static";
import { Action } from "./action";
import { GlobeLabels, type GlobeLabelSlot } from "./globe-labels";

/** The globe on the night ground: the nearest marks brightest, the far side sinking into the dark. */
const NIGHT_RAMP = ["#A9DCF7", "#74C3F2", "#2E86CF", "#1B4F80"] as const;
const NIGHT_HAIR = "#24384B";

type HeroProps = {
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  /** What holds true wherever the work happens, printed on the line that closes the hero. */
  facts: { title: string; body: string }[];
  factsLabel: string;
  /** Service names that rise off the globe, three anchors at a time. */
  labels: GlobeLabelSlot[];
};

/**
 * The opening of the site. The night ground, one statement, two actions, and
 * the globe: the company's own symbol repeated over the world, turning slowly,
 * with the names of the work rising off it.
 */
export function Hero({ title, lead, primary, secondary, facts, factsLabel, labels }: HeroProps) {
  return (
    <section className="s-hero s-night">
      <div className="s-hero__inner container-page">
        <div className="s-hero__copy site-enter">
          <h1 className="s-display">{title}</h1>
          <p className="s-lede mt-6 max-w-xl sm:mt-8">{lead}</p>
          <div className="s-hero__actions">
            <Action href={primary.href} variant="bright" arrow>
              {primary.label}
            </Action>
            <Action href={secondary.href} variant="line">
              {secondary.label}
            </Action>
          </div>
        </div>

        <div className="s-hero__globe">
          <div className="absolute inset-0" aria-hidden>
            <Globe placement={{ x: 0.5, y: 0.5, size: 0.46 }} ramp={NIGHT_RAMP} hair={NIGHT_HAIR}>
              <GlobeStatic width={900} height={900} size={0.46} ramp={NIGHT_RAMP} hair={NIGHT_HAIR} />
            </Globe>
          </div>
          <GlobeLabels slots={labels} />
        </div>
      </div>

      <div className="s-hero__facts">
        <ul className="container-page" aria-label={factsLabel}>
          {facts.map((fact) => (
            <li key={fact.title}>
              <span className="s-hero__fact-title">{fact.title}</span>
              <span className="s-hero__fact-body">{fact.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
