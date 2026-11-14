import { useEffect, useState } from 'react';
import type { Services } from '@/services';
import { DEFAULT_LOCALE } from '@/i18n';
import { useT } from '@/i18n';
import { UnauthorizedError } from '@/api';
import { applyPreferredLocale } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PersonPanel } from './PersonPanel';
import { TreeToolbar } from './TreeToolbar';
import { useCurrentUser } from './useCurrentUser';
import { useFamilyTree } from './useFamilyTree';
import { useQueueWait } from './useQueueWait';
import { ForceGraphCanvas } from './ForceGraphCanvas';
import { toGraphData } from '@/graph';
import { cardLines, type PersonId, type ViewLevel } from '@/domain';
import { viewStore } from '@/state/viewStore';
import { useMemo } from 'react';

export { DEFAULT_LOCALE };

export type { GraphScreenProps };
interface GraphScreenProps {
  services: Services;
  onSignOut: () => void;
  onExpired?: () => void;
}
