"use client"

import { useState } from "react"
import { IconMessage } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { ContactBusinessModal } from "./ContactBusinessModal"

interface ContactBusinessButtonProps {
  businessId: string
  businessName: string
}

export function ContactBusinessButton({
  businessId,
  businessName,
}: ContactBusinessButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <IconMessage className="mr-1.5 size-4" />
        Enviar mensaje
      </Button>

      <ContactBusinessModal
        businessId={businessId}
        businessName={businessName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
