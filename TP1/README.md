# Calculadora de Motores Pistoneros - Predimensionamiento Aeronáutico

Aplicación web simple para el predimensionamiento de motores alternativos pistoneros de uso aeronáutico con propósito pedagógico.

## Estructura del Proyecto

```
TP1/
├── index.html              # Página principal
├── general.css             # Estilos globales
├── behaviour.js            # Lógica y comportamiento de la aplicación
├── componentes/            # Carpeta para componentes reutilizables
│   ├── grafica-eficiencia.js    # Componente de ejemplo (gráficas)
│   ├── README.md                # Documentación de componentes
│   └── [otros componentes...]
└── README.md               # Este archivo
```

## Características Actuales

- **Interfaz amigable** con selección de ciclo termodinámico (Otto, Diesel, Sabathé)
- **Formulario parametrizado** para entrada de datos:
  - Cilindrada (cm³)
  - RPM
  - Relación de compresión
  - Número de cilindros
- **Cálculos básicos** como:
  - Potencia indicada
  - Eficiencia térmica
  - Temperatura máxima
  - Ciclos por minuto/segundo
- **Arquitectura modular** para agregar componentes (gráficas, tablas, etc.)

## Dependencias

Estas dependencias se cargan desde CDN (sin necesidad de instalación local):

- **jQuery 3.6.0**: Manipulación del DOM y eventos
- **Kendo UI 2024.1.319**: Widgets complejos y visualización de datos

## Cómo Utilizar

### Opción 1: Abrir en Navegador Directamente
1. Abrir `index.html` directamente en navegador web
2. No requiere servidor web

### Opción 2: Usar un Servidor Local (Recomendado para desarrollo)

**Con Python 3:**
```bash
python -m http.server 8000
```
Luego abrir: `http://localhost:8000`

**Con Node.js (http-server):**
```bash
npx http-server
```

## Flujo de Uso

1. Seleccionar tipo de ciclo (Otto, Diesel, Sabathé o Comparación)
2. Ingresar parámetros de entrada
3. Hacer clic en "Calcular"
4. Los resultados se mostrarán en la sección inferior

## Próximos Pasos de Desarrollo

- [ ] Implementar fórmulas de cálculo específicas por ciclo
- [ ] Agregar componentes de gráficas (relaciones de compresión, potencia, etc.)
- [ ] Validación avanzada de parámetros
- [ ] Exportación de resultados (PDF, CSV)
- [ ] Comparación detallada de ciclos
- [ ] Historial de cálculos

## Cómo Agregar Componentes

1. Crear un archivo `componentes/nombre-componente.js`
2. Definir un objeto con `init()` y `render()` 
3. Incluir el script en `index.html`
4. Ver `componentes/README.md` para detalles

## Notas Técnicas

- **Sin bundler**: No requiere webpack, gulp, etc.
- **Minimalista**: Solo lo esencial para funcionamiento pedagógico
- **Extensible**: Fácil de agregar nuevos cálculos y componentes
- **Offline-capable**: Fuera de línea una vez cargadas las dependencias

## Soporte y Documentación

Para modificaciones posteriores, ver:
- `general.css` - Estilos y estructura visual
- `behaviour.js` - Lógica de cálculos y comportamiento
- `componentes/README.md` - Guía para crear nuevos componentes

---

**Desarrollado para**: UTN - Año 2026
**Propósito**: Herramienta pedagógica de cálculo
