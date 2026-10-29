import { useT } from '@/i18n';
import { cardLines, type Gender, type Person, type PersonRef } from '@/domain';

const GENDER_SYMBOL: Record<Gender, string> = { male: '♂', female: '♀', unknown: '?' };
const REPEATED_SYMBOL = '\u{1F504}';

/**
 * Four fixed lines, truncated with an ellipsis; the full text is in the tooltip (SDD FR-24).
 * A person whose data came back unexpected keeps the name and the id, and says so where the dates
 * go (TC-15). A person with no data says "Not available" (TC-43). An ancestor reached twice carries
 * the repeat symbol (TC-22).
 */
export function PersonCard({ person }: { person: Person | PersonRef }) {
  const t = useT();
  const lines = cardLines(person);
  const invalid = 'invalid' in person && person.invalid === true;
  const unavailable = 'unavailable' in person && person.unavailable === true;
  const repeated = 'repeated' in person && person.repeated === true;
  const note = invalid ? t('card.unexpected') : unavailable ? t('card.unavailable') : '';
  const dates = note || lines.dates;
  const places = note ? '' : lines.places;
  return (
    <article className={`person-card person-card--${person.gender}`} aria-label={lines.name}>
      <p className="person-card__line person-card__name" title={lines.name}>
        <span role="img" aria-label={t(`card.gender.${person.gender}`)}>
          {GENDER_SYMBOL[person.gender]}
        </span>{' '}
        {lines.name}
        {repeated ? (
          <>
            {' '}
            <span role="img" aria-label={t('card.repeated')} title={t('card.repeated')}>
              {REPEATED_SYMBOL}
            </span>
          </>
        ) : null}
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
