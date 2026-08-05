import { getPaste, checkPasteExists } from "@/lib/api";
import { notFound } from "next/navigation";
import PasteViewer from "@/components/PasteViewer";
import PasswordPrompt from "@/components/PasswordPrompt";

interface Props {
    params: Promise<{ code: string }>;
} 

export default async function PastePage({params}: Props) {
    const { code } = await params;

    const exists = await checkPasteExists(code);

    if(!exists.exists) {
        notFound();
    }

    if(exists.passwordProtected) {
        return <PasswordPrompt code={code} />
    }

    const paste = await getPaste(code);

    return <PasteViewer paste={paste} />
}