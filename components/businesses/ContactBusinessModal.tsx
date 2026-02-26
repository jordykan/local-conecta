"use client"

import { useState, useTransition } from "react"
import { IconSend } from "@tabler/icons-react"
import { toast } from "sonner"
import { sendMessage } from "@/app/(main)/account/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ContactBusinessModalProps {
  businessId: string
  businessName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactBusinessModal({
  businessId,
  businessName,
  open,
  onOpenChange,
}: ContactBusinessModalProps) {
  const [content, setContent] = useState("")
  const [pending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  function handleSend() {
    if (!content.trim()) return

    // Generate a new conversation_id for new conversations
    const conversationId = crypto.randomUUID()

    startTransition(async () => {
      const result = await sendMessage(
        conversationId,
        businessId,
        content.trim()
      )

      if (result?.error) {
        toast.error(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  function handleClose(open: boolean) {
    if (!open) {
      setContent("")
      setSuccess(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">¡Mensaje enviado!</DialogTitle>
              <DialogDescription className="text-center">
                Tu mensaje fue enviado a <strong>{businessName}</strong>. Te
                responderán pronto.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleClose(false)} className="w-full">
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar mensaje a {businessName}</DialogTitle>
              <DialogDescription>
                Escribe tu consulta o pregunta. El negocio recibirá tu mensaje y
                podrá responderte.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hola, me gustaría saber..."
                rows={4}
                className="resize-none"
                maxLength={2000}
                disabled={pending}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {content.length}/2000
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSend}
                disabled={pending || !content.trim()}
                className="w-full"
              >
                {pending ? (
                  "Enviando..."
                ) : (
                  <>
                    <IconSend className="mr-1.5 size-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
