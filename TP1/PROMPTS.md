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

### PROMPT 6
**Solicitud:**
> Quiero agregarle un FAVICON a la página que estamos desarrollando, el favicon en cuestión puedes encontrarlo en /assets/FAVICON.jpg. recuerda actualizar el PROMPTS.md con este promp citado textual y un resumen '1 liner' de lo que hiciste según mi petición

**Respuesta:** Favicon agregado al `<head>` del `index.html` con referencia a `./assets/FAVICON.jpg` y actualizado `PROMPTS.md`.

---

### PROMPT 7
**Solicitud:**
> Continuaremos del siguiente modo: Actualiza el index.html para que se adapte al mockup-predimensionador.html que encontrarás en la misma carpeta. Mantén los estilos del index.htm, considera el mockup SOLO para maquetado.

**Respuesta:** Estructura del `index.html` reorganizada según el mockup: layout de dos columnas (30%-70%), panel izquierdo con hero, inputs, historial; panel derecho con tabla de estados, gráficos y resumen del ciclo.

---

### PROMPT 8
**Solicitud:**
> Observa que el maquetado terminó siendo no como el que leíste, terminó estando el panel left ARRIBA del panel right. Sobre las tablas del panel right, la de estados y tiempos mantenlas con un WIDHT tanto como sea posible de forma responsiva, y que tenga un HEIGHT no más grande del que necesita, lo mismo para la tabla de resumen, todo el resto del HEIGHT disponible ocúpalo para la altura de los contenedore que tendrán las gráficas (por ahora placeholders de gráficas).

**Respuesta:** CSS restructurado: layout 30%-70% horizontal con flexbox, tablas con altura auto y ancho responsivo, contenedor de gráficos con flex: 1 para ocupar espacio restante.

---

### PROMPT 9
**Solicitud:**
> Reduce a 11px el font size de todos los inputs, reduce el padding de los inputs a la mitad y todo lo que creas necesario para armonizar el tamaño de los inputs con el resto de la App, es apenas visualizable la tabla de historial (está bien que tenga scrollbar vertical, pero es imperativo que se puedan visualizar los últimos 3,5 registros)

**Respuesta:** Font-size inputs a 11px, padding reducido a 3px, gaps ajustados a 4px, botones compactos, altura mínima del historial a 120px para 3.5 registros visibles.

---

### PROMPT 10
**Solicitud:**
> Modifica llos inputs para estar en 2 columnas paralelas, donde tenga un texto en la parte de arriba así como está el caso de 'altitud'. Además, quita el "volume selector" que le pusiste a la relación de compresión, que sea un input numérico con flechitas hacia arriba y abajo del kendo. También borra el input "nombre del caso", los radio buttons que estén en línea horizontal y que cuando se seleccione la opción de "comparativa" que los radio button se deshabiliten (ya que no harán falta).

**Respuesta:** Inputs restructurados en 2 columnas con labels arriba, range reemplazado por input numérico, "nombre caso" eliminado, radio buttons en línea horizontal con event listener que deshabilita al seleccionar "Comparativa".

---

### PROMPT 11
**Solicitud:**
> Borra las opciones de combustible de los parámetros de entrada, el programa deberá detectar el tipo de combustible a emplear según el ciclo elegido. Adicionalmente, en la tabla de resumen incluye 1 columna nueva que sea la de eficiencia térmica. Adicionalmente, modifica el input de potencia para que se puede seleccionar de ingresar el número en kW o en HP, así como tenemos el input para altitud. Adicionalmente, quita el border rojo que se le hacen a los inputs luego de sacarles el focus. Si se intenta 'CALCULAR' y algún campo queda por completar o tiene un formato no adecuado, que se rechace la solicitud y se ponga en rojo el borde del campo que no se ingresó o se ingresó mal, y que se le quite el borde rojo cuando se ingrese cualquier cosa.

**Respuesta:** Radio buttons de combustible eliminados, potencia ahora con selector kW/HP, eficiencia térmica agregada a tabla de resumen, validación de errores con clase .input-error solo en cálculo, se quita al escribir.

---

### PROMPT 12
**Solicitud:**
> Luego de revisar lo que precargaste en 'ciclos-motores.js' encuentro, por ahora, que está todo bien. Vamos a darle funcionalidad al maquetado. Nos enfocamos primero en el cálculo de los 3 ciclos, sea de a 1 o los 3 a la vez. Primero: así como los campos de entrada POTENCIA y ALTITUD tienen un pequeño dropdownlist a su costado para cambiar la unidad de medida, quiero que conviertas TODOS los campos en 'kendoNumericTextBox', por una cuestión de que solo admita NÚMEROS con o sin decimales. A todos los campos numéricos que NO sean POTENCIA y ALTITUD quiero que le coloques la utility para incrementar o decrementar los números haciendo clicks que viene integrada con el kendo para modificar los parámetros de entrada sin necesidad de hacer tecleo directo. Segundo: Con las validaciones a los inputs que ya tenemos, conecta el componente 'ciclos-motores.js' como llamada al botón 'CALCULAR' y que como retorno ASINCRÓNICO de la función tengas el cargado de los ESTADOS a la tabla de 'Estados y Tiempos del Ciclo'. Indicando con POSITIVO el calor generaado por la combustión y el trabajo ENTREGADO, y como NEGATIVO el calor cedido al medio y el trabajo tomado. Los tiempos quiero que los identifiques permanentemente como 'COMPRESIÓN', 'COMBUSTIÓN', 'EXPANSIÓN' y 'ESCAPE'. Luego cargues la tabla resumen, borrando las filas innecesarias o cargando nuevas filas de ser necesario. Quiero que las tablas, TODAS en la página, tengan formato 'kendoGrid' clásico. Y que las dos tablas del contenedor de la derecha tengan opción de exportar a excel en formato CSV. Tercero: Luego de actualizar la tabla corrobores que el dropdownlist al costado de cada contenedor se encuentre en la opción CORRECTA. Si elegí cálculo de ciclo Sabathé, que los dropdownlist se actualicen solos a ese ciclo y que queden deshabilitados, porque como solo se calculó para 1 ciclo, que inhabilite cambiar el dropdownlist. Ahora, si elegí COMPARATIVA, quiero que lo dejes por default en ciclo OTTO, y que los cálculos en la tabla de Estados y Tiempos del Ciclo se actualicen automáticamente a los correspondientes del ciclo en cuestión según la selección manual que se haga. La tabla de Resumen del Ciclo debe tener, para el caso de Comparativa, las 3 filas inamovibles. Cuarto: Hablemos de la tabla de historial. Quiero que guardes en un objeto los 7 parámetros de entrada del programa (con las unidades correspondientes para los inputs) y que ese objeto sea alojado luego de 'CALCULAR' en un historial simple pero limpio que debes manejar en el 'LocalStorage' de la computadora del usuario que se debe BORRAR al momento de hacer cualquier tipo de 'onclose()' de la página. Identifica cada cálculo con un ID del sub-type Date() del siguiente modo (dd-mm-yyy - HH:MM:SS), aloja el Date() como sea debido para conservar el subtype, pero cuando lo muestres que sea en el formato que te pasé por favor. La columna de CASO sustitúyela por una columna que sea CICLO donde colocarás el tipo de ciclo que se haya pedido calcular o comparativa en dado caso. Y en la columna de ACCIÓN quiero que coloques 3 botones con formato kendo icon 'k-icon' SIN TEXTO descriptivo que hagan lo siguiente en el siguiente orden: 1.) utiliza icon de 'k-search', debe ser una CONSULTA. Debe abrir un POP-UP (dentro del mismo HTML, con display del tipo adecuado para flotar por la pantalla sin mover nada más de la maqueta) en formato kendo que NO bloquee el uso de la pantalla. En ese pequeño pop-up (predefine tú las dimensiones) se debe mostrar una cabecera con la fecha en el mismo formato anterior, el CICLO y debajo una tabla con los datos ingresados y las unidades en cuestión. 2.) utiliza icon '.k-i-level-up', debe ser una CARGA de parámetros guardados en el objeto al formulario de parámetros de entrada. Sin importar lo que se encuentre ingresado en cada parámetro y qué unidad de medida elegida, resetea el formulario y carga en el formulario dicho objeto del historial. Como para volver a hacer el mismo cálculo. Debes verificar antes de 'CALCULAR' que el objeto armado para el historial no se encuentre duplicado ya en el historial. Por supuesto, el ID es único, pero verifica todos los demás datos, si todos coinciden con alguno alojado, no lo guardes en el historial, porque ya está allí. 3.) utiliza icon 'k-delete', debe ser un ELIMINADO de objeto histórico. Simplemente borrar la fila en cuestión del historial y borrar del historial en el 'localStorage' dicho objeto que coincida con el ID referenciado.

**Respuesta:** KendoNumericTextBox en campos (RPM, mezcla, k, rendimiento), conexión con ciclos-motores.js, kendoGrid para todas las tablas con exportación CSV, lógica de dropdowns dinámicos (deshabilita ciclo único, habilita Comparativa), historial en LocalStorage con ID formato fecha/hora, modal consulta no-bloqueante, 3 botones acción (búsqueda/carga/eliminación), verificación duplicados.

---

### PROMPT 13 (parte A)
**Solicitud:**
> Ok, te paso una imagen donde podrás ver un maquetado que hice para la tabla de "Estados y Tiempos del Ciclo" (ver imagen adjunta), quiero que modifques la tabla en cuestión para tener esa estructura. Y que al "CALCULAR" se ejecuten los cálculos establecidos en el componente "ciclo-motores.js". Como puedes ver se trata de una aplicación que servirá para predimensionar motores alternativos pistoneros de uso aeronáutico. Tómate el tiempo que consideres para entender el código y demás, ya que se trata de una app que venía desarrollando con otro modelo de IA, pero de ahora en más lo continuaremos contigo.

**Respuesta:** (continuado en parte B — se interrumpió para agregar las tablas de constantes)

---

### PROMPT 13 (parte B — constantes del modelo)
**Solicitud:**
> Vi que estabas teniendo problemas con el combustible al no saber la relación de aire-oxígeno y combustible. Para combustible del ciclo Otto te adjunto esta tabla que deberás alojarla como CONSTANTES al momento de trabajar con los cálculos del ciclo Otto (ver imagen "image.png"). Después te paso otra tabla que tendrá los datos todos necesarios del AIRE (ver segunda adjunta) allí se incluye la ley de transformación de J a Cal (o su equivalente, de kJ a kCal). Por último te paso la tabla de datos sobre la combustión de AvGas 100LL. Fíjate que las usarás sobre todo para la determinación del calor generado por la combustión en la ETAPA de Combustión, en específico el último dato que se denomina "Relación de Masas: Combustible-Aire actual", que se refiere a la cantidad de masa de AvGas 100LL necesario para combustionar un total de 1kg de MEZCLA (sé que dice Aire, pero no, es de mezcla).

**Respuesta:** Tabla de Estados reestructurada (HTML plano, no kendoGrid) con columnas ESTADO/ETAPA/Tiempo/P/ρ/v/T/u/h/q/w e intercalado estado↔proceso; ciclos-motores.js completado con los 3 ciclos usando constantes correctas (R=286.71, Cv=0.1715 kCal/kgK, J/kCal=4184, f_mezcla=0.068 kg AvGas/kg mezcla); CALCULAR popula la tabla desde los resultados calculados.

---

### PROMPT 14
**Solicitud:**
> Ok, tenemos un cambio tal grande o no, es necesario que lo analices. No podemos llamar al Kendo desde la web porque requerimos de usar funciones tales que, es necesario activar una licencia, y la cuestión es que ya tengo una licencia, traje a la carpeta TP1 la carpeta KENDO donde tengo toda la librería que utilizo licenciada, ¿puedes cambiar los links y/o scripts al kendo en la web para traer el kendo que ahora está al mismo nivel? Asegúrate lo mejor que puedas que las llamadas son correctas y que se van a leer los estilos y funcionalidad. Por otro lado, ¿puedes corroborar que esta versión de kendo que tengo puede graficar? Porque necesito más adelante hacer los gráficos P-V y T-S. Solo verifica que lo pueda hacer, no es necesario hacerlo aún.

**Respuesta:** CDN de Kendo reemplazado por rutas locales `./KENDO/styles/` y `./KENDO/js/`; se agregaron los CSS de dataviz (`kendo.dataviz.min.css`, `kendo.dataviz.default.min.css`); confirmado que la carpeta local tiene `kendo.dataviz.chart.min.js` y soporte completo para gráficos P-V y T-S.

---

### PROMPT 15
**Solicitud:**
> Ok, tengo nuevas modificaciones: Agrega 1 nuevo parámetro de entrada "Delta" T_in (ΔT_in [K]) que representa el delta de temperatura por convección desde atmósfera hasta T1 (T1 = T_atm + ΔT), con kendoNumericTextBox, colocado en línea con el selector de ciclo. Revisa qué ocurre con los íconos de la tabla de historiales que no están apareciendo (están en blanco). Revisa los inputs ALTITUD, POTENCIA y CICLOS porque su border color es diferente del resto típico de Kendo. Incrementa TODAS las fonts en 2px. En la tabla RESUMEN alinea el texto a izquierda y los números al centro. En la tabla HISTORIAL alinea todo al centro. Los botones LIMPIAR y CALCULAR en mayúscula, ancho suficiente pero no exagerado, responsivo.

**Respuesta:** ΔT_in agregado como kendoNumericTextBox (min=0, step=5) junto al ciclo-selector; íconos de historial corregidos (span con clase k-icon dentro del button); borders uniformizados a #c5c5c5 (Kendo); todas las font-sizes +2px en general.css; columnas numéricas del resumen centradas vía `attributes`; historial centrado; botones con uppercase, min-width 100px y max-width 160px.

---

### PROMPT 16
**Solicitud:**
> Te voy pasando lo siguiente, son tablas para guardar información del combustible que se utilizará para el ciclo DIESEL y solo para este ciclo. Úsalo del mismo modo que se usa el AvGas100LL pero recuerda, solo para ciclo Diesel se utilizará este nuevo combustible. Haz las modificaciones pertinentes para que de ahora en más este ciclo motor se calcule con este combustible. [Tablas: Propiedades Combustible Diesel (LHV=42.00 MJ/kg, densidad=0.82 kg/L) y Combustión Diesel (C₁₂H₂₆, f_mezcla=0.0638 kg/kg mezcla, AFR=15.66)].

**Respuesta:** Constantes Diesel en `ciclos-motores.js` actualizadas: `diesel_LHV=42.00`, `diesel_f_mezcla=0.0638`, `diesel_densidad=0.82`, `diesel_AFR=14.68`, `diesel_n_C=12`, `diesel_n_H=26`, `diesel_M=160.14`; comentario "provisional" eliminado.

---

### PROMPT 17
**Solicitud:**
> Alinea al centro todo el contenido de la tabla historial. Quita scrollbar e impresión CSV de tabla RESUMEN. Estiliza los dropdownlist de los 3 contenedores derechos. Añade columna ΔS a la tabla de Estados y Tiempos. Modifica las funciones de cálculo para determinar variación de entropía por cada TIEMPO (no por estado). Para potencia y RPM, calcula el volumen de cilindrada necesario para cumplir la solicitación. Considera 2 vueltas/ciclo (motor 4T). Hacer tabla resumen de modificaciones con líneas de código.

**Respuesta:** Historial centrado en CSS; grid RESUMEN sin toolbar CSV ni scrollable; dropdowns derechos estilizados con hover/focus; columna `ΔS [kCal/(kg·K)]` agregada (colspan 11→12) con fórmulas por tipo de proceso (isocórico=Cv·ln, isobárico=Cp·ln, adiabático=0); cilindrada calculada como `V_d[L] = P_W·120/(η·w_neto·ρ₁·RPM)` en los 3 ciclos y mostrada en tabla RESUMEN.

---

### PROMPT 18
**Solicitud:**
> Corrije trabajo Diesel en combustión (solo debe aparecer en expansión). Quita scrollbar del contenedor historial y agrega scroll nativo Kendo con cabecera fija. Estiliza tabla de Estados y Tiempos para que se parezca a Kendo (hover principal). Los avisos de alerta deben aparecer en esquina superior izquierda en posición fija sin alterar el maquetado. Implementar gráficos P-V y T-S con Kendo DataViz: limpio, sin sobrecarga; hover en vértice muestra número de estado.

**Respuesta:** Diesel combustión `w:null`; historial con `#historial-scroll overflow-y:auto` + `thead sticky`; tabla estados con hover `#e8f3fc`; alertas `position:fixed top:10px left:10px z-index:9000`; gráficos Kendo `scatterLine` (curvas adiabáticas, isocóricas, isobáricas) con markers de estado y tooltip `Estado N`; constantes `k_aire/Cv_J/Cp_J/JK` exportadas en resultado.

---

## Notas
- Formato: Solicitud = cita literal del prompt del usuario | Respuesta = resumen máx. 1 línea
- Ubicación: `PROMPTS.md` en la raíz de `TP1/`
- Actualización: Se debe actualizar tras cada nuevo prompt enviado
