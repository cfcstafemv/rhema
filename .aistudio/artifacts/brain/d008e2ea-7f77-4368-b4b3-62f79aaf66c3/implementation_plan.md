# Rhema — Lienzo y Notas Creativas de Prédica

Plataforma web devocional y creativa para capturar, estructurar y profundizar en las enseñanzas y prédicas dominicales mediante un lienzo interactivo de tarjetas flotantes conectadas a las Escrituras, resaltado cromático por versículos o palabras clave, reflexiones personales, modo culto sin distracciones y exportación visual para compartir.

---

### Decisiones Confirmadas del Usuario y Criterios Clave

> [!IMPORTANT]
> **Opciones confirmadas por el usuario en Fase 1:**
> - **Visor Bíblico Integrado**: Selector canónico completo (Antiguo y Nuevo Testamento) con navegación por libros, capítulos y versículos interactivos para selección y resaltado palabra por palabra.
> - **Lienzo Interactivo de Tarjetas Flotantes**: Espacio infinito con paneo y zoom, tarjetas movibles con arrastre fluido, puntos de conexión visual (hilos SVG dinámicos que atan versículos a tarjetas) y organización por jerarquía.
> - **Herramientas Adicionales Seleccionadas**: Exportación de resumen visual de la prédica en imagen (PNG) y documento imprimible (PDF/Print), junto a un Modo Presentación / Santuario libre de distracciones con tipografía amplia para el servicio de adoración.

---

## 1. Visión del Producto y Experiencia de Usuario

### 1.1 ¿Qué es Rhema?
Un santuario digital de notas vivas para la congregación, líderes y pastores. Transforma el acto tradicional de tomar notas lineales en una experiencia visual bidireccional donde la Escritura bíblica y las revelaciones pastorales se entrelazan mediante conexiones visuales, tarjetas temáticas y aplicaciones para la vida diaria.

### 1.2 Flujo de Usuario Principal
1. **Inicio de Servicio / Prédica**:
   - Registro de metadatos del sermón: Título de la prédica, predicador/pastor, serie temática y fecha del servicio.
2. **Selección y Lectura Bíblica**:
   - Selector intuitivo de libros (Génesis a Apocalipsis), capítulos y versículos con textos en español (RVR1960).
   - Posibilidad de resaltar versículos enteros o seleccionar palabras clave dentro de un versículo con paleta de estudio bíblico (Mensaje Central, Mandato, Promesa, Revelación, Reflexión).
3. **Creación y Vinculación de Tarjetas en el Lienzo**:
   - Arrastrar o hacer clic en "Vincular a nueva tarjeta" desde cualquier versículo o palabra resaltada.
   - Tipos de tarjetas: *Mensaje Central*, *Punto Doctrinal / Exposición*, *Cita Cruzada*, *Ilustración Pastoral*, *Aplicación Práctica*.
   - Los hilos visuales (cables curvos SVG con terminaciones armónicas) unen los versículos de origen con las tarjetas flotantes en tiempo real mientras el usuario las mueve.
4. **Espacio de Reflexión Personal**:
   - Cajón devocional desplegable con secciones guiadas: *¿Qué me habló Dios hoy?*, *Petición de Oración vinculada*, *Acción concreta para esta semana*.
5. **Modo Culto / Santuario**:
   - Oculta controles de edición y herramientas complejas con un clic o tecla de acceso rápido (`Esc`), ofreciendo un modo de lectura inmersivo de alto contraste para congregaciones con poca luz.
6. **Exportación y Compartición**:
   - Generación instantánea de una ficha o infografía de resumen visual de la prédica, ideal para enviar al grupo de conexión por WhatsApp, redes o imprimir.

---

## 2. Arquitectura de Diseño y Estética Visual

### 2.1 Identidad y Atmósfera
- **Estilo**: *Archival Paper & Sacred Typography* — Inspirado en códices y biblias de estudio contemporáneas, con fondo de papel alabastro cálido (`#FBF9F5` / `#F8F6F0`) en modo claro y pizarra litúrgica profunda (`#0F1115` / `#161922`) en modo santuario.
- **Paleta Cromática (60-30-10)**:
  - *60% Neutro Alabastro / Carbón*: Fondos de lienzo limpios con textura sutil de cuadrícula de puntos suave.
  - *30% Superficies Estructurales*: Tarjetas de pergamino suave con bordes hairline (`border-stone-200 dark:border-stone-800`), sombras sutiles de elevación única.
  - *10% Acentos Cromáticos Bíblicos*:
    - **Ámbar / Oro Litúrgico (`#D97706` / `#F59E0B`)**: Mensaje Central & Tema Rector.
    - **Lapislázuli Profundo (`#2563EB` / `#3B82F6`)**: Promesa Divina & Citas Bíblicas.
    - **Esmeralda Oliva (`#059669` / `#10B981`)**: Mandato & Aplicación Práctica.
    - **Terracota / Rosa Antiguo (`#BE185D` / `#E11D48`)**: Reflexión & Movimiento del Espíritu.
    - **Púrpura Amatista (`#7C3AED` / `#8B5CF6`)**: Palabra Clave Original (Hebreo/Griego).

