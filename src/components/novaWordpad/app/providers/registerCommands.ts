import { registerCommand } from '../../core/commands/commandRegistry';

import { boldCommand } from '../../features/formatting/commands/bold';
import { italicCommand } from '../../features/formatting/commands/italic';
import { underlineCommand } from '../../features/formatting/commands/underline';
import { strikeCommand } from '../../features/formatting/commands/strike';
import { superscriptCommand } from '../../features/formatting/commands/superscript';
import { subscriptCommand } from '../../features/formatting/commands/subscript';
import { fontFamilyCommand } from '../../features/formatting/commands/fontFamily';
import { fontSizeCommand } from '../../features/formatting/commands/fontSize';
import { textColorCommand } from '../../features/formatting/commands/textColor';
import { highlightCommand } from '../../features/formatting/commands/highlight';
import { clearFormattingCommand } from '../../features/formatting/commands/clearFormatting';

import { headingCommand } from '../../features/paragraph/commands/heading';
import { alignCommand } from '../../features/paragraph/commands/align';
import { horizontalRuleCommand } from '../../features/paragraph/commands/horizontalRule';

import { bulletListCommand } from '../../features/lists/commands/bulletList';
import { numberedListCommand } from '../../features/lists/commands/numberedList';
import { indentCommand } from '../../features/lists/commands/indent';
import { outdentCommand } from '../../features/lists/commands/outdent';

import { insertLinkCommand } from '../../features/links/commands/insertLink';
import { removeLinkCommand } from '../../features/links/commands/removeLink';

import { insertImageCommand } from '../../features/images/commands/insertImage';
import { alignImageCommand, resizeImageCommand, removeImageCommand } from '../../features/images/commands/imageTransforms';

import { insertTableCommand, deleteTableCommand } from '../../features/tables/commands/insertTable';
import {
  addRowCommand,
  deleteRowCommand,
  addColumnCommand,
  deleteColumnCommand
} from '../../features/tables/commands/rowColumnCommands';
import { cellAlignCommand, cellBackgroundCommand } from '../../features/tables/commands/cellCommands';

let registered = false;

/**
 * Idempotent: safe to call multiple times (e.g. React StrictMode).
 *
 * Registers each command individually (rather than as one batched
 * `registerCommands({...})` call) so TypeScript infers each command's own
 * `TPayload`/`TResult`/`TValue` from its concrete `CommandDefinition` —
 * batching them into a single object would force a single shared generic
 * across commands whose payloads differ (e.g. `AlignValue` vs `string` vs
 * `void`), which does not type-check.
 */
export function registerAllCommands(): void {
  if (registered) return;
  registered = true;

  registerCommand('bold', boldCommand);
  registerCommand('italic', italicCommand);
  registerCommand('underline', underlineCommand);
  registerCommand('strike', strikeCommand);
  registerCommand('superscript', superscriptCommand);
  registerCommand('subscript', subscriptCommand);
  registerCommand('fontFamily', fontFamilyCommand);
  registerCommand('fontSize', fontSizeCommand);
  registerCommand('textColor', textColorCommand);
  registerCommand('highlight', highlightCommand);
  registerCommand('clearFormatting', clearFormattingCommand);

  registerCommand('heading', headingCommand);
  registerCommand('align', alignCommand);
  registerCommand('horizontalRule', horizontalRuleCommand);

  registerCommand('bulletList', bulletListCommand);
  registerCommand('numberedList', numberedListCommand);
  registerCommand('indent', indentCommand);
  registerCommand('outdent', outdentCommand);

  registerCommand('insertLink', insertLinkCommand);
  registerCommand('removeLink', removeLinkCommand);

  registerCommand('insertImage', insertImageCommand);
  registerCommand('alignImage', alignImageCommand);
  registerCommand('resizeImage', resizeImageCommand);
  registerCommand('removeImage', removeImageCommand);

  registerCommand('insertTable', insertTableCommand);
  registerCommand('deleteTable', deleteTableCommand);
  registerCommand('addRow', addRowCommand);
  registerCommand('deleteRow', deleteRowCommand);
  registerCommand('addColumn', addColumnCommand);
  registerCommand('deleteColumn', deleteColumnCommand);
  registerCommand('cellAlign', cellAlignCommand);
  registerCommand('cellBackground', cellBackgroundCommand);
}
