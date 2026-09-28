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



\---



\## Prompt 12

> "Trabajaremos ahora con el panel derecho de la aplicación. Empecemos por la tabla "Estados y Tiempos del Ciclo", elimina todas las referencias y funcionalidad sobre el cambio de ciclo, solo calcularemos Joule-Brayton.

> 

> La estructura de la tabla consérvala idéntica.

> 

> Prepara los procesos internos para que al "CALCULAR" con los parámetros que se le pasen resuelvan el modelo matemático y carguen en dicha tabla los valores correspondientes de cada tiempo, calor entregado por la combustión, el trabajo entregado por la turbina y el empuje entregado en el último tiempo considerando un nuevo parámetro de entrada que será "velocidad de salida de tobera [Vj]". Calcule el empuje como caudal másico por velocidad."



\### Resumen de respuesta

Consulté y se definió: la Vj ingresada reemplaza a la calculada (η_tob se deduce y se advierte si supera 1), empuje neto E = ṁa·(Vj − V0) y ṁa fijado por la potencia de empuje W = E·V0.

Agregué el input Vj [m/s] y adapté el modelo (validación Vj > V0, Vj máxima isentrópica, advertencias).

Quité de la tabla el selector y toda la lógica de cambio de ciclo; conserva sus 12 columnas y ahora tiene 6 estados (0, 1, 2, 3, 4, j) y 5 tiempos (Difusor, Compresión, Combustión, Expansión, Tobera).

"Calcular" llena la tabla con P, ρ, v, T, u, h y ΔS por estado; q de combustión, w de compresor y turbina, y el empuje E [N] en el tiempo de tobera.



\---



\## Prompt 13

> "Ahora incluye la ejecución del modelo matemático con el botón CALCULAR. Deja la tabla armada desde un inicio, vacía de datos, pero que esté la estructura"



\### Resumen de respuesta

Detecté que en la rama TP6 no existe `TP1/KENDO`: Kendo no cargaba, la inicialización se cortaba y ni la tabla vacía ni "Calcular" funcionaban.

Copié desde la rama TP1 solo lo que usa la página (script, 4 hojas de estilo, fuentes, texturas y tema Default: 13 MB en vez de 236 MB) a `TP6/KENDO` y apunté `index.html` a `./KENDO/`.

Reordené `inicializarApp()` para construir la tabla vacía y enlazar los eventos antes que los controles de Kendo.

Verifiqué en Chrome: al abrir aparece la tabla con sus 6 estados y 5 tiempos vacíos, y "Calcular" la completa con los resultados del modelo.



\---



\## Prompt 14

> "Hay unas cosas de los resultados que no nos convencen en la tabla de estados y tiempos, por favor revisa el ejercicio 5 de "EjercicioFinal.py", el modelo que se debe aplicar en la aplicación web es el de un turboreactor real."



\### Resumen de respuesta

Comparé el modelo web con el Ej. 5 y detecté que el empuje salía siempre E = W/V0 (independiente del motor) por definir W = E·V0, además de diferencias en dosado, turbina y tobera.

Consulté y se definió: Vj calculada con ηtob como el .py (se quitó el input Vj), potencia de turbina W = ṁa·wT para el caudal y tabla con magnitudes como el .py (0 y j estáticas, 1–4 de remanso).

Alineé cámara (f = cp(To3−To2)/(ηcomb·Hc)) y turbina (ΔT = wC/cp) con el .py; con V1 → 0 el modelo reproduce el Ej. 5 (To4 = 875,6 K, Vj = 730,4 m/s).

La tabla indica "Estática"/"Remanso" en cada estado; verificado en Chrome (E = 1.750 N con 1.000 kW).



\---



\## Prompt 15

> "Campo	Valor	Origen

> Altitud	35.000 ft	Estimado: crucero típico de un jet ejecutivo

> Potencia turbina	730 kW	Calculado para dar el caudal real del núcleo (ver abajo)

> V0	184 m/s (≈ 357 kt, Mach 0,62)	Estimado: crucero típico del Citation I

> V1	150 m/s	Estimado: Mach ≈ 0,5 a la entrada del compresor

> RC	10	Dentro del rango publicado de 7,4 a 12,6

> Δp cámara	4 %	Estimado

> T límite	1.200 K	Estimado: motores pequeños de los años 70

> ηd	0,92	Estimado

> ηc	0,80	Estimado: compresor centrífugo pequeño, algo menos que un axial

> ηT	0,88	Estimado

> ηtob	0,95	Estimado

> 

> Considera esta tabla de datos de entrada para el motor de referencia, haz que estos valores sean los nuevos placeholders de los inputs. Incluye en el modelo matemático la inclusión del Fan, haz que el bypass ratio sea un input de entrada e indica como placeholder el bypass ratio del modelo de referencia. El objetivo es acercar el modelo lo más posible a la realidad que acercarnos al empuje real del motor."



