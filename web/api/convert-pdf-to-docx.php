<?php
/**
 * API para convertir PDF a DOCX usando LibreOffice
 * 
 * Requisitos:
 * - PHP 7.4+
 * - LibreOffice instalado en el servidor
 * - Permisos de ejecución para el usuario de PHP
 * 
 * Instalación de LibreOffice:
 * Ubuntu/Debian: sudo apt-get install libreoffice
 * CentOS/RHEL: sudo yum install libreoffice
 */

// Configuración de headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejo de preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Use POST.']);
    exit;
}

// Función para verificar si LibreOffice está instalado
function checkLibreOffice() {
    $output = shell_exec('which soffice 2>&1');
    return !empty($output);
}

// Función para convertir PDF a DOCX
function convertPdfToDocx($pdfPath, $outputDir) {
    // Escapar rutas para seguridad
    $pdfPath = escapeshellarg($pdfPath);
    $outputDir = escapeshellarg($outputDir);
    
    // Comando de conversión usando LibreOffice
    $command = "soffice --headless --convert-to docx --outdir $outputDir $pdfPath 2>&1";
    
    // Ejecutar comando
    $output = shell_exec($command);
    
    return $output;
}

try {
    // Verificar si LibreOffice está instalado
    if (!checkLibreOffice()) {
        throw new Exception('LibreOffice no está instalado en el servidor. Por favor, instálelo primero.');
    }
    
    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['documentName'])) {
        throw new Exception('Falta el nombre del documento');
    }
    
    $documentName = $data['documentName'];
    
    // Sanitizar nombre del documento
    $documentName = preg_replace('/[^a-zA-Z0-9\s\-_\(\)\[\]áéíóúÁÉÍÓÚñÑ]/u', '', $documentName);
    
    // Rutas
    $documentsDir = realpath(__DIR__ . '/../documents');
    $tempDir = sys_get_temp_dir();
    
    // Buscar el archivo PDF
    $pdfFiles = [
        $documentName . '.pdf',
        $documentName,
    ];
    
    $pdfPath = null;
    foreach ($pdfFiles as $filename) {
        $testPath = $documentsDir . '/' . $filename;
        if (file_exists($testPath)) {
            $pdfPath = $testPath;
            break;
        }
    }
    
    if (!$pdfPath || !file_exists($pdfPath)) {
        throw new Exception('Archivo PDF no encontrado: ' . $documentName);
    }
    
    // Verificar que es un PDF
    if (mime_content_type($pdfPath) !== 'application/pdf') {
        throw new Exception('El archivo no es un PDF válido');
    }
    
    // Convertir
    $result = convertPdfToDocx($pdfPath, $tempDir);
    
    // Generar nombre del archivo DOCX
    $docxFilename = pathinfo($pdfPath, PATHINFO_FILENAME) . '.docx';
    $docxPath = $tempDir . '/' . $docxFilename;
    
    // Verificar que se creó el archivo
    if (!file_exists($docxPath)) {
        throw new Exception('Error en la conversión. Output: ' . $result);
    }
    
    // Leer el archivo convertido
    $docxContent = file_get_contents($docxPath);
    
    if ($docxContent === false) {
        throw new Exception('No se pudo leer el archivo convertido');
    }
    
    // Eliminar archivo temporal
    unlink($docxPath);
    
    // Enviar el archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . $docxFilename . '"');
    header('Content-Length: ' . strlen($docxContent));
    
    echo $docxContent;
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'documentName' => isset($documentName) ? $documentName : 'desconocido'
    ]);
    exit;
}
