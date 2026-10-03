import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext, SelectionService } from '../../editor/types/editor.types';

export type ImageAlign = 'left' | 'right' | 'center';

/** Finds the <img> at the caret or the single selected image element. */
function getSelectedImage(root: HTMLElement | null, selectionService: SelectionService): HTMLImageElement | null {
  const range = selectionService.getRange();
  if (range) {
    const container = range.startContainer;
    if (container.nodeType === 1) {
      const img = (container as Element).querySelector?.('img');
      if (range.startContainer === range.endContainer && img) return img;
    }
  }
  return root?.querySelector('img.is-selected') ?? null;
}

/** Aligns the selected image within its flow via block display + margins. */
export const alignImageCommand: Omit<CommandDefinition<EditorCommandContext, ImageAlign, void>, 'id'> = {
  label: 'Align Image',
  execute({ editorService, selectionService }, align): void {
    const root = editorService.getRoot();
    const img = getSelectedImage(root, selectionService);
    if (!img) return;
    img.style.display = 'block';
    if (align === 'left') {
      img.style.marginLeft = '0';
      img.style.marginRight = 'auto';
    } else if (align === 'right') {
      img.style.marginLeft = 'auto';
      img.style.marginRight = '0';
    } else {
      img.style.marginLeft = 'auto';
      img.style.marginRight = 'auto';
    }
    editorService.normalize();
  }
};

/** Resizes the selected image to `widthPercent`% of its container width. */
export const resizeImageCommand: Omit<CommandDefinition<EditorCommandContext, number, void>, 'id'> = {
  label: 'Resize Image',
  execute({ editorService, selectionService }, widthPercent): void {
    const root = editorService.getRoot();
    const img = getSelectedImage(root, selectionService);
    if (!img || !widthPercent) return;
    img.style.width = `${widthPercent}%`;
    img.style.height = 'auto';
    editorService.normalize();
  }
};

/** Removes the selected image from the document. */
export const removeImageCommand: Omit<CommandDefinition<EditorCommandContext, void, void>, 'id'> = {
  label: 'Remove Image',
  execute({ editorService, selectionService }): void {
    const root = editorService.getRoot();
    const img = getSelectedImage(root, selectionService);
    if (!img) return;
    img.remove();
    editorService.normalize();
  }
};
