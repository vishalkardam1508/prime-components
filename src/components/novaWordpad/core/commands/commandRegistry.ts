/**
 * Central registry mapping command ids to { label, shortcut, execute, isActive }.
 * Feature modules register their commands here via registerCommand()/registerCommands(),
 * and the toolbar/keyboard layer only ever knows about ids — never formatting logic.
 *
 * The registry is intentionally context-agnostic (core has no dependency on any
 * feature module): callers supply their own `TContext` type parameter, matching
 * whatever context shape their layer of the app builds (in this app, that shape is
 * `EditorCommandContext` from `features/editor/types/editor.types`).
 */
export interface CommandDefinition<TContext = unknown, TPayload = unknown, TResult = unknown, TValue = TPayload> {
  id: string;
  label: string;
  shortcut?: string;
  execute: (context: TContext, payload: TPayload) => TResult;
  isActive?: (context: TContext) => boolean;
  /**
   * Optional accessor for the "current value" of this command's controlled
   * field at the caret/selection (e.g. the active font family or font
   * size), used to drive controlled toolbar inputs like dropdowns.
   * Deliberately a separate `TValue` type param (defaulting to `TPayload`)
   * rather than reusing `TResult` — `execute` commonly returns `void`,
   * while `currentValue` returns the same kind of value `execute` accepts.
   */
  currentValue?: (context: TContext) => TValue | null;
}

/** A command as stored in the registry, with its context/payload/result types erased. */
export type AnyCommandDefinition = CommandDefinition<unknown, unknown, unknown, unknown>;

const registry = new Map<string, AnyCommandDefinition>();

export function registerCommand<TContext = unknown, TPayload = unknown, TResult = unknown, TValue = TPayload>(
  id: string,
  definition: Omit<CommandDefinition<TContext, TPayload, TResult, TValue>, 'id'>
): void {
  registry.set(id, { id, ...definition } as unknown as AnyCommandDefinition);
}

export function registerCommands<TContext = unknown, TPayload = unknown, TResult = unknown, TValue = TPayload>(
  defs: Record<string, Omit<CommandDefinition<TContext, TPayload, TResult, TValue>, 'id'>>
): void {
  Object.entries(defs).forEach(([id, definition]) => registerCommand(id, definition));
}

export function getCommand(id: string): AnyCommandDefinition | null {
  return registry.get(id) ?? null;
}

export function getAllCommands(): AnyCommandDefinition[] {
  return Array.from(registry.values());
}
