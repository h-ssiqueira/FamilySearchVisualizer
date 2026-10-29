import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UnauthorizedError } from '@/api';
import type { FamilyView, PersonId, PersonSource, ViewLevel, ViewTree } from '@/domain';
import {
  buildAncestorTree,
  buildFamilyView,
  extendToV3,
  hasMoreAncestors,
  withDetails,
} from '@/tree';

/** Generations loaded automatically; the user asks for more (SDD FR-12, OQ-02). */
export const INITIAL_GENERATIONS = 4;

export interface FamilyTreeOptions {
  source: PersonSource;
  rootId: PersonId;
  level: ViewLevel;
  onUnauthorized: () => void;
}

export interface FamilyTreeState {
  status: 'loading' | 'ready' | 'error';
  family: FamilyView | undefined;
  /** Deepest ancestor generation loaded so far. */
  generations: number;
  /** Ancestors are still being fetched. */
  busy: boolean;
  /** Relatives' details are still being fetched (V2, V3). */
  detailsBusy: boolean;
  canLoadMore: boolean;
  /** People whose details could not be loaded yet (FR-33). */
  failed: number;
  loadNext: () => void;
  loadAll: () => void;
  stop: () => void;
  retry: () => void;
}

/**
 * Loads the ancestors generation by generation (cancellable, unlimited), and derives the
 * requested view from them. V2 and V3 then load the details of the relatives they show (OQ-05).
 * Switching view never refetches what is already cached.
 */
export function useFamilyTree(options: FamilyTreeOptions): FamilyTreeState {
  const { source, rootId, level, onUnauthorized } = options;
  const [target, setTarget] = useState<number | 'all'>(INITIAL_GENERATIONS);
  const [run, setRun] = useState(0);
  const [tree, setTree] = useState<ViewTree | undefined>(undefined);
  const [ancestorsBusy, setAncestorsBusy] = useState(true);
  const [detailed, setDetailed] = useState<{ level: ViewLevel; view: FamilyView } | undefined>(
    undefined,
  );
  const [detailsBusy, setDetailsBusy] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const controllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setAncestorsBusy(true);
    setError(undefined);
    void (async () => {
      try {
        for await (const next of buildAncestorTree(
          rootId,
          source,
          { generations: target },
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          setTree(next);
        }
        if (!controller.signal.aborted) setAncestorsBusy(false);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(caught);
        setAncestorsBusy(false);
      }
    })();
    return () => controller.abort();
  }, [rootId, source, target, run]);

  const baseFamily = useMemo(
    () => (tree ? buildFamilyView(tree, level === 'V1' ? 'V1' : 'V2') : undefined),
    [tree, level],
  );

  useEffect(() => {
    if (level === 'V1' || !baseFamily || ancestorsBusy) {
      setDetailed(undefined);
      setDetailsBusy(false);
      return;
    }
    const controller = new AbortController();
    setDetailsBusy(true);
    // V2 shows the relatives with their details (OQ-05); V3 adds one more level on top of them.
    const withRelatives = withDetails(baseFamily, source, controller.signal);
    const work =
      level === 'V3'
        ? withRelatives.then((view) => extendToV3(view, source, controller.signal))
        : withRelatives;
    work
      .then((view) => {
        if (controller.signal.aborted) return;
        setDetailed({ level, view });
        setDetailsBusy(false);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(caught);
        setDetailsBusy(false);
      });
    return () => controller.abort();
  }, [level, baseFamily, ancestorsBusy, source]);

  useEffect(() => {
    if (error instanceof UnauthorizedError) onUnauthorized();
  }, [error, onUnauthorized]);

  const generations = tree ? tree.nodes.reduce((max, node) => Math.max(max, node.generation), 0) : 0;
  const canLoadMore = tree !== undefined && !ancestorsBusy && hasMoreAncestors(tree);

  const loadNext = useCallback(() => {
    setTarget(Math.max(typeof target === 'number' ? target : 0, generations) + 1);
  }, [target, generations]);
  const loadAll = useCallback(() => setTarget('all'), []);
  const stop = useCallback(() => {
    controllerRef.current?.abort();
    setAncestorsBusy(false);
  }, []);
  const retry = useCallback(() => setRun((value) => value + 1), []);

  const family =
    level === 'V1' ? baseFamily : detailed?.level === level ? detailed.view : baseFamily;

  return {
    status: error !== undefined ? 'error' : tree ? 'ready' : 'loading',
    family,
    generations,
    busy: ancestorsBusy,
    detailsBusy,
    canLoadMore,
    failed: tree ? tree.failed.length : 0,
    loadNext,
    loadAll,
    stop,
    retry,
  };
}
