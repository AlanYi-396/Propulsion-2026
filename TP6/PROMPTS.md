\# PROMPTS.md



\## Prompt 1

> "Fantástico. Con todo lo recaudado hasta ahora, resolvé las siguientes imágenes. Tené en cuenta el nombre de cada archivo: primero Ejercicio 5A, luego 5B, tercero 5C y último 5D."



\### Resumen de respuesta

Desarrollé un script integral en Python para resolver el ciclo real del turborreactor (estaciones A a j).

Calculé las magnitudes de remanso, los rendimientos isentrópicos, la velocidad del chorro y el empuje específico.

Generé los gráficos correspondientes al diagrama T-s de remanso y las curvas de rendimiento propulsivo.

Expliqué el comportamiento termodinámico y el efecto de la velocidad de vuelo sobre la eficiencia propulsiva.



\---



\## Prompt 2

> "Bien, excelente. Te voy a pasar una sucesión de códigos, denominados Ejercicio1 al 5, cada uno de Python. Tu objetivo es consolidarlos a todos de forma tal que cada uno quede correctamente delimitado, pero si tienen parámetros compartidos, se declare inicialmente y se llame cuando sea necesario. El código debe estar comentado de forma tal que un tercero no involucrado en la confección del código pueda entender qué hace cada parte del código a nivel programa, y también debe tener comentarios explicando lo que ocurre en cada parte del código a nivel teórico.

> El código consolidado debe incluir todos los gráficos que cada uno de los códigos genera, cada gráfico (o gráficos, si son del mismo ejercicio) debe contar con su propia ventana; o, preferiblemente, se debe poder explotar cada ejercicio en una misma ventana con un sistema de flechas de avance y retroceso. Si es necesario, incorporar otro tipo de librería para permitirlo.

> ¿Querés hacer alguna pregunta antes de que te envíe los códigos?"



\### Resumen de respuesta

Evalué los requerimientos para la integración de los códigos correspondientes a los Ejercicios 1 al 5.

Propuse el uso de la librería interactiva `matplotlib.widgets.Button` para la navegación por botones.

Formulé tres preguntas clave sobre la interfaz, la declaración de variables y la modularidad del script.

Establecí las bases para estructurar y documentar el código tanto a nivel funcional como teórico.



\---



\## Prompt 3

> "Interfaz: sí, me parece bien.

> Gestión: prefiero todas las variables declaradas al principio.

> Estructura: un único archivo .py que incluya todo lo que los códigos muestran.

> 

> Procedo a enviar los códigos. Recordá seguir el orden del nombre de cada archivo, 1, 2, 3, 4 y 5."



\### Resumen de respuesta

Consolidé los cinco ejercicios en un único script de Python orientado a objetos con interfaz interactiva.

Declaré todos los parámetros globales al inicio del programa para optimizar el uso de memoria.

Implementé un sistema de navegación por botones para explorar los diagramas en una misma ventana.

Añadí comentarios explicativos detallados sobre la lógica de programación y el sustento termodinámico.



\---



\## Prompt 4

> "¿Me puedes generar un "PROMPTS.md" que contenga enlistados todos y cada uno de los prompts que se realizaron LITERALMENTE? Quiero que estén citados los prompts y que por cada uno de ellos añadas una respuesta de tu parte que resuma brevemente en 3-4 líneas lo que hiciste en respuesta del prompt."



\### Resumen de respuesta

Recopilé la totalidad de las peticiones realizadas por el usuario de forma exacta y literal.

Elaboré el archivo `PROMPTS.md` organizando las solicitudes en orden cronológico.

Añadí por cada prompt un resumen estructurado de exactamente cuatro líneas sobre el trabajo realizado.

Sinteticé las soluciones de código, análisis termodinámicos e interfaces gráficas desarrolladas.



\---



\## Prompt 5

> "Toma de referencia el proyecto en la carpeta TP1 en su estructura, estilos y demás (calculadora de motores a pistón). En vez de tener un script denominado "ciclos-motores.js", tengamos un script denominado "ciclo-joule-brayton.js" que contenga el modelo matemático en JS que quiero que consideres el "EjercicioFinal.py" para extraer las funciones del modelo matemático. Luego nos ocuparemos de los inputs y outputs, eso por ahora copialo y pégalo, luego modificamos en detalle los parámetros de entrada y los parámetros, tablas y gráficas de salida."



\### Resumen de respuesta

Repliqué en TP6 la estructura de TP1 (`index.html`, `general.css`, `behaviour.js`, `assets/`), referenciando Kendo desde `../TP1/KENDO` para no duplicar 236 MB.

Creé `componentes/ciclo-joule-brayton.js` con el objeto `CicloJouleBrayton`: una función por ejercicio del `.py` (ciclo simple, análisis paramétrico, regeneración, postcombustión y turborreactor).

Los datos del `.py` quedaron como valores por defecto en `datosBase` y las curvas se devuelven como puntos `{x, y}` para Kendo.

Verifiqué numéricamente el modelo JS contra las fórmulas del `.py` con Node y Python.



\---



\## Prompt 6

> "Necesito que adaptes el modelo matemático de "turboreactor real" alojado en "ciclo-joule-brayton.js" para que pueda resolver los cálculos de un turboreactor real, en sus estados de modo que los inputs que se ingresarán por pantalla sean:

> 1. Altitud de vuelo [h] (considera el modelo ISA que hallas en el TP1 para la determinación de parámetros termodinámicos solo con la altitud).

> 2. Velocidad de la corriente libre [V0] antes del entrar al difusor. Estado 0.

> 3. Relación de Compresión [RC].

> 4. Velocidad de entrada al compresor [V1], la velocidad a la cual el Difusor debe bajar la velocidad para que entre adecuadamente al compresor.

> 5. Porcentaje de pérdida de presión en cámara de combustión [Δpcc]. Dado en unidades: ej. 4%.

> 6. Rendimiento del Difusor [ηd]. Declarado en el fuente, línea 74, como "eta_difusor" con valor hardcodeado.

> 7. Rendimiento del Compresor [ηc]. Declarado en el fuente, línea 76, como "eta_compresor" con valor hardcodeado.

> 8. Rendimiento de la Turbina [ηT]. Declarado en el fuente, línea 78, como "eta_turbina" con valor hardcodeado.

> 9. Rendimiento de la Tobera [ηtob]. Declarado en el fuente, línea 79, como "eta_tobera" con valor hardcodeado.

> 10. Potencia [W], este valor es crítico ingresarlo para determinar y resolver el modelo.

> 

> Con esos valores de entrada, haciendo la hipótesis de que tendremos 1 solo eje (1 sola etapa de compresión y 1 sola etapa de turbina). Considera para la combustión el siguiente combustible:

> - n-cetano C16H34, Hc = 43,0 MJ/kg

> 

> Revisa el modelo que necesitamos automatizar en función de esos 10 parámetros de entrada. Si falta algo más sugiérelo."



\### Resumen de respuesta

Reescribí `turborreactor()` para resolver los estados 0, 1, 2, 3, 4 y j (estáticos y de remanso) con ISA de TP1, difusor de V0 a V1, 1 eje ((1+f)·wT·ηm = wC) y tobera adaptada.

Agregué la estequiometría del n-cetano (AFR = 14,67), el dosado por balance completo y salidas de ṁa, ṁf, empuje, TSFC, áreas de paso y rendimientos térmico, propulsivo y global.

La potencia fija el caudal de aire según `tipo_potencia` (empuje, eje o chorro) y se validan los casos inválidos con mensajes claros.

Sugerí agregar T3 (T límite), ηcomb, ηm y definir el significado de "Potencia"; advertí que la tobera queda bloqueada si fuera convergente.



\---



\## Prompt 7

> "Ahora considerando los nuevos parámetros de entrada mencionados, actualiza el "index.html" para que esos sean los nuevos parámetros de entrada.

> 

> Para esta calculadora (TP6) borra y deshaste de toda la funcionalidad y maqueta del historial de cálculos.

> 

