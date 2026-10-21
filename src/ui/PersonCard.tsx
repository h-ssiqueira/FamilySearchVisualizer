import { cardLines, type Gender, type Person, type PersonRef } from '@/domain';
import { useT } from '@/i18n';

const GENDER_SYMBOL: Record<Gender, string> = { male: '♂', female: '♀', unknown: '?' };

/** Four fixed lines, truncated with an ellipsis; the full text is in the tooltip (SDD FR-24). */
export function PersonCard({ person }: { person: Person | PersonRef }) {
  const t = useT();
  const lines = cardLines(person);
  return (
    <article className={`person-card person-card--${person.gender}`} aria-label={lines.name}>
      <p className="person-card__line person-card__name" title={lines.name}>
        <span role="img" aria-label={t(`card.gender.${person.gender}`)}>
          {GENDER_SYMBOL[person.gender]}
        </span>{' '}
        {lines.name}
      </p>
      <p className="person-card__line" title={lines.dates}>
        {lines.dates || '\u00a0'}
      </p>
      <p className="person-card__line" title={lines.places}>
        {lines.places || '\u00a0'}
      </p>
      <p className="person-card__line" title={lines.id}>
        {lines.id}
      </p>
    </article>
  );
}