### 2.2 Tipografía
- **Titulares y Citas Bíblicas**: Tipografía Serif clásica y honorable (`Playfair Display` o `Cinzel` / `Cormorant Garamond` vía Google Fonts).
- **Cuerpo y UI**: Sans-serif editorial de alta legibilidad (`Plus Jakarta Sans` / `DM Sans`).
- **Métricas y Versículos**: Cifras tabulares limpias (`tabular-nums`) para números de versículos y marcas de tiempo.

---

## 3. Decisiones Técnicas y de Producto

- **Lienzo Infinito y Tarjetas Flotantes**:
  - Implementación con coordenadas espaciales relativas $(x, y)$, pan/zoom mediante eventos de ratón/táctil, drag & drop fluido sin dependencias pesadas e inestables.
  - Conexiones dinámicas renderizadas a través de un `<svg className="absolute inset-0 pointer-events-none">` que calcula curvas Bézier (`path d="M x1 y1 C ... x2 y2"`) entre el versículo ancla y la tarjeta anclada.
- **Banco Bíblico Integrado y Búsqueda**:
  - Catálogo de libros bíblicos (Pentateuco, Históricos, Poéticos, Profetas, Evangelios, Epístolas, Apocalipsis) con capítulos y pasajes canónicos precargados en memoria local, con selector intuitivo de capítulo y versículo.
  - Capacidad de ingresar o buscar cualquier texto bíblico adicional con formateo automático de versículos.
- **Persistencia Local Robusta**:
  - `localStorage` con estructura de base de datos sincronizada (`RhemaSermonStore`) que autoguarda cada pulsación de tecla, tarjeta movida, color seleccionado y reflexión sin perder el trabajo si se recarga la página.
- **Exportación Visual**:
  - Generación de resumen imprimible y formateado en HTML5/Canvas compatible con captura de imagen directa o ventana de impresión estilizada para PDF.

---

## 4. Diagrama de Arquitectura y Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RHEMA WORKSPACE BAR                             │
│   [Título del Sermón]  ·  [Predicador / Fecha]  ·  [Modo Culto] [Export]│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     VISOR BÍBLICO INTERACTIVO │         │   LIENZO INFINITO DE NOTAS    │
│  - Selector de Libros/Caps    │         │  - Tarjetas flotantes (Drag)  │
│  - Versículos con números     │ ──────> │  - Mensaje principal          │
│  - Resaltador multi-color     │ [Hilos] │  - Ilustraciones y puntos     │
│  - Selección de palabras clave│   SVG   │  - Aplicaciones a la vida     │
└──────────────┬────────────────┘         └──────────────┬────────────────┘
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             PANEL LATERAL: DIARIO Y REFLEXIONES PERSONALES             │
│   - ¿Qué me dijo Dios?  ·  Petición de oración  ·  Compromiso semanal │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Fases de Ejecución Tras Aprobación

1. **Configuración Base y Tipografía**: Integración de fuentes editoriales sagradas, Tailwind v4 `@custom-variant dark`, y tokens de color alabastro/piedra litúrgica.
2. **Motor de Datos Bíblicos y Estado**: Definición de tipos de datos (`Sermon`, `BiblePassage`, `Highlight`, `FloatingCard`, `ConnectionLink`, `Reflection`) y almacenamiento en `localStorage`.
3. **Visor Bíblico Interactivo**: Construcción del lector de escrituras con selector de testamento/libro/capítulo, visor de versículos numerados y barra flotante de selección de palabras y colores.
4. **Lienzo de Tarjetas Flotantes y Conectores SVG**: Sistema de posicionamiento de tarjetas arrastrables, cálculo de líneas Bézier que siguen a las tarjetas en movimiento y edición de contenido en tiempo real.
5. **Cajón de Reflexiones Personales**: Formulario guiado devocional para compromisos espirituales y peticiones.
6. **Modo Santuario & Generador de Resumen Visual**: Vista de pantalla completa limpia y exportador a formato gráfico/imprimible.
7. **Verificación y Pulido**: Compilación, validación sin errores de TypeScript y pruebas de contraste.
