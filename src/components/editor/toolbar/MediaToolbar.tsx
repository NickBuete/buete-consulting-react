/**
 * MediaToolbar Component
 * Link and media controls
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import { Link, Unlink } from 'lucide-react';
import { Button } from '../../ui/Button';

interface MediaToolbarProps {
  editor: Editor;
  buttonClass?: string;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  editor,
  buttonClass = 'h-8 w-8 p-0',
}) => {
  const setLink = React.useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex gap-1">
      <Button
        variant={editor.isActive('link') ? 'default' : 'ghost'}
        size="sm"
        className={buttonClass}
        onClick={setLink}
        title="Add Link"
        type="button"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={buttonClass}
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        title="Remove Link"
        type="button"
      >
        <Unlink className="h-4 w-4" />
      </Button>
    </div>
  );
};
