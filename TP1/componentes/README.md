# Carpeta de Componentes

Esta carpeta contiene componentes reutilizables para la calculadora de motores pistoneros.

## Estructura

Cada componente debe ser un archivo JavaScript independiente que siga este patrón:

```javascript
const NombreComponente = {
    init: function() {
        // Inicializar el componente
    },
    
    render: function() {
        // Renderizar el HTML
        // Usar jQuery para insertar en #componentes-section
    },
    
    // Otros métodos según sea necesario
};

$(document).ready(function() {
    NombreComponente.init();
});
```

## Componentes Actuales

### grafica-eficiencia.js
Ejemplo de componente que muestra una gráfica comparativa de eficiencias térmicas.
Utiliza Kendo UI Charts para la visualización.

## Cómo Crear un Nuevo Componente

1. **Crear el archivo**: `componentes/nombre-componente.js`
2. **Definir la estructura**: Crear un objeto con métodos `init()`, `render()` y otros métodos específicos
3. **Agregar a index.html**: Incluir el script en el HTML
4. **Inicializar**: Llamar a `NombreComponente.init()` en el `$(document).ready()` del componente

## Ejemplo de Integración en index.html

```html
<!-- Dentro de <head> -->
<script src="componentes/grafica-eficiencia.js"></script>
<!-- O al final antes de </body> -->
```

## Dependencias Disponibles

- **jQuery**: Para manipulación del DOM y eventos
- **Kendo UI**: Para widgets complejos como gráficos, tablas interactivas, etc.

## Notas

- Los componentes deben inyectar su HTML en el elemento `#componentes-section`
- Usar clases CSS definidas en `general.css` para mantener consistencia visual
- Mantener el código modular y reutilizable
- Documentar métodos principales con comentarios JSDoc
