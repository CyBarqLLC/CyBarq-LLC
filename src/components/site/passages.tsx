import { Rise } from "./reveal";

export type Passage = { key: string; title: string; body: string };

type PassagesProps = {
  intro?: string;
  items: Passage[];
};

/**
 * How the work is done, written rather than tiled. Four short passages on
 * hairlines, set at reading size with room around them. No numbers, no icons
 * and no boxes: if a sentence cannot carry the idea, an icon will not save it.
 */
export function Passages({ intro, items }: PassagesProps) {
  return (
    <div className="s-passages">
      {intro ? (
        <Rise>
          <p className="s-passages__intro">{intro}</p>
        </Rise>
      ) : null}
      <ul className="s-passages__list">
        {items.map((item) => (
          <li key={item.key} className="s-passage">
            <Rise>
              <h3 className="s-passage__title">{item.title}</h3>
              <p className="s-passage__body">{item.body}</p>
            </Rise>
          </li>
        ))}
      </ul>
    </div>
  );
}
