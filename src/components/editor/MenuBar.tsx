import React from 'react'
import { Editor } from '@tiptap/react'
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
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Unlink,
  Highlighter,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Separator } from '../ui/Separator'

interface MenuBarProps {
  editor: Editor | null
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const setLink = React.useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  const buttonClass = 'h-8 w-8 p-0'

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg flex flex-wrap gap-1 items-center sticky top-0 z-10">
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

      <Separator orientation="vertical" className="h-8" />

      {/* Link */}
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

      <Separator orientation="vertical" className="h-8" />

      {/* Undo/Redo */}
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
    </div>
  )
}
