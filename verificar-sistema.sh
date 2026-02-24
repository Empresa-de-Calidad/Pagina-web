#!/bin/bash

# Script de verificación para conversión PDF a DOCX
# Quality+ - IES Ángel Sanz Briz

echo "═══════════════════════════════════════════════════"
echo "  Verificación de Sistema - Conversión PDF a DOCX"
echo "═══════════════════════════════════════════════════"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar PHP
echo -n "1. Verificando PHP... "
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1)
    echo -e "${GREEN}✓ Instalado${NC}"
    echo "   Versión: $PHP_VERSION"
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "   Instalar con: sudo apt install php php-cli"
fi
echo ""

# Verificar LibreOffice
echo -n "2. Verificando LibreOffice... "
if command -v soffice &> /dev/null; then
    LO_VERSION=$(soffice --version)
    echo -e "${GREEN}✓ Instalado${NC}"
    echo "   Versión: $LO_VERSION"
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "   Instalar con: sudo apt install libreoffice"
fi
echo ""

# Verificar archivos del proyecto
echo "3. Verificando archivos del proyecto..."

FILES=(
    "web/api/convert-pdf-to-docx.php"
    "web/js/script.js"
    "web/documents/ANEXO III.pdf"
    "web/documents/PROYECTO EDUCATIVO DE CENTRO IES ÁNGEL SANZ BRIZ (Borrador).pdf"
    "web/documents/Reglamento de Régimen Interior.pdf"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file"
    fi
done
echo ""

# Verificar permisos
echo "4. Verificando permisos..."
if [ -r "web/api/convert-pdf-to-docx.php" ]; then
    echo -e "   ${GREEN}✓${NC} API script es legible"
else
    echo -e "   ${RED}✗${NC} API script no tiene permisos correctos"
    echo "   Ejecutar: chmod 644 web/api/convert-pdf-to-docx.php"
fi
echo ""

# Test de conversión
echo "5. Test de conversión (opcional)..."
if command -v php &> /dev/null && command -v soffice &> /dev/null; then
    echo -n "   ¿Ejecutar test de conversión? (s/n): "
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo "   Iniciando test..."
        cd web
        php -S localhost:8888 > /dev/null 2>&1 &
        PHP_PID=$!
        sleep 2
        
        curl -X POST http://localhost:8888/api/convert-pdf-to-docx.php \
             -H "Content-Type: application/json" \
             -d '{"documentName":"ANEXO III"}' \
             --output /tmp/test-conversion.docx \
             --silent
        
        kill $PHP_PID
        
        if [ -f "/tmp/test-conversion.docx" ]; then
            SIZE=$(stat -f%z "/tmp/test-conversion.docx" 2>/dev/null || stat -c%s "/tmp/test-conversion.docx" 2>/dev/null)
            if [ "$SIZE" -gt 1000 ]; then
                echo -e "   ${GREEN}✓ Test exitoso${NC}"
                echo "   Archivo generado: /tmp/test-conversion.docx ($SIZE bytes)"
            else
                echo -e "   ${YELLOW}⚠ Test parcial${NC}"
                echo "   Archivo muy pequeño, revisar conversión"
            fi
            rm /tmp/test-conversion.docx
        else
            echo -e "   ${RED}✗ Test fallido${NC}"
            echo "   No se pudo generar el archivo"
        fi
    fi
else
    echo -e "   ${YELLOW}⊘ Saltado${NC} - Faltan dependencias"
fi
echo ""

# Resumen
echo "═══════════════════════════════════════════════════"
echo "  RESUMEN"
echo "═══════════════════════════════════════════════════"

if command -v php &> /dev/null && command -v soffice &> /dev/null; then
    echo -e "${GREEN}✓ Sistema listo para conversión PDF → DOCX${NC}"
    echo ""
    echo "Para iniciar el servidor:"
    echo "  cd web"
    echo "  php -S localhost:8000"
    echo ""
    echo "Luego abrir: http://localhost:8000/main.html"
else
    echo -e "${YELLOW}⚠ Sistema requiere configuración${NC}"
    echo ""
    if ! command -v php &> /dev/null; then
        echo "Instalar PHP:"
        echo "  sudo apt install php php-cli"
        echo ""
    fi
    if ! command -v soffice &> /dev/null; then
        echo "Instalar LibreOffice:"
        echo "  sudo apt install libreoffice"
        echo ""
    fi
    echo "Ver guía completa: CONVERSION-PDF-DOCX.md"
fi

echo "═══════════════════════════════════════════════════"
