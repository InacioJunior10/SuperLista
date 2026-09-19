import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { ListsRepository, NewItem } from "@/db/repository";
import type { ShoppingList } from "@/types/list";

import { budgetStatus, type BudgetStatus } from "./budget";
import { checkedCount, estimatedTotalCents, totalCount } from "./totals";

export const ACTIVE_LIST_KEY = "superlista:activeListId";
const DEFAULT_LIST_TITLE = "Minha lista";

export type ShoppingListState = {
  list: ShoppingList | null;
  loading: boolean;
  error: Error | null;
};

export type ShoppingListApi = ShoppingListState & {
  estimatedTotalCents: number;
  checkedCount: number;
  totalCount: number;
  budgetStatus: BudgetStatus;
  toggleItem(itemId: string): Promise<void>;
  setItemPrice(itemId: string, cents: number): Promise<void>;
  setItemQuantity(itemId: string, quantity: number): Promise<void>;
  addItem(input: NewItem): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  updateBudget(cents: number | null): Promise<void>;
  resetChecks(): Promise<void>;
  /** Carrega outra lista (e a torna ativa). */
  openList(listId: string): Promise<void>;
  reload(): Promise<void>;
};

const ListsContext = createContext<ShoppingListApi | null>(null);

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

async function readActiveId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_LIST_KEY);
  } catch {
    return null;
  }
}

async function writeActiveId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_LIST_KEY, id);
  } catch {
    // preferência não essencial
  }
}

export type ListsProviderProps = {
  children: ReactNode;
  /** Injeção para testes; por padrão usa getListsRepository(). */
  repository?: ListsRepository;
};

export function ListsProvider({ children, repository }: ListsProviderProps) {
  const [state, setState] = useState<ShoppingListState>({ list: null, loading: true, error: null });
  const listRef = useRef<ShoppingList | null>(null);
  const repoRef = useRef<ListsRepository | null>(repository ?? null);

  const commit = useCallback((next: Partial<ShoppingListState>) => {
    if (next.list !== undefined) listRef.current = next.list;
    setState((s) => ({ ...s, ...next }));
  }, []);

  const getRepo = useCallback(async () => {
    // import dinâmico: evita carregar expo-sqlite quando o repositório é injetado (testes)
    repoRef.current ??= await (await import("@/db/client")).getListsRepository();
    return repoRef.current;
  }, []);

  const run = useCallback(
    async (requestedId?: string) => {
      try {
        const repo = await getRepo();
        const wantedId = requestedId ?? (await readActiveId());
        let list = wantedId ? await repo.getList(wantedId) : null;
        list ??= (await repo.listLists())[0] ?? null;
        list ??= await repo.createList({ title: DEFAULT_LIST_TITLE });
        await writeActiveId(list.id);
        commit({ list, loading: false });
      } catch (e) {
        commit({ loading: false, error: toError(e) });
      }
    },
    [commit, getRepo],
  );

  useEffect(() => {
    void run();
  }, [run]);

  const load = useCallback(
    async (requestedId?: string) => {
      commit({ loading: true, error: null });
      await run(requestedId);
    },
    [commit, run],
  );

  /** Aplica a mudança otimista, persiste e, se falhar, reverte e expõe o erro. */
  const mutate = useCallback(
    async (apply: (list: ShoppingList) => ShoppingList, persist: (repo: ListsRepository) => Promise<unknown>) => {
      const previous = listRef.current;
      if (!previous) return;
      commit({ list: apply(previous), error: null });
      try {
        await persist(await getRepo());
      } catch (e) {
        commit({ list: previous, error: toError(e) });
      }
    },
    [commit, getRepo],
  );

  const api = useMemo<ShoppingListApi>(() => {
    const list = state.list;
    const patchItem = (itemId: string, patch: Partial<NewItem>) =>
      mutate(
        (l) => ({ ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }),
        (repo) => repo.updateItem(itemId, patch),
      );
    return {
      ...state,
      estimatedTotalCents: list ? estimatedTotalCents(list) : 0,
      checkedCount: list ? checkedCount(list) : 0,
      totalCount: list ? totalCount(list) : 0,
      budgetStatus: budgetStatus(list ?? { items: [] }),
      toggleItem: async (itemId) => {
        const item = listRef.current?.items.find((i) => i.id === itemId);
        if (item) await patchItem(itemId, { checked: !item.checked });
      },
      setItemPrice: (itemId, cents) => patchItem(itemId, { unitPriceCents: cents }),
      setItemQuantity: (itemId, quantity) => patchItem(itemId, { quantity }),
      addItem: async (input) => {
        const current = listRef.current;
        if (!current) return;
        try {
          const item = await (await getRepo()).addItem(current.id, input);
          commit({ list: { ...(listRef.current ?? current), items: [...(listRef.current ?? current).items, item] }, error: null });
        } catch (e) {
          commit({ error: toError(e) });
        }
      },
      removeItem: (itemId) =>
        mutate(
          (l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) }),
          (repo) => repo.removeItem(itemId),
        ),
      updateBudget: (cents) =>
        mutate(
          (l) => ({ ...l, budgetCents: cents ?? undefined }),
          (repo) => repo.updateList(listRef.current?.id ?? "", { budgetCents: cents }),
        ),
      resetChecks: async () => {
        const current = listRef.current;
        if (!current) return;
        const ids = current.items.filter((i) => i.checked).map((i) => i.id);
        await mutate(
          (l) => ({ ...l, items: l.items.map((i) => ({ ...i, checked: false })) }),
          async (repo) => {
            for (const id of ids) await repo.updateItem(id, { checked: false });
          },
        );
      },
      openList: (listId) => load(listId),
      reload: () => load(listRef.current?.id),
    };
  }, [state, mutate, load, commit, getRepo]);

  return <ListsContext.Provider value={api}>{children}</ListsContext.Provider>;
}

export function useShoppingList(listId?: string): ShoppingListApi {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error("useShoppingList deve ser usado dentro de <ListsProvider>");
  const { list, loading, openList } = ctx;
  useEffect(() => {
    if (listId && !loading && list?.id !== listId) void openList(listId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);
  return ctx;
}