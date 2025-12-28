/**
 * FormattingToolbar Component
 * Combined text and block formatting (bold, italic, headings, lists, blockquote)
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Separator } from '../../ui/Separator';

interface FormattingToolbarProps {
  editor: Editor;
  buttonClass?: string;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  editor,
  buttonClass = 'h-8 w-8 p-0',
}) => {
  return (
    <>
      {/* Text Formatting */}
      <div className="flex gap-1">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (⌘U)"
          type="button"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
          type="button"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('highlight') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
          type="button"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Headings */}
      <div className="flex gap-1">
        <Button
          variant={
            editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
          type="button"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Lists & Quote */}
      <div className="flex gap-1">
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          type="button"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Text Alignment */}
      <div className="flex gap-1">
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'
          }
          size="sm"
          className={buttonClass}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
          type="button"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
