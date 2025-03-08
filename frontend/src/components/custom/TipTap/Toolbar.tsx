import { Toggle } from '@/components/ui/toggle';
import { Editor } from '@tiptap/react'
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';

const Toolbar = ({editor}: {editor: Editor | null}) => {
  if(!editor) {
    return null;
  }

  return (
    <div className="flex p-1 border border-input rounded-md bg-background shadow-sm items-center">
      <div className="flex space-x-1 border-r border-input pr-1 mr-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          className="hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
      </div>
      
      <div className="flex space-x-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="hover:bg-muted data-[state=on]:bg-primary/10 data-[state=on]:text-primary transition-colors"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  )
}

export default Toolbar