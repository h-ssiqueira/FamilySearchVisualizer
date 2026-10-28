import { useT } from '@/i18n';
import { cardLines, type Gender, type Person, type PersonRef } from '@/domain';

const GENDER_SYMBOL: Record<Gender, string> = { male: '♂', female: '♀', unknown: '?' };

/**
 * Four fixed lines, truncated with an ellipsis; the full text is in the tooltip (SDD FR-24).
 * A person whose data came back unexpected keeps the name and the id, and says so where the dates
 * go (SDD TC-15).
 */
export function PersonCard({ person }: { person: Person | PersonRef }) {
  const t = useT();
  const lines = cardLines(person);
  const invalid = 'invalid' in person && person.invalid === true;
  const dates = invalid ? t('card.unexpected') : lines.dates;
  const places = invalid ? '' : lines.places;
  return (
    <article className={`person-card person-card--${person.gender}`} aria-label={lines.name}>
      <p className="person-card__line person-card__name" title={lines.name}>
        <span role="img" aria-label={t(`card.gender.${person.gender}`)}>
          {GENDER_SYMBOL[person.gender]}
        </span>{' '}
        {lines.name}
      </p>
      <p className="person-card__line" title={dates}>
        {dates || '\u00a0'}
      </p>
      <p className="person-card__line" title={places}>
        {places || '\u00a0'}
      </p>
      <p className="person-card__line" title={lines.id}>
        {lines.id}
      </p>
    </article>
  );
}
