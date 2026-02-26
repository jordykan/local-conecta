"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Category, Community } from "@/lib/types/database"
import type {
  BusinessBasicData,
  BusinessContactData,
  BusinessHourEntry,
  BusinessRegistrationData,
} from "@/lib/validations/business"
import { registerBusiness } from "@/app/(main)/register-business/actions"
import { StepIndicator } from "./StepIndicator"
import { StepBasicInfo } from "./StepBasicInfo"
import { StepContact } from "./StepContact"
import { StepMedia } from "./StepMedia"
import { StepHours } from "./StepHours"
import { StepReview } from "./StepReview"

interface WizardProps {
  categories: Category[]
  communities: Community[]
  userId: string
}

function buildDefaultHours(): BusinessHourEntry[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: i === 0, // Domingo cerrado por defecto
  }))
}

export function BusinessRegistrationWizard({
  categories,
  communities,
  userId,
}: WizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pending, startTransition] = useTransition()

  // Form data across steps
  const [basicData, setBasicData] = useState<Partial<BusinessBasicData>>({})
  const [contactData, setContactData] = useState<Partial<BusinessContactData>>(
    {}
  )
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [hours, setHours] = useState<BusinessHourEntry[]>(buildDefaultHours)

  // Use first community for MVP
  const community = communities[0]

  function handleBasicNext(data: BusinessBasicData) {
    setBasicData(data)
    setStep(1)
  }

  function handleContactNext(data: BusinessContactData) {
    setContactData(data)
    setStep(2)
  }

  function handleMediaNext(data: {
    logoUrl: string | null
    coverUrl: string | null
  }) {
    setLogoUrl(data.logoUrl)
    setCoverUrl(data.coverUrl)
    setStep(3)
  }

  function handleHoursNext(h: BusinessHourEntry[]) {
    setHours(h)
    setStep(4)
  }

  function getFullData(): BusinessRegistrationData {
    return {
      name: basicData.name ?? "",
      categoryId: basicData.categoryId ?? "",
      shortDescription: basicData.shortDescription,
      description: basicData.description,
      phone: contactData.phone,
      whatsapp: contactData.whatsapp,
      email: contactData.email,
      address: contactData.address,
      communityId: community?.id ?? "",
      logoUrl,
      coverUrl,
      hours,
    }
  }

  function handleSubmit() {
    const data = getFullData()
    startTransition(async () => {
      const result = await registerBusiness(data)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Negocio registrado correctamente")
      router.push("/dashboard")
    })
  }

  return (
    <div className="mt-10 space-y-10">
      <StepIndicator currentStep={step} />

      <div className="mx-auto max-w-lg">
        {step === 0 && (
          <StepBasicInfo
            data={basicData}
            categories={categories}
            onNext={handleBasicNext}
          />
        )}

        {step === 1 && (
          <StepContact
            data={contactData}
            onNext={handleContactNext}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepMedia
            logoUrl={logoUrl}
            coverUrl={coverUrl}
            onNext={handleMediaNext}
            onBack={() => setStep(1)}
            userId={userId}
          />
        )}

        {step === 3 && (
          <StepHours
            hours={hours}
            onNext={handleHoursNext}
            onBack={() => setStep(2)}
            onHoursChange={setHours}
          />
        )}

        {step === 4 && (
          <StepReview
            data={getFullData()}
            categories={categories}
            communityName={community?.name ?? ""}
            onSubmit={handleSubmit}
            onEdit={(s) => setStep(s)}
            pending={pending}
          />
        )}
      </div>
    </div>
  )
}
