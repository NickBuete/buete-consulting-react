/**
 * UtilityToolbar Component
 * Undo and redo controls
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import { Undo, Redo } from 'lucide-react';
import { Button } from '../../ui/Button';

interface UtilityToolbarProps {
  editor: Editor;
  buttonClass?: string;
}

export const UtilityToolbar: React.FC<UtilityToolbarProps> = ({
  editor,
  buttonClass = 'h-8 w-8 p-0',
}) => {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={buttonClass}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
        type="button"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={buttonClass}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
        type="button"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};
