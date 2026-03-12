# DocSearch Pro v4.0

DocSearch Pro es una herramienta avanzada de búsqueda y análisis de documentos diseñada para procesar archivos locales (PDF, DOCX, XLSX, TXT) de forma rápida y segura, directamente en el navegador.

## 🚀 Características Principales

- **Búsqueda Multiformato**: Soporte nativo para archivos PDF, Word (.docx), Excel (.xlsx, .xls) y Texto Plano (.txt).
- **Análisis Inteligente**: Extracción automática de metadatos como la Fecha de Emisión y Número de Resolución.
- **Búsqueda Avanzada**: Soporte para múltiples términos de búsqueda y expresiones regulares (Regex).
- **Privacidad Total**: El procesamiento se realiza localmente en el navegador; los documentos nunca se suben a un servidor externo.
- **Exportación Profesional**: Generación de informes detallados en formatos PDF, Word (Docx) y CSV (Excel).
- **Interfaz Moderna**: Diseño limpio con soporte para Modo Oscuro y visualización de estadísticas en tiempo real.
- **OCR Integrado**: Capacidad de procesar PDFs escaneados mediante reconocimiento óptico de caracteres.

## 🔍 Uso de Expresiones Regulares (REGEX)

El sistema permite realizar búsquedas potentes utilizando Regex. Una expresión regular es una secuencia de caracteres que conforma un patrón de búsqueda.

### 🛠️ Herramientas de Ayuda Regex (Novedad v4.0)
Para facilitar el uso de patrones complejos, la aplicación incluye un **Asistente de Regex** avanzado:
- **Validador en Tiempo Real**: Análisis instantáneo de la validez del patrón con descripción de errores.
- **Probador (Sandbox)**: Área de pruebas interactiva para validar patrones contra textos reales antes del procesamiento.
- **Biblioteca de Presets**: Colección de patrones optimizados para documentos normativos (CUIT, Resoluciones, Fechas, Importes).
- **Explicador Dinámico Inteligente**: Desglose estructurado que interpreta y explica cada componente de la expresión (Límites, Cuantificadores, Aserciones, etc.) facilitando el aprendizaje y la depuración.

### Ejemplo de Expresión Mixta:
`\b(?<![0-9/])0*4\s*[-/]\s*2014\b; sumatoria; banco; bank; leasing`

Esta expresión combina un patrón **REGEX** con **términos literales**, separados por punto y coma (`;`):

1.  **Patrón REGEX (`\b(?<![0-9/])0*4\s*[-/]\s*2014\b`)**:
    -   `\b`: Asegura que la coincidencia sea una palabra completa.
    -   `(?<![0-9/])`: (Lookbehind negativo) Evita que el patrón coincida si hay un número o barra antes (ej. evita coincidir en "10/04/2014").
    -   `0*4`: Busca el número 4, permitiendo ceros a la izquierda (ej. "4" o "04").
    -   `\s*[-/]\s*`: Busca un guion o una barra inclinada, permitiendo espacios opcionales alrededor.
    -   `2014`: Busca el año 2014.
    -   *En resumen*: Busca menciones a "04-2014" o "4/2014" que no formen parte de una fecha más larga.

2.  **Términos Literales**: `sumatoria`, `banco`, `bank`, `leasing`. Estos se buscan exactamente como están escritos (insensible a mayúsculas).

## 📷 Limitaciones del OCR

El Reconocimiento Óptico de Caracteres (OCR) es una tecnología potente pero dependiente de la calidad de la fuente:

-   **Calidad de Imagen**: Si el documento escaneado tiene baja resolución, ruido digital o manchas, la precisión del texto extraído disminuirá significativamente.
-   **Gráficos y Tablas**: El OCR puede tener dificultades para interpretar texto dentro de gráficos complejos o tablas con bordes poco definidos.
-   **Fuentes No Estándar**: Tipografías muy estilizadas o texto manuscrito pueden generar errores de lectura.
-   **Inclinación**: Documentos escaneados con una inclinación excesiva pueden afectar la detección de líneas de texto.

## 🛡️ Tratamiento de Logos y Ruido

La aplicación incluye un sistema de filtrado inteligente para elementos gráficos recurrentes y metadatos de paginación que no forman parte del contenido normativo:

- **Filtrado de Logo "comarb"**: Se ha implementado un tratamiento específico para el logo de la Comisión Arbitral. El sistema detecta y elimina automáticamente cualquier ocurrencia de la palabra "comarb" generada por el motor de OCR o presente en la capa de texto.
- **Filtrado de Números de Página**: Se eliminan automáticamente las referencias a números de página aislados (ej. "Página 1", "Pag. 2" o números solitarios en una línea) para evitar que interfieran en la extracción de contexto.
- **Preservación de Continuidad**: Al ignorar estos elementos, el motor de búsqueda asegura que el texto que precede y subsigue al logo o número de página se analice como una unidad continua, evitando falsos negativos o fragmentación de hallazgos.
- **Tratamiento Multicapa**: El logo es ignorado tanto en la extracción de texto nativo como en el procesamiento por OCR.

## 📊 Resumen de Hallazgos (Novedad v4.1)

Para una mayor precisión en el análisis, el sistema ahora separa el contador de términos **DETECTADOS** en dos categorías, basándose en la proximidad y el contexto:

- **DETECTADOS, sin computar el contexto**: Este contador refleja únicamente las ocurrencias principales (triggers). No computa las repeticiones que aparecen dentro del radio del contexto configurado para un hallazgo principal. Es ideal para conocer la cantidad exacta de "puntos de interés" únicos.
- **DETECTADOS, computando las repeticiones dentro del contexto**: Este contador mantiene la lógica tradicional, sumando todas las apariciones de los términos buscados, incluso si se encuentran dentro del bloque de contexto de otro hallazgo.

Esta distinción permite al analista diferenciar entre la cantidad de "lugares" donde se halló información y la "densidad" total de menciones de los términos.

> **Nota sobre Proximidad de Términos**: Si un mismo término hallado se repite muy cercanamente al término original (dentro del radio de contexto configurado), parte del contexto que rodea al término aparecerá duplicado en el reporte, ya que cada ocurrencia genera su propio bloque de hallazgo independiente para garantizar la trazabilidad individual. Los nuevos contadores de la v4.1 ayudan a interpretar esta redundancia necesaria.

## 📁 Formato de Exportación CSV

El archivo CSV generado incluye una columna `Path_Nombre_Archivo` con una fórmula de hipervínculo optimizada para entornos locales:
`=HYPERLINK("C:\Users\vn\Desktop\resoluciones\archivo.pdf"; "archivo.pdf")`

Esto permite la apertura directa de los documentos desde Excel si se encuentran en la ruta especificada.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Procesamiento de Documentos**:
  - pdf.js para archivos PDF.
  - mammoth para archivos Word.
  - xlsx para hojas de cálculo.
  - tesseract.js para OCR.
- **Exportación**:
  - jspdf para informes PDF.
  - docx para informes Word.

## 📄 Licencia

Este proyecto se encuentra amparado bajo los términos de la licencia MIT.
