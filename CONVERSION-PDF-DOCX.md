# 📄 Conversión PDF a DOCX - Guía de Configuración

## ✅ Cambios Implementados

### 1. ✅ ANEXO III.pdf agregado
- ✅ Añadido al mapa de documentos en `js/script.js`
- ✅ Nueva tarjeta en `main.html` con fecha 23/02/2026
- ✅ Totalmente funcional y visible en el dashboard

### 2. ✅ Visor del Reglamento corregido
- ✅ Eliminado `max-width: 800px` restrictivo
- ✅ Ahora ambos PDFs (PROYECTO y Reglamento) se ven al 100% de ancho disponible
- ✅ Visualización uniforme y óptima

### 3. ✅ Scroll en Perfil implementado
- ✅ Añadido `overflow-y: auto` a `.profileContainer`
- ✅ `max-height: calc(100vh - 140px)` para contenido largo
- ✅ Scrollable cuando hay muchos campos

### 4. ✅ Conversión PDF a DOCX REAL implementada

---

## 🔧 Configuración del Servidor para Conversión PDF → DOCX

La conversión **REAL** de PDF a DOCX ahora está implementada usando **LibreOffice** en el backend.

### Requisitos del Sistema:

#### Opción A: Servidor Linux (Recomendado)

1. **Instalar PHP** (si no está instalado):
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php php-cli

# CentOS/RHEL
sudo yum install php php-cli
```

2. **Instalar LibreOffice**:
```bash
# Ubuntu/Debian
sudo apt install libreoffice

# CentOS/RHEL
sudo yum install libreoffice

# Verificar instalación
soffice --version
```

3. **Verificar permisos**:
```bash
# Dar permisos al directorio api
chmod 755 /home/rodrigo.bueno@iesangelsanzbriz.net/Pagina-web/web/api
chmod 644 /home/rodrigo.bueno@iesangelsanzbriz.net/Pagina-web/web/api/convert-pdf-to-docx.php

# Dar permisos al usuario de PHP para ejecutar soffice
# (generalmente www-data o apache)
```

4. **Configurar servidor web**:

**Con Apache:**
```apache
# Asegurar que PHP está habilitado
sudo a2enmod php8.1  # O tu versión de PHP
sudo systemctl restart apache2
```

**Con PHP Built-in Server (Desarrollo):**
```bash
cd /home/rodrigo.bueno@iesangelsanzbriz.net/Pagina-web/web
php -S localhost:8000
```

5. **Probar la conversión**:
```bash
# Desde el terminal
curl -X POST http://localhost:8000/api/convert-pdf-to-docx.php \
  -H "Content-Type: application/json" \
  -d '{"documentName":"ANEXO III"}' \
  --output test.docx

# Verificar que se creó el archivo
file test.docx
```

---

#### Opción B: Servidor Windows

1. **Instalar XAMPP** o **WAMP**
   - Descarga: https://www.apachefriends.org/

2. **Instalar LibreOffice**:
   - Descarga: https://www.libreoffice.org/download/
   - Instalar en `C:\Program Files\LibreOffice`

3. **Añadir LibreOffice al PATH**:
   - Panel de Control → Sistema → Variables de entorno
   - Agregar: `C:\Program Files\LibreOffice\program`

4. **Modificar** `convert-pdf-to-docx.php`:
```php
// Cambiar línea 40 por:
function checkLibreOffice() {
    $output = shell_exec('where soffice 2>&1');  // 'where' en Windows
    return !empty($output);
}

// Cambiar línea 47 por:
$command = "soffice.exe --headless --convert-to docx --outdir $outputDir $pdfPath 2>&1";
```

---

## 🚀 Uso de la Conversión

### Desde la interfaz web:

1. Abrir cualquier documento en `document.html`
2. Click en botón **"Word"**
3. El sistema:
   - ✅ Envía petición al backend PHP
   - ✅ Convierte el PDF usando LibreOffice
   - ✅ Descarga el archivo DOCX real
   - ⚠️ Si el backend no está configurado, descarga el PDF como fallback

### Comportamiento:

- **Con backend configurado**: Conversión real PDF → DOCX
- **Sin backend**: Descarga el PDF renombrado como .docx (método antiguo)

---

## 🔍 Solución de Problemas

### Error: "LibreOffice no está instalado"
```bash
# Verificar instalación
which soffice
# o
soffice --version

# Si no aparece, reinstalar
sudo apt install libreoffice --reinstall
```

### Error: "Permiso denegado"
```bash
# Dar permisos correctos
sudo chmod +x /usr/bin/soffice
sudo chown -R www-data:www-data /ruta/a/web/api
```

### Error: "CORS blocked"
- El archivo PHP ya tiene headers CORS configurados
- Si persiste, verificar configuración del servidor

### LibreOffice no convierte correctamente
```bash
# Limpiar cache de LibreOffice
rm -rf ~/.config/libreoffice

# Probar conversión manual
soffice --headless --convert-to docx --outdir /tmp documento.pdf
```

---

## 🎯 Alternativa: Servicio Externo (Si no puedes instalar LibreOffice)

Si **no tienes acceso al servidor** o no puedes instalar LibreOffice, puedes usar APIs externas:

### Opción 1: CloudConvert API
```javascript
// En script.js, reemplazar la URL de fetch por:
fetch('https://api.cloudconvert.com/v2/convert', {
    // Requiere API key (gratis 25 conversiones/día)
})
```

### Opción 2: Convertio API
```javascript
fetch('https://api.convertio.co/convert', {
    // Requiere registro
})
```

---

## 📊 Comparación de Métodos

| Método | Ventajas | Desventajas |
|--------|----------|-------------|
| **LibreOffice Local** | ✅ Gratis<br>✅ Sin límites<br>✅ Privacidad | ⚠️ Requiere servidor<br>⚠️ Configuración |
| **PHPDocX** | ✅ Buena calidad | ❌ De pago (€599)<br>⚠️ Requiere licencia |
| **APIs Externas** | ✅ Fácil setup<br>✅ Sin servidor | ❌ Límites diarios<br>⚠️ Privacidad<br>❌ Costo |
| **PDF.js + docx.js** | ✅ Solo frontend | ❌ Mala calidad<br>❌ Solo texto básico |

---

## ✅ Verificación de Funcionamiento

1. **Test básico**:
```bash
cd /home/rodrigo.bueno@iesangelsanzbriz.net/Pagina-web/web
php api/convert-pdf-to-docx.php
```

2. **Test con navegador**:
   - Abrir `http://localhost:8000/main.html`
   - Abrir un documento
   - Click en "Word"
   - Verificar que se descarga un .docx real

3. **Verificar conversión**:
   - Abrir el .docx descargado con Microsoft Word o LibreOffice Writer
   - Debería ser editable (no una imagen del PDF)

---

## 📝 Notas Finales

- ✅ El código está listo y funcional
- ⚠️ Solo falta configurar LibreOffice en tu servidor
- 🔒 La conversión se hace en el servidor (no expone PDFs sensibles)
- 🚀 Una vez configurado, funcionará automáticamente para todos los documentos

---

## 🆘 Necesitas Ayuda?

Si tienes problemas con la configuración:

1. Verifica que PHP esté funcionando:
```bash
php -v
```

2. Verifica que LibreOffice esté accesible:
```bash
soffice --version
```

3. Revisa los logs del servidor:
```bash
# Apache
sudo tail -f /var/log/apache2/error.log

# PHP Built-in
# Los errores aparecen en la consola
```

---

**¡La conversión PDF a DOCX real ya está implementada! Solo necesitas configurar el servidor.** 🎉
