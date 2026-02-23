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

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Procesamiento de Documentos**:
  - `pdf.js` para archivos PDF.
  - `mammoth` para archivos Word.
  - `xlsx` para hojas de cálculo.
  - `tesseract.js` para OCR.
- **Exportación**:
  - `jspdf` para informes PDF.
  - `docx` para informes Word.

## 📂 Estructura del Proyecto

```text
/
├── src/
│   ├── components/      # Componentes UI reutilizables
│   ├── services/        # Lógica de procesamiento y exportación
│   ├── types.ts         # Definiciones de tipos TypeScript
│   ├── App.tsx          # Componente principal
│   ├── index.tsx        # Punto de entrada de React
│   └── index.css        # Estilos globales (Tailwind)
├── public/              # Archivos estáticos
├── index.html           # Plantilla HTML principal
├── vite.config.ts       # Configuración de Vite
└── package.json         # Dependencias y scripts
```

## 📄 Licencia

Este proyecto es de uso privado y profesional. Todos los derechos reservados.
