/**
 * MenuBar - Refactored
 * Reduced from 318 lines to ~40 lines by extracting toolbar components
 * Organized into 3 logical groups: Formatting, Media, and Utility
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import { Separator } from '../ui/Separator';
import { FormattingToolbar } from './toolbar/FormattingToolbar';
import { MediaToolbar } from './toolbar/MediaToolbar';
import { UtilityToolbar } from './toolbar/UtilityToolbar';

interface MenuBarProps {
  editor: Editor | null;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = 'h-8 w-8 p-0';

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg flex flex-wrap gap-1 items-center sticky top-0 z-10">
      <FormattingToolbar editor={editor} buttonClass={buttonClass} />

      <Separator orientation="vertical" className="h-8" />

      <MediaToolbar editor={editor} buttonClass={buttonClass} />

      <Separator orientation="vertical" className="h-8" />

      <UtilityToolbar editor={editor} buttonClass={buttonClass} />
    </div>
  );
};
