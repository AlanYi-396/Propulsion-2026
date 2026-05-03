/**
 * BEHAVIOUR.JS
 * Calculadora de Motores Pistoneros - Predimensionamiento Aeronáutico
 * 
 * Este archivo contiene la lógica de comportamiento de la aplicación.
 */

$(document).ready(function() {
    // --- VARIABLES GLOBALES ---
    let cicloSeleccionado = null;
    const ciclosDisponibles = {
        'otto': 'Ciclo Otto',
        'diesel': 'Ciclo Diesel',
        'sabath': 'Ciclo Sabathé',
        'comparacion': 'Comparación de Ciclos'
    };

    // --- INICIALIZACIÓN ---
    inicializarEventos();

    /**
     * Inicializa los event listeners
     */
    function inicializarEventos() {
        // Botones de selección de ciclo
        $(document).on('click', '.btn-ciclo', function() {
            const ciclo = $(this).data('ciclo');
            seleccionarCiclo(ciclo);
        });

        // Botón de calcular
        $(document).on('click', '#btn-calcular', function(e) {
            e.preventDefault();
            realizarCalculo();
        });

        // Reset del formulario
        $(document).on('click', '.btn-secondary', function() {
            limpiarFormulario();
        });

        // Campos con parseado automático
        $(document).on('input', '.parseado', function() {
            parsearNumeroAutomatico($(this));
        });

        // Validación de rendimiento mecánico
        $(document).on('blur', '#rendimiento-mecanico', function() {
            validarRendimientoMecanico($(this));
        });

        // Validación general de parámetros
        $(document).on('change', '#parametros-form input, #parametros-form select', function() {
            validarCampo($(this));
        });
    }

    /**
     * Selecciona el ciclo termodinámico
     * @param {string} ciclo - Código del ciclo (otto, diesel, sabath, comparacion)
     */
    function seleccionarCiclo(ciclo) {
        cicloSeleccionado = ciclo;

        // Actualizar visualización de botones
        $('.btn-ciclo').removeClass('active');
        $(`.btn-ciclo[data-ciclo="${ciclo}"]`).addClass('active');

        console.log(`Ciclo seleccionado: ${ciclosDisponibles[ciclo]}`);
    }

    /**
     * Parsea un número automáticamente permitiendo puntos de miles y comas para decimales
     * Entrada: "2.500,5" → Salida: 2500.5
     * @param {jQuery} $input - Elemento input a parsear
     */
    function parsearNumeroAutomatico($input) {
        let valor = $input.val().trim();
        
        if (valor === '') return;

        // Remover espacios
        valor = valor.replace(/\s/g, '');

        // Detectar si la coma es separador de decimales o miles
        // Si hay punto y coma: el punto es separador de miles
        // Si solo hay coma: es separador de decimales
        // Si solo hay punto: es separador de decimales
        
        if (valor.includes('.') && valor.includes(',')) {
            // Caso: 2.500,5 → 2500.5
            valor = valor.replace(/\./g, '').replace(',', '.');
        } else if (valor.includes(',') && !valor.includes('.')) {
            // Caso: 2500,5 → 2500.5
            valor = valor.replace(',', '.');
        } else if (valor.includes('.') && !valor.includes(',')) {
            // Ambiguo: 2500.5 podría ser 2500.5 o 2.5005
            // Seguimos formato internacional: si hay un punto al final, es decimal
            // Si hay más de un punto, el último es decimal
            const partes = valor.split('.');
            if (partes.length === 2) {
                // Un solo punto: asumir decimal
                valor = parseFloat(valor);
            } else {
                // Múltiples puntos (poco probable)
                valor = valor.replace(/\.(?=.*\.)/g, '').replace('.', '.');
            }
        }

        // Validar que sea un número válido
        const numero = parseFloat(valor);
        if (isNaN(numero)) {
            $input.css('border-color', '#ff6b6b');
            return;
        }

        // Mantener el valor limpio en el input para edición
        $input.css('border-color', '#ddd');
    }

    /**
     * Valida un campo individual
     * @param {jQuery} $campo - Campo a validar
     */
    function validarCampo($campo) {
        const id = $campo.attr('id');
        const valor = $campo.val().trim();

        // Campos opcionales
        if (id === 'combustible' || id === 'k-aire') {
            $campo.css('border-color', '#ddd');
            return;
        }

        // Campos requeridos - validar que no estén vacíos
        if (valor === '') {
            $campo.css('border-color', '#ff6b6b');
            return;
        }

        // Campos numéricos - convertir a número
        const numero = convertirANumero($campo);
        
        if (numero === null) {
            $campo.css('border-color', '#ff6b6b');
            return;
        }

        // Validaciones específicas
        if (id === 'rendimiento-mecanico') {
            if (numero <= 0 || numero >= 1) {
                $campo.css('border-color', '#ff6b6b');
                return;
            }
        }

        // Si todo está bien
        $campo.css('border-color', '#ddd');
    }

    /**
     * Valida específicamente el rendimiento mecánico (0 < η < 1)
     * @param {jQuery} $input - Campo de rendimiento mecánico
     */
    function validarRendimientoMecanico($input) {
        const numero = convertirANumero($input);
        
        if (numero === null) {
            mostrarAlerta('Rendimiento: ingresa un número válido', 'error');
            $input.css('border-color', '#ff6b6b');
            return;
        }

        if (numero <= 0 || numero >= 1) {
            mostrarAlerta('Rendimiento mecánico debe estar entre 0 y 1 (sin incluir los límites)', 'error');
            $input.css('border-color', '#ff6b6b');
        } else {
            $input.css('border-color', '#ddd');
        }
    }

    /**
     * Convierte un valor string a número parseando puntos de miles y comas
     * @param {jQuery} $input - Input element
     * @returns {number|null} Número parseado o null si es inválido
     */
    function convertirANumero($input) {
        let valor = $input.val().trim();
        
        if (valor === '') return null;

        // Remover espacios
        valor = valor.replace(/\s/g, '');

        // Parsear según formato
        if (valor.includes('.') && valor.includes(',')) {
            // Formato: 2.500,5
            valor = valor.replace(/\./g, '').replace(',', '.');
        } else if (valor.includes(',') && !valor.includes('.')) {
            // Formato: 2500,5
            valor = valor.replace(',', '.');
        }

        const numero = parseFloat(valor);
        return isNaN(numero) ? null : numero;
    }

    /**
     * Realiza el cálculo de predimensionamiento
     */
    function realizarCalculo() {
        // Validar que se haya seleccionado un ciclo
        if (!cicloSeleccionado) {
            mostrarAlerta('Selecciona un tipo de ciclo antes de calcular', 'warning');
            return;
        }

        // Obtener parámetros del formulario
        const parametros = obtenerParametros();

        // Validar parámetros
        if (!parametrosValidos(parametros)) {
            mostrarAlerta('Completa todos los parámetros correctamente', 'error');
            return;
        }

        // Mostrar resultado de recopilación de datos
        console.log('Parámetros recopilados:', parametros);
        mostrarAlerta('Parámetros recopilados correctamente. Próximamente se implementarán los cálculos.', 'success');
        mostrarParametrosRecopilados(parametros);
    }

    /**
     * Obtiene los parámetros del formulario
     * @returns {object} Objeto con los parámetros de entrada
     */
    function obtenerParametros() {
        const parametros = {
            altitud: {
                valor: convertirANumero($('#altitud')),
                unidad: $('#unidad-altitud').val()
            },
            potencia: convertirANumero($('#potencia')),
            combustible: $('#combustible').val().trim(),
            mezlaRelativa: convertirANumero($('#mezcla-relativa')),
            rpm: convertirANumero($('#rpm')),
            kAire: convertirANumero($('#k-aire')),
            rendimientoMecanico: convertirANumero($('#rendimiento-mecanico')),
            ciclo: cicloSeleccionado
        };

        return parametros;
    }

    /**
     * Valida que los parámetros sean válidos
     * @param {object} parametros - Parámetros a validar
     * @returns {boolean} true si los parámetros son válidos
     */
    function parametrosValidos(parametros) {
        // Validar que altitud, potencia, mezcla, rpm y rendimiento sean números válidos
        if (parametros.altitud.valor === null || parametros.altitud.valor < 0) {
            mostrarAlerta('Altitud: valor inválido o negativo', 'error');
            return false;
        }

        if (parametros.potencia === null || parametros.potencia <= 0) {
            mostrarAlerta('Potencia: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.combustible === '') {
            mostrarAlerta('Combustible: campo requerido', 'error');
            return false;
        }

        if (parametros.mezlaRelativa === null || parametros.mezlaRelativa <= 0) {
            mostrarAlerta('Mezcla relativa: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.rpm === null || parametros.rpm <= 0) {
            mostrarAlerta('RPM: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.kAire === null || parametros.kAire <= 0) {
            mostrarAlerta('k del aire: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.rendimientoMecanico === null || 
            parametros.rendimientoMecanico <= 0 || 
            parametros.rendimientoMecanico >= 1) {
            mostrarAlerta('Rendimiento mecánico: debe estar entre 0 y 1 (sin incluir los límites)', 'error');
            return false;
        }

        return true;
    }

    /**
     * Muestra los parámetros recopilados en la sección de resultados
     * @param {object} parametros - Parámetros recopilados
     */
    function mostrarParametrosRecopilados(parametros) {
        const $resultadosSection = $('#resultados-section');
        const $resultadosContainer = $('#resultados-container');

        $resultadosContainer.empty();

        // Ciclo seleccionado
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Ciclo Seleccionado</label>
                <div class="valor">${ciclosDisponibles[parametros.ciclo]}</div>
            </div>`
        );

        // Altitud
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Altitud</label>
                <div class="valor">${parametros.altitud.valor.toFixed(2)}<span class="unidad">${parametros.altitud.unidad}</span></div>
            </div>`
        );

        // Potencia
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Potencia Requerida</label>
                <div class="valor">${parametros.potencia.toFixed(2)}<span class="unidad">kW</span></div>
            </div>`
        );

        // Combustible
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Combustible</label>
                <div class="valor">${parametros.combustible}</div>
            </div>`
        );

        // Mezcla Relativa
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Mezcla Relativa (λ)</label>
                <div class="valor">${parametros.mezlaRelativa.toFixed(4)}</div>
            </div>`
        );

        // RPM
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>RPM</label>
                <div class="valor">${Math.round(parametros.rpm).toLocaleString()}</div>
            </div>`
        );

        // k del aire
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>k del Aire (γ)</label>
                <div class="valor">${parametros.kAire.toFixed(3)}</div>
            </div>`
        );

        // Rendimiento Mecánico
        $resultadosContainer.append(
            `<div class="resultado-item">
                <label>Rendimiento Mecánico</label>
                <div class="valor">${(parametros.rendimientoMecanico * 100).toFixed(2)}<span class="unidad">%</span></div>
            </div>`
        );

        $resultadosSection.show();
    }

    /**
     * Limpia el formulario y resultados
     */
    function limpiarFormulario() {
        $('#resultados-section').hide();
        $('#resultados-container').empty();
        $('#parametros-form')[0].reset();
        $('#k-aire').val('1,4'); // Restablecer valor por defecto
        $(document).find('#parametros-form input, #parametros-form select')
            .css('border-color', '#ddd');
    }

    /**
     * Muestra un mensaje de alerta
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo de alerta (warning, error, success)
     */
    function mostrarAlerta(mensaje, tipo = 'warning') {
        const alertHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
        const $alerta = $(alertHTML);
        
        $('.parametros-section').prepend($alerta);
        
        // Remover alerta después de 5 segundos
        setTimeout(function() {
            $alerta.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }
});
