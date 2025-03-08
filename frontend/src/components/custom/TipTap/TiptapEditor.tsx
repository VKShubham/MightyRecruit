import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Toolbar from "./Toolbar"
import { Separator } from "@/components/ui/separator"
import Underline from '@tiptap/extension-underline'
const TipTap = ({
    description,
    onChange,
}: {
    description: string,
    onChange: (richText: string) => void
}) => {

const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: description,
    editorProps:{
        attributes: {
            class: "min-h-[150px] p-2"
        }
    },
    onUpdate({ editor }) {
        onChange(editor.getHTML())
    }
})

return (
    <div className="flex flex-col w-full gap-2">
    <div className="rounded-md border border-input bg-background">
        <Toolbar editor={editor} />
        <Separator className="my-0" />
        <EditorContent 
        editor={editor} 
        className="min-h-[120px] focus:outline-none editor-content"
        />
    </div>
    </div>
)
}

export default TipTap;