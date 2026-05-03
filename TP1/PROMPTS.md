# HISTORIAL DE PROMPTS

## Registro de Solicitudes y Respuestas

---

### PROMPT 1
**Solicitud:**
> En esta carpeta te pido crear una estructura simple para una página web que solo implemente JQuery y Kendo (para JQuery, por supuesto) como dependencias adicionales. Quiero 1 "index.html", 1 "general.css" y 1 "behaviour.js" para ingresar modificaciones particulares que se realicen a posteriori, quiero 1 carpeta de "componentes" que luego poblaremos con componentes como "gráficas" y otras cosas. El objetivo es tener una página web simple, no necesariamente deployable en la web, ni compilable necesariamente (no quiero dependencias innecesarias, lo mínimo indispensable para tener una utilidad de uso pedagógico), que servirá como calculadora para predimensionar motores alternativos pistoneros de uso aeronáutico, razón por la cual la calculadora deberá recibir parámetros de entrada (incluyendo una indicación sobre el tipo de ciclo: Otto, Diesel y Sabathé; o todos para comparación). Pero todo esto último lo profundizaremos más adelante, por ahora requerimos que se entienda la idea.

**Respuesta:** Estructura creada con `index.html`, `general.css`, `behaviour.js`, carpeta `componentes/` con ejemplo de componente, y documentación completa (README, PROMPTS).

---

### PROMPT 2
**Solicitud:**
> Vamos a trabajar ahora en los parámetros de entrada que te voy a ingresar. Por ahora no modifiques ni armes modelos matemáticos para calcular los ciclos motores. Necesito ingresar los siguientes parámetros de entrada: Altitud (ingreso números, quiero que parsees el número de forma automática con puntos de separadores de miles y comas para decimales, admite ingreso en metros, pies o km, con un pequeño embebido dropDownList donde pueda elegir la unidad de medida). Potencia requerida (número parseado automáticamente del mismo modo, en kW). Combustible (acá no elabores mucho aún, deja un texto, luego lo desarrollamos). mezcla relativa (Parseado automáticamente del mismo modo, número adimensional). RPM (parseado automáticamente, número adimensional). k del aire, placeholder de 1,4 pero modificable (número adimensional, no parseado). rendimiento mecánico (parseado automáticamente, número adimensional, permite estrictamente números de 1 a 0 SIN incluir los límites). Y deja el selector de ciclo así como lo tienes.

**Respuesta:** Formulario parametrizado con parseado automático (puntos/comas), dropdown de altitud, validaciones estrictas por campo, y manejo robusto de ingreso con formato internacional.

---

### PROMPT 3
**Solicitud:**
> Vamos a trabajar ahora en el modelo matemático para el cálculo de los ciclos motores mencionados, crea 1 '.js' en la carpeta 'componentes' que admita los siguientes parámetros de entrada: Tipo de ciclo (1 palabra identificadora máximo sin carácteres especiales. Ejemplo: otto, diesel, sabathe). Todos los parámetros de entrada necesarios para modelizar. Requerimos que el componentes esté modularizado en 3 funciones, 1 por cada ciclo a calcular, con 1 'return' dentro de cada función (los parámetros de salida por ahora déjalo como NULL, está por definirse). Antes de continuar vamos a revisionar a mano el modelo matemático que generes.

**Respuesta:** Archivo `ciclos-motores.js` creado con estructura modular: función `calcular()` distribuidora, función `calcularCondicionesAtmosfericas()` (ISA), y 3 funciones específicas (Otto, Diesel, Sabathé) con retornos estructurados y placeholders documentados.

---

### PROMPT 4
**Solicitud:**
> Te voy a pedir que crees un archivo en la carpeta denominado 'PROMPTS.md' donde alojarás el historial de prompts que hemos enviado con una 'respuesta' de tu parte resumida que no supere 1 línea. Siempre que enviemos otro prompt a partir de ahora, actualiza por favor el .md en cuestión para mantener una trazabilidad

**Respuesta:** Archivo `PROMPTS.md` creado en `componentes/` con historial de 4 prompts y estructura de actualización.

---

### PROMPT 5
**Solicitud:**
> Ok, tenemos un problema con el 'prompts.md', necesitamos que: 1.) el archivo se encuentre en la carpeta padre, la 'TP1'. 2.) necesito que la **solicitud** de cada prompt sea CITADA de lo que se envío, no un resumen. El resumen debe venir de tu respuesta.

**Respuesta:** Archivo reubicado a carpeta raíz `TP1/` con solicitudes citadas literalmente y respuestas resumidas en línea única.

---

## Notas
- Formato: Solicitud = cita literal del prompt del usuario | Respuesta = resumen máx. 1 línea
- Ubicación: `PROMPTS.md` en la raíz de `TP1/`
- Actualización: Se debe actualizar tras cada nuevo prompt enviado
