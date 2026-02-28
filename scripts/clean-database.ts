import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Faltan variables de entorno:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanDatabase() {
  console.log("🧹 Iniciando limpieza de la base de datos...\n");

  try {
    // Orden de eliminación respetando foreign keys (de más dependiente a menos)
    const tablesToClean = [
      "favorites",
      "reviews",
      "messages",
      "bookings",
      "promotions",
      "products_services",
      "business_hours",
      "profile_views",
      "push_subscriptions",
      "notification_preferences",
      "businesses",
      "profiles",
      "communities",
    ];

    let totalDeleted = 0;

    for (const table of tablesToClean) {
      console.log(`🗑️  Limpiando tabla: ${table}...`);

      const { count, error } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Eliminar todos los registros

      if (error) {
        console.error(`   ❌ Error en ${table}:`, error.message);
      } else {
        const deleted = count || 0;
        totalDeleted += deleted;
        console.log(`   ✅ ${deleted} registros eliminados`);
      }
    }

    console.log("\n📊 Resumen:");
    console.log(`   Total de registros eliminados: ${totalDeleted}`);

    // Verificar categorías
    const { count: categoryCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    console.log(`   ✅ Categorías preservadas: ${categoryCount || 0}\n`);

    console.log("✨ Limpieza completada exitosamente!");
  } catch (error) {
    console.error("\n❌ Error durante la limpieza:", error);
    process.exit(1);
  }
}

// Confirmación antes de ejecutar
console.log("⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos");
console.log("   excepto las categorías.\n");
console.log("   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n");

setTimeout(() => {
  cleanDatabase();
}, 5000);