> Conserva la lógica de formato de inputs que tenemos ahora. Que se pueda ingresar altitud en pies o m, la potencia en kW y HP y que todos los rendimientos mencionados tengan las flechas hacia arriba y hacia abajo que modifican de +-0,05 el valor numérico."



\### Resumen de respuesta

Reemplacé el formulario de `index.html` por los 10 parámetros nuevos: altitud (m/ft) y potencia (kW/HP) con el parseo de TP1, y V0, V1, RC, Δpcc y rendimientos como NumericTextBox de Kendo (rendimientos con paso ±0,05).

Eliminé el historial completo: tarjeta, modal, lógica en `behaviour.js` (localStorage, botones, consulta) y sus estilos en `general.css`.

Reescribí `obtenerParametros`, `validarParametros` y `limpiarFormulario`; "Calcular" invoca `CicloJouleBrayton.calcular('turborreactor', …)` y por ahora muestra el resultado en consola.



\---



\## Prompt 8

> "Este parámetro [ηcomb] es este otro que te mencioné 

> Δpcc Cámara [%]. Así que lo tenemos cubierto.

> 

> ηm = 1,0; ¿a qué se refiere?

> 

> T3 es la Tlímite [Tlim], inclúyelo también como parámetro de entrada.

> 

> Sutituye la imagen de cabecera "lycoming-engine.jpg" por "jt15d.webp" en su aspect ratio natural, que entre en el porcentaje del panel que le correspodne."



\### Resumen de respuesta

Aclaré que ηcomb (fracción de Hc liberada) y Δpcc (pérdida de presión total) son pérdidas distintas; ηcomb quedó fijo en 0,97.

Expliqué que ηm es el rendimiento mecánico de la transmisión turbina → compresor en el eje (1,0 = sin pérdidas).

Agregué T_lím [K] como input (paso ±10 K) conectado a `T3` del modelo.

Reemplacé la cabecera por `<img>` de `jt15d.webp` al ancho del panel con su aspect ratio natural y eliminé la copia de `lycoming-engine.jpg` de TP6.



\---



\## Prompt 9

> "Agrega los siguientes "placeholders" a cada input:

> 1. Corriente libre: 250.

> 2. V1: 150.

> 3. RC: 8.

> 4. Δpcc Cámara [%]: 4.

> 5. Tlím Entrada turbina [K]: 1.150.

> 6. Rend. Difusor (ηd): 0,92.

> 7. Rend. Compresor (ηc): 0,85.

> 8. Rend. Turbina (ηT): 0,91.

> 9. Rend. Tobera (ηtob): 0,95."



\### Resumen de respuesta

Agregué el atributo `placeholder` a los 9 inputs con los valores indicados.

Kendo NumericTextBox toma el placeholder del elemento, por lo que se ve dentro de cada caja vacía.

Son solo texto guía: un campo vacío sigue fallando la validación.



\---



\## Prompt 10

> "Observa el archivo "PROMPTS.md" que se ubica en la carpeta TP6. Quiero que añadas allí los prompts que te he pasado hasta ahora (citados literalmente), con una respuesta de tu parte de máximo 4-5 filas sobre lo que hiciste en consecuencia del prompt.

> 

> A partir de ahora, todo prompt que te haga, inclúyelo allí del modo descrito a menos que te diga lo contrario. Esta informacíon puedes contarla como contexto que debe estar presente en cada agente de ser posible."



\### Resumen de respuesta

Añadí a `TP6/PROMPTS.md` los prompts 5 a 10 citados literalmente, cada uno con su resumen, respetando el formato existente.

Registré la regla en un `CLAUDE.md` en la raíz del repositorio (lo leen todas las sesiones y agentes) y en la memoria persistente.

A partir de ahora cada prompt se agregará aquí salvo indicación contraria.



\---



\## Prompt 11

> "Incluye CLAUDE.md al .gitignore por favor"



\### Resumen de respuesta

Creé un `.gitignore` en la raíz del repositorio (no existía) con la entrada `/CLAUDE.md`.

Verifiqué con `git check-ignore` que `CLAUDE.md` queda excluido del control de versiones.
