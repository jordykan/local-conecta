#!/usr/bin/env node

/**
 * Script para generar VAPID keys para Web Push Notifications
 *
 * Uso:
 *   node scripts/generate-vapid-keys.js
 *
 * Requiere:
 *   npm install web-push --save-dev
 */

async function generateVapidKeys() {
  try {
    const webpush = await import('web-push')

    console.log('\n🔐 Generando VAPID keys para Web Push Notifications...\n')

    const vapidKeys = webpush.default.generateVAPIDKeys()

    console.log('✅ VAPID keys generadas exitosamente!\n')
    console.log('📋 Copia estas claves en tu archivo .env.local:\n')
    console.log('─'.repeat(80))
    console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
    console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
    console.log('─'.repeat(80))
    console.log('\n⚠️  IMPORTANTE:')
    console.log('   - Guarda estas claves de forma segura')
    console.log('   - NO las regeneres una vez en producción')
    console.log('   - Agrégalas también a tus Edge Functions en Supabase Dashboard')
    console.log('   - La clave pública debe estar en NEXT_PUBLIC_* para el cliente')
    console.log('   - La clave privada debe estar SOLO en el servidor/Edge Functions\n')

  } catch (error) {
    console.error('\n❌ Error al generar VAPID keys:')
    console.error(error.message)
    console.error('\nAsegúrate de instalar web-push primero:')
    console.error('  npm install web-push --save-dev\n')
    process.exit(1)
  }
}

generateVapidKeys()
