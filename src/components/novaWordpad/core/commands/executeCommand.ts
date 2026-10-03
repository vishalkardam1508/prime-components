import { getCommand } from './commandRegistry';

/**
 * Executes a registered command by id against a caller-supplied context.
 *
 * @param id - command id, e.g. "bold"
 * @param context - the context object the command's `execute` expects (e.g. an
 *   `EditorCommandContext` bundling editorService/selectionService/history)
 * @param payload - optional command-specific payload (e.g. a color)
 */
export function executeCommand<TContext = unknown, TPayload = unknown, TResult = unknown>(
  id: string,
  context: TContext,
  payload?: TPayload
): TResult | null {
  const command = getCommand(id);
  if (!command) {
    console.warn(`[executeCommand] Unknown command: ${id}`);
    return null;
  }
  return command.execute(context, payload) as TResult;
}

export function isCommandActive<TContext = unknown>(id: string, context: TContext): boolean {
  const command = getCommand(id);
  if (!command || typeof command.isActive !== 'function') return false;
  return command.isActive(context);
}

/** Reads a command's controlled-field value (e.g. font family/size at the caret), or `fallback` if unset. */
export function getCommandCurrentValue<TContext = unknown, TValue = unknown>(
  id: string,
  context: TContext,
  fallback: TValue
): TValue {
  const command = getCommand(id);
  if (!command || typeof command.currentValue !== 'function') return fallback;
  return (command.currentValue(context) as TValue | null) ?? fallback;
}
