import {
  cardLines,
  formatDate,
  partnerOf,
  personPageUrl,
  type Person,
  type PersonRef,
  type PersonSource,
} from '@/domain';
import { useT } from '@/i18n';
import { usePersonDetails } from './usePersonDetails';

interface PersonPanelProps {
  person: Person | PersonRef;
  source: PersonSource;
  onClose: () => void;
}

/**
 * Details of the selected card, untruncated, with the link to the person's page on
 * familysearch.org (SDD FR-16, FR-18).
 */
export function PersonPanel({ person, source, onClose }: PersonPanelProps) {
  const t = useT();
  const details = usePersonDetails(person, source);
  const shown = details.status === 'ready' ? details.person : person;
  const lines = cardLines(shown);
  const unions = 'unions' in shown ? shown.unions : [];

  return (
    <aside className="person-panel" aria-label={t('tree.panel.label', { name: lines.name })}>
      <button type="button" className="button" onClick={onClose}>
        {t('tree.close')}
      </button>
      <h2>{lines.name}</h2>
      {details.status === 'loading' ? (
        <p role="status" className="notice">
          {t('tree.panel.loading')}
        </p>
      ) : null}
      {details.status === 'unavailable' ? (
        <p role="alert" className="notice">
          {t('tree.panel.unavailable')}
        </p>
      ) : null}
      {lines.dates !== '' ? <p>{lines.dates}</p> : null}
      {lines.places !== '' ? <p>{lines.places}</p> : null}
      <p>{lines.id}</p>
      {unions.length > 0 ? (
        <>
          <h3>{t('tree.panel.marriages')}</h3>
          <ul>
            {unions.map((union, index) => {
              const spouse = partnerOf(shown.id, union);
              const text = [
                spouse?.name ?? '',
                formatDate(union.event?.date),
                union.event?.place?.text ?? '',
              ]
                .filter((part) => part !== '')
                .join(' \u00b7 ');
              return <li key={`${spouse?.id ?? 'none'}:${index}`}>{text}</li>;
            })}
          </ul>
        </>
      ) : null}
      <a href={personPageUrl(person.id)} target="_blank" rel="noopener noreferrer">
        {t('tree.openOnFamilySearch')}
      </a>
    </aside>
  );
}