\### Resumen de respuesta

Actualicé los placeholders con los datos del JT15D-1A (altitud en ft por defecto) y agregué el input "Bypass ratio (BPR)" con placeholder 3,3.

Extendí el modelo a turbofán de flujos separados: fan (η_fan = 0,85) desde el estado 1, turbina que acciona compresor y fan (wT = wC + BPR·wF), tobera fría y empuje E = ṁc·(Vj − V0) + ṁb·(Vjf − V0); el FPR se elige como el óptimo de empuje. Con BPR = 0 vuelve al turborreactor del .py.

La tabla suma la corriente secundaria (1-f, f, f-jf, jf) y una fila Total con BPR, FPR, caudal y empuje.

En crucero el empuje pasa de 1.571 N (solo núcleo) a 2.177 N; en despegue aproximado da 8,1 kN contra 9,79 kN reales, con caudal total de 34 kg/s que coincide con los 75 lb/s publicados.



\---



\## Prompt 16

> "Para gases aguas abajo de la cámara de combustión utiliza una coeficiente a presión constante (Cp) más adecuado a las temperaturas alcanzadas, lo mismo para el Gamma.

> 

> Por otro lado, la inclusión del Fan con su bypass ratio la requerimos solo para la determinación del empuje. Más adelante solicitaremos unas gráficas del turboreactor que NO deben tomar en cuenta la exitencia del fan."



\### Resumen de respuesta

Agregué propiedades de gases de combustión (cp = 1,148 kJ/(kg·K), γ = 1,333) para cámara, turbina y tobera; el calor pasa a q = cp_gas·To3 − cp·To2 y u, h de los estados 3, 4 y j usan esas propiedades.

Consulté y se definió: tabla y futuras gráficas con el turborreactor puro (la turbina solo mueve al compresor) y el fan resuelto aparte, solo para el empuje.

Separé el modelo: ciclo del turborreactor (estados, procesos, curvas) y objeto `empuje` con el turbofán (FPR óptimo, Ec + Ef); quité las filas del fan y la fila Total informa BPR, FPR, caudal, empuje sin fan y E total.

Con el JT15D-1A: crucero 2.308 N (1.645 N sin fan) y despegue aproximado 8,56 kN, el 87 % de los 9,79 kN reales.



\---



\## Prompt 17

> "¿Qué valores de entrada ingresas para probar la aplicación y que el empuje te devuevla: 8.563 N? Estoy probando la aplicación y con los valores sugeridos en los placeholders me devuelve un empuje de 2.304 N con Fan y 1.645,3 N sin fan. De todas las condiciones la más comaprable con datos reales es el despeje a sea lvl con ISA. Revísalo por favor."



\### Resumen de respuesta

Aclaré que los placeholders son el caso de crucero (2.308 N) y que los 8.563 N venían de un despegue aproximado con V0 = V1 = 30 m/s, forzado porque la app exigía V0 > 0 y V1 ≤ V0.

Habilité el despegue estático real: V0 = 0 permitido y la toma de aire acelera de V0 a V1 con pérdida (ηd = (T0 − T1)/(T0 − T1s), po1 < p0) cuando V1 > V0.

A nivel del mar ISA, V0 = 0, V1 = 150 m/s y potencia 2.672 kW (caudal de núcleo publicado de 7,93 kg/s) el empuje es 9.375 N (95,8 % de los 9.790 N reales), con ṁ total 34,1 kg/s y FPR 1,476; verificado en Chrome.



\---



\## Prompt 18

> "Perfecto, ahora actualiza los placeholders a los del test en sea lvl para despegue"



\### Resumen de respuesta

Cambié los placeholders al despegue estático a nivel del mar ISA: altitud 0 (unidad m por defecto), potencia 2.672 kW y V0 = 0; el resto (V1 150, RC 10, Δp 4 %, T límite 1.200 K, BPR 3,3 y rendimientos) ya coincidía.

Actualicé también los valores por defecto del modelo (h = 0 m, V0 = 0) para que coincidan con los placeholders; con ellos el empuje es 9.375 N.



\---



\## Prompt 19

> "Implementa la opción 1 entonces, pero actualiza los placeholders del siguiente modo que para condición de despegue a sea lvl y crucero a 35.000 tengamos ambas opciones para probar y corroborar los datos: Ej. de altitud: 0ft - 35.000ft; y para el caudal lo mismo, ya mencionaste el caudal a sea lvl despegue, calcula el caudal equivalente en vuelo crucero con la potencia que calculaste y deja el placeholder del caudal en el mismo formato que la altitud. Lo mismo para la corriente libre y la velocidad de entrada al compresor."



\### Resumen de respuesta

Reemplacé el input de potencia por "Caudal de aire SL" (kg/s o lb/s, dato del fabricante: 34 kg/s = 75 lb/s); el modelo lo lleva a la condición de vuelo con caudal corregido constante ṁ = ṁ_SL·δ1/√θ1 y lo reparte en núcleo y bypass con el BPR. La potencia de turbina pasa a ser un resultado.

Consulté y se definió que el caudal ingresado es el de nivel del mar en ambos casos, porque el de crucero (11,4 kg/s, equivalente a los 730 kW) lo calcula el modelo; por eso su placeholder es "Ej: 34 - 34".

Placeholders con formato despegue - crucero: altitud "0 - 35.000" (ft por defecto), V0 "0 - 184" y V1 "150 - 150".

Verificado en Chrome: despegue SL 9.232 N (ṁ 33,6 kg/s) y crucero a 35.000 ft 2.302 N (ṁ 11,4 kg/s).



\---



\## Prompt 20

> "[Imagen adjunta: diagrama T-s de referencia "Problema 5 — Turborreactor: ciclo real (magnitudes de remanso)"] Ahora vamos con los gráficos que se construyen. Serán 2 gráficos nada más, vamos con el primero (Quita los gráficos que están ahora y las viejas referencias con los modelos matemáticos de los pistoneros, y deja las maquetas para 2 gráficos que ocupen todo el espacio ancho disponible):

> 

> Te adjunto una gráfica de referencia, que es la misma gráfica que genera el ejercicio 5 del "EjercicioFinal.py". Se trata del diagrama T-S del ciclo del turboreactor REAL. Desde su estado "A" hasta "j". Para el formato básate en el gráfico T-S de los pistoneros implementados en el TP1 pero utiliza el modelo de Joule-Brayton real."



\### Resumen de respuesta

Quité los gráficos P-V, T-S y η vs r de los pistoneros con sus selectores de ciclo y el código asociado (series Otto/Diesel/Sabathé, curvas de rendimiento y funciones de cilindrada/disposición), y dejé 2 tarjetas de gráfico que ocupan todo el ancho.

Implementé el diagrama T-s del turborreactor real (sin fan) de A a j con el estilo de TP1 (tema oscuro, estados amarillos con tooltip) y lo de la referencia: un color por componente con leyenda, etiquetas A, 01…04, j e isobaras punteadas (p0 y po3).

Agregué las isobaras al modelo (`curvas.isobaras`), cada tramo con las propiedades de su fluido para pasar exactamente por sus estados; ejes redondeados a la grilla. Verificado en Chrome en despegue SL y crucero a 35.000 ft.



\---



\## Prompt 21

> "[Imagen adjunta: gráfico de referencia "Empuje, rendimiento propulsivo y potencia de empuje según la velocidad de vuelo"] Vamos con el segundo gráfico, que también te adjunto imagen y como referencia también tienes el ejercicio 5 del "EjercicioFinal.py" que también construye esta gráfica.

> 

> Se trata de una gráfica de Empuje, Rendimiento Propulsivo y Potencia de empuje según velocidad de vuelo adimensionalizada (V0/Vj)."



\### Resumen de respuesta

Implementé el segundo gráfico con las curvas del Ej. 5: Eₛ/Vⱼ = 1 − ν, ηₚ = 2ν/(1 + ν) y Pₑ/(ṁ·Vⱼ²) = ν·(1 − ν) en función de ν = V₀/Vⱼ, con la leyenda de fórmulas y los colores de la referencia adaptados al tema de TP1.

Agregué los puntos notables con sus anotaciones (punto fijo, máxima potencia en ν = 0,5 y V₀ → Vⱼ); el barrido del modelo ahora arranca en ν = 0.

Las curvas se ven desde el inicio y al calcular se marca el punto de operación del turborreactor sin fan (línea vertical y un punto por curva con tooltip); en crucero a 35.000 ft da ν = 0,229, ηₚ = 0,372. Verificado en Chrome.



\---



\## Prompt 22

> "Estás precargando una gráfica en la segunda, revisa si no las estás construyendo desde los cálculos hechos por vez, por oprimido el botón CALCULAR. ¿No estarás precargando en esa gráfica el gráfico del "EjercicioFinal.py"?"



\### Resumen de respuesta

Confirmé la precarga: no era el gráfico del .py, pero el segundo gráfico corría el modelo por su cuenta con los valores por defecto (al abrir y en cada cálculo) y tenía los puntos notables fijados en el código.

Lo reescribí para que, igual que el diagrama T-s, arranque con ejes vacíos y construya todo desde el resultado de "Calcular": curvas de `resultado.curvas.propulsivas`, puntos notables leídos de esas curvas (máximo de potencia, extremos) y punto de operación.

Ahora la única llamada al modelo es la del botón. Ajusté los ejes vacíos de ambos gráficos para que conserven el estilo antes del primer cálculo; verificado en Chrome.
