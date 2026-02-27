"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { IconBell, IconLoader2 } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

interface NotificationPreferences {
  notify_new_booking: boolean;
  notify_new_message: boolean;
  notify_new_review: boolean;
  notify_booking_confirmed: boolean;
  notify_booking_cancelled: boolean;
  notify_review_response: boolean;
  notify_new_promotion: boolean;
}

export default function NotificationsSettingsPage() {
  const supabase = createClient();
  const { permission, isSubscribed, requestPermission } = usePushNotifications();
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No estás autenticado");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading preferences:", error);
        // Crear preferencias por defecto si no existen
        const { data: newPrefs, error: insertError } = await supabase
          .from("notification_preferences")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          toast.error("Error al cargar preferencias");
          return;
        }

        setPreferences(newPrefs as NotificationPreferences);
      } else {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar preferencias");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!userId || !preferences) return;

    setUpdating(key);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update({ [key]: value })
        .eq("user_id", userId);

      if (error) throw error;

      setPreferences({ ...preferences, [key]: value });
      toast.success("Preferencia actualizada");
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Error al actualizar preferencia");
    } finally {
      setUpdating(null);
    }
  };

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      toast.success("Notificaciones activadas");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <IconLoader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No se pudieron cargar las preferencias</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Configura qué notificaciones quieres recibir
        </p>
      </div>

      {/* Estado de notificaciones push */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="h-5 w-5 text-orange-600" />
            Estado de las notificaciones
          </CardTitle>
          <CardDescription>
            Información sobre el estado actual de tus notificaciones push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permisos del navegador:</span>
            <span className="text-sm">
              {permission === "granted" && "✅ Concedidos"}
              {permission === "denied" && "❌ Denegados"}
              {permission === "default" && "⏳ Pendientes"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suscripción activa:</span>
            <span className="text-sm">{isSubscribed ? "✅ Sí" : "❌ No"}</span>
          </div>

          {permission !== "granted" && (
            <div className="pt-4">
              <button
                onClick={handleEnableNotifications}
                className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Activar notificaciones
              </button>
            </div>
          )}

          {permission === "denied" && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
              Has bloqueado las notificaciones. Para habilitarlas:
              <ul className="mt-2 ml-4 list-disc">
                <li>Ve a Configuración → Safari → Sitios web</li>
                <li>Busca "Notificaciones"</li>
                <li>Cambia el permiso para este sitio</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferencias para negocios */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones para negocios</CardTitle>
          <CardDescription>
            Recibe notificaciones sobre la actividad de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_new_booking">Nuevas reservas</Label>
              <p className="text-sm text-muted-foreground">
                Cuando alguien hace una reserva en tu negocio
              </p>
            </div>
            <Switch
              id="notify_new_booking"
              checked={preferences.notify_new_booking}
              onCheckedChange={(v) => updatePreference("notify_new_booking", v)}
              disabled={!!updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_new_message">Nuevos mensajes</Label>
              <p className="text-sm text-muted-foreground">
                Cuando recibes un mensaje de un cliente
              </p>
            </div>
            <Switch
              id="notify_new_message"
              checked={preferences.notify_new_message}
              onCheckedChange={(v) => updatePreference("notify_new_message", v)}
              disabled={!!updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_new_review">Nuevas reseñas</Label>
              <p className="text-sm text-muted-foreground">
                Cuando alguien deja una reseña en tu negocio
              </p>
            </div>
            <Switch
              id="notify_new_review"
              checked={preferences.notify_new_review}
              onCheckedChange={(v) => updatePreference("notify_new_review", v)}
              disabled={!!updating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferencias para clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones para clientes</CardTitle>
          <CardDescription>
            Recibe notificaciones sobre tus reservas y actividad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_booking_confirmed">Reserva confirmada</Label>
              <p className="text-sm text-muted-foreground">
                Cuando un negocio confirma tu reserva
              </p>
            </div>
            <Switch
              id="notify_booking_confirmed"
              checked={preferences.notify_booking_confirmed}
              onCheckedChange={(v) => updatePreference("notify_booking_confirmed", v)}
              disabled={!!updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_booking_cancelled">Reserva cancelada</Label>
              <p className="text-sm text-muted-foreground">
                Cuando un negocio cancela tu reserva
              </p>
            </div>
            <Switch
              id="notify_booking_cancelled"
              checked={preferences.notify_booking_cancelled}
              onCheckedChange={(v) => updatePreference("notify_booking_cancelled", v)}
              disabled={!!updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_review_response">Respuesta a reseña</Label>
              <p className="text-sm text-muted-foreground">
                Cuando un negocio responde a tu reseña
              </p>
            </div>
            <Switch
              id="notify_review_response"
              checked={preferences.notify_review_response}
              onCheckedChange={(v) => updatePreference("notify_review_response", v)}
              disabled={!!updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify_new_promotion">Nuevas promociones</Label>
              <p className="text-sm text-muted-foreground">
                Cuando un negocio que tienes en favoritos publica una promoción
              </p>
            </div>
            <Switch
              id="notify_new_promotion"
              checked={preferences.notify_new_promotion}
              onCheckedChange={(v) => updatePreference("notify_new_promotion", v)}
              disabled={!!updating}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
