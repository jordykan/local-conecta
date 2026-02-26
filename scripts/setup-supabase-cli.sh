#!/bin/bash

# Script para configurar Supabase CLI
# Este script es opcional - solo úsalo si prefieres trabajar con CLI

echo "🔧 Configurando Supabase CLI..."

# 1. Instalar Supabase CLI (macOS)
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    brew install supabase/tap/supabase
else
    echo "✅ Supabase CLI ya está instalado"
fi

# 2. Login a Supabase
echo ""
echo "🔐 Iniciando sesión en Supabase..."
echo "   Se abrirá tu navegador para autenticarte"
supabase login

# 3. Link al proyecto
echo ""
echo "🔗 Conectando al proyecto..."
echo "   Ingresa tu Project ID cuando se te solicite"
echo "   Lo puedes encontrar en: Settings > General > Reference ID"
supabase link

# 4. Aplicar migraciones
echo ""
echo "📊 Aplicando migraciones..."
supabase db push

# 5. Deploy Edge Functions
echo ""
echo "🚀 ¿Quieres deployar las Edge Functions ahora? (y/n)"
read -r deploy_functions

if [ "$deploy_functions" = "y" ]; then
    echo "📤 Deploying Edge Functions..."
    supabase functions deploy send-notification
    supabase functions deploy subscribe-push

    echo ""
    echo "⚠️  No olvides configurar los secrets en Supabase Dashboard:"
    echo "   Dashboard > Edge Functions > Manage secrets"
    echo "   - VAPID_PUBLIC_KEY"
    echo "   - VAPID_PRIVATE_KEY"
fi

echo ""
echo "✅ Configuración completada!"
