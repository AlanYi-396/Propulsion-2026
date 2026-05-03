/**
 * BEHAVIOUR.JS
 * Calculadora de Motores Pistoneros - Predimensionamiento Aeronáutico
 * 
 * Este archivo contiene la lógica de comportamiento de la aplicación.
 */

$(document).ready(function() {
    // --- VARIABLES GLOBALES ---
    let cicloSeleccionado = null;
    let historial = [];
    
    const ciclosDisponibles = {
        'otto': 'Ciclo Otto',
        'diesel': 'Ciclo Diesel',
        'sabath': 'Ciclo Sabathé',
        'comparacion': 'Comparación de Ciclos'
    };

    const ciclosSimples = {
        'otto': 'Otto',
        'diesel': 'Diesel',
        'sabath': 'Sabathé'
    };

    // --- INICIALIZACIÓN ---
    inicializarApp();

    /**
     * Inicializa la aplicación
     */
    function inicializarApp() {
        inicializarKendoControls();
        inicializarKendoGrids();
        inicializarEventos();
        cargarHistorial();
        actualizarTablaHistorial();
    }

    /**
     * Inicializa los kendoGrid
     */
    function inicializarKendoGrids() {
        // Grid de Estados y Tiempos del Ciclo
        $('#tabla-estados').kendoGrid({
            sortable: false,
            selectable: false,
            resizable: true,
            toolbar: [],
            columns: [
                { field: 'estado', title: 'Estado', width: 50 },
                { field: 'tiempo', title: 'Tiempo', width: 80 },
                { field: 'p', title: 'P', width: 50 },
                { field: 't', title: 'T', width: 50 },
                { field: 'v', title: 'V', width: 50 },
                { field: 's', title: 's', width: 50 },
                { field: 'qw', title: 'Q/W', width: 60 }
            ],
            dataSource: {
                data: []
            }
        });

        // Grid de Resumen del Ciclo con exportación
        $('#tabla-resumen').kendoGrid({
            sortable: false,
            selectable: false,
            resizable: true,
            toolbar: ['csv'],
            excel: {
                fileName: 'Resumen_Ciclo.xlsx'
            },
            csv: {
                fileName: 'Resumen_Ciclo.csv',
                allPages: true
            },
            columns: [
                { field: 'ciclo', title: 'Ciclo', width: 60 },
                { field: 't1', title: 'T1', width: 40 },
                { field: 't2', title: 'T2', width: 40 },
                { field: 't3', title: 'T3', width: 40 },
                { field: 't4', title: 'T4', width: 40 },
                { field: 'qin', title: 'Q in', width: 50 },
                { field: 'qout', title: 'Q out', width: 50 },
                { field: 'wneto', title: 'W neto', width: 50 },
                { field: 'eterma', title: 'η Térm', width: 50 },
                { field: 'cilindrada', title: 'Cilindrada', width: 60 }
            ],
            dataSource: {
                data: []
            }
        });

        // Grid de Historial (tabla simple con datos reales)
        // Se actualiza dinámicamente en actualizarTablaHistorial()
    }

    /**
     * Inicializa los controles Kendo (kendoNumericTextBox)
     */
    function inicializarKendoControls() {
        // RPM
        $('#rpm').kendoNumericTextBox({
            min: 0,
            decimals: 0,
            step: 100
        });

        // Relación de Compresión
        $('#mezcla-relativa').kendoNumericTextBox({
            min: 0,
            decimals: 2,
            step: 0.5
        });

        // k del Aire
        $('#k-aire').kendoNumericTextBox({
            min: 0,
            decimals: 3,
            step: 0.1,
            value: 1.4
        });

        // Rendimiento Mecánico
        $('#rendimiento-mecanico').kendoNumericTextBox({
            min: 0,
            max: 1,
            decimals: 2,
            step: 0.05
        });
    }

    /**
     * Inicializa los event listeners
     */
    function inicializarEventos() {
        // Botón de calcular
        $(document).on('click', '#btn-calcular', function(e) {
            e.preventDefault();
            realizarCalculo();
        });

        // Reset del formulario
        $(document).on('click', '.btn-secondary', function() {
            limpiarFormulario();
        });

        // Cambio de ciclo en dropdown (Estados y Tiempos)
        $(document).on('change', '#ciclo-estados', function() {
            actualizarTablaEstados($(this).val());
        });

        // Modal close button
        $(document).on('click', '#modal-close-btn', function() {
            cerrarModal();
        });

        // Cerrar modal al hacer click fuera
        $(document).on('click', '#historial-modal', function(e) {
            if (e.target === this) {
                cerrarModal();
            }
        });

        // Limpiar localStorage al cerrar la página
        $(window).on('beforeunload', function() {
            limpiarHistorialStorage();
        });
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
    async function realizarCalculo() {
        // Limpiar errores previos
        $('#parametros-form').find('input, select').removeClass('input-error');

        // Validar ciclo
        const ciclo = $('#ciclo-selector').val();
        if (!ciclo) {
            $('#ciclo-selector').addClass('input-error');
            mostrarAlerta('Selecciona un tipo de ciclo antes de calcular', 'warning');
            return;
        }

        // Validar campos requeridos
        const parametros = obtenerParametros();
        if (!validarParametros(parametros)) {
            return;
        }

        try {
            // Verificar que el módulo CiclosMotores esté disponible
            if (typeof CiclosMotores === 'undefined') {
                mostrarAlerta('Error: módulo de ciclos no disponible', 'error');
                return;
            }

            let resultados = [];
            
            if (ciclo === 'comparacion') {
                // Calcular los 3 ciclos
                resultados.push(CiclosMotores.calcular('otto', parametros));
                resultados.push(CiclosMotores.calcular('diesel', parametros));
                resultados.push(CiclosMotores.calcular('sabath', parametros));
                
                // Actualizar dropdown a Otto por defecto
                $('#ciclo-estados').val('otto').prop('disabled', false).change();
                
                // Cargar tabla resumen con 3 filas
                cargarTablaResumenComparativa(resultados);
            } else {
                // Calcular ciclo seleccionado
                const resultado = CiclosMotores.calcular(ciclo, parametros);
                resultados.push(resultado);
                
                // Actualizar dropdown al ciclo seleccionado y deshabilitar
                $('#ciclo-estados').val(ciclo).prop('disabled', true);
                
                // Cargar tabla resumen con 1 fila
                cargarTablaResumen(resultado);
            }

            // Cargar tabla de Estados y Tiempos del Ciclo
            if (ciclo !== 'comparacion') {
                cargarTablaEstados(ciclo, resultados[0]);
            } else {
                cargarTablaEstados('otto', resultados[0]);
            }

            // Guardar en historial
            const idHistorial = generarIDHistorial();
            const itemHistorial = {
                id: idHistorial,
                fechaObjeto: new Date(),
                ciclo: ciclo === 'comparacion' ? 'Comparativa' : ciclosSimples[ciclo],
                parametros: {
                    rpm: parametros.rpm,
                    potencia: parametros.potencia.valor,
                    potencia_unidad: parametros.potencia.unidad,
                    altitud: parametros.altitud.valor,
                    altitud_unidad: parametros.altitud.unidad,
                    mezcla_relativa: parametros.mezlaRelativa,
                    k_aire: parametros.kAire,
                    rendimiento_mecanico: parametros.rendimientoMecanico
                }
            };

            // Verificar que no esté duplicado
            if (!existeEnHistorial(itemHistorial)) {
                historial.push(itemHistorial);
                guardarHistorial();
                actualizarTablaHistorial();
                mostrarAlerta('Cálculo completado y guardado en historial', 'success');
            } else {
                mostrarAlerta('Este cálculo ya existe en el historial', 'info');
            }

        } catch (error) {
            console.error('Error en cálculo:', error);
            mostrarAlerta('Error durante el cálculo: ' + error.message, 'error');
        }
    }

    /**
     * Obtiene los parámetros del formulario
     * @returns {object} Objeto con los parámetros de entrada
     */
    function obtenerParametros() {
        // Para POTENCIA y ALTITUD, convertir de string a número si es necesario
        let potenciaValor = $('#potencia').val();
        let altitudValor = $('#altitud').val();

        // Si son strings, convertirlos a números
        if (typeof potenciaValor === 'string') {
            potenciaValor = convertirANumero($('#potencia'));
        }
        if (typeof altitudValor === 'string') {
            altitudValor = convertirANumero($('#altitud'));
        }

        return {
            altitud: {
                valor: altitudValor,
                unidad: $('#unidad-altitud').val()
            },
            potencia: {
                valor: potenciaValor,
                unidad: $('#unidad-potencia').val()
            },
            mezlaRelativa: $('#mezcla-relativa').data('kendoNumericTextBox').value(),
            rpm: $('#rpm').data('kendoNumericTextBox').value(),
            kAire: $('#k-aire').data('kendoNumericTextBox').value(),
            rendimientoMecanico: $('#rendimiento-mecanico').data('kendoNumericTextBox').value(),
            ciclo: $('#ciclo-selector').val()
        };
    }

    /**
     * Valida los parámetros
     * @param {object} parametros - Parámetros a validar
     * @returns {boolean} true si los parámetros son válidos
     */
    function validarParametros(parametros) {
        if (parametros.altitud.valor === null || parametros.altitud.valor < 0) {
            $('#altitud').addClass('input-error');
            mostrarAlerta('Altitud: valor inválido o negativo', 'error');
            return false;
        }

        if (parametros.potencia.valor === null || parametros.potencia.valor <= 0) {
            $('#potencia').addClass('input-error');
            mostrarAlerta('Potencia: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.mezlaRelativa === null || parametros.mezlaRelativa <= 0) {
            $('#mezcla-relativa').addClass('input-error');
            mostrarAlerta('Relación de Compresión: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.rpm === null || parametros.rpm <= 0) {
            $('#rpm').addClass('input-error');
            mostrarAlerta('RPM: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.kAire === null || parametros.kAire <= 0) {
            $('#k-aire').addClass('input-error');
            mostrarAlerta('k del aire: debe ser un número positivo', 'error');
            return false;
        }

        if (parametros.rendimientoMecanico === null || 
            parametros.rendimientoMecanico <= 0 || 
            parametros.rendimientoMecanico >= 1) {
            $('#rendimiento-mecanico').addClass('input-error');
            mostrarAlerta('Rendimiento mecánico: debe estar entre 0 y 1', 'error');
            return false;
        }

        return true;
    }

    /**
     * Carga la tabla de Estados y Tiempos del Ciclo
     * @param {string} ciclo - Tipo de ciclo (otto, diesel, sabath)
     * @param {object} resultado - Resultado del cálculo
     */
    function cargarTablaEstados(ciclo, resultado) {
        const procesosPorCiclo = {
            'otto': [
                { estado: 1, tiempo: 'COMPRESIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 2, tiempo: 'COMBUSTIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 3, tiempo: 'EXPANSIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 4, tiempo: 'ESCAPE', p: '--', t: '--', v: '--', s: '--', qw: '--' }
            ],
            'diesel': [
                { estado: 1, tiempo: 'COMPRESIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 2, tiempo: 'COMBUSTIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 3, tiempo: 'EXPANSIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 4, tiempo: 'ESCAPE', p: '--', t: '--', v: '--', s: '--', qw: '--' }
            ],
            'sabath': [
                { estado: 1, tiempo: 'COMPRESIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 2, tiempo: 'COMBUSTIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 3, tiempo: 'EXPANSIÓN', p: '--', t: '--', v: '--', s: '--', qw: '--' },
                { estado: 4, tiempo: 'ESCAPE', p: '--', t: '--', v: '--', s: '--', qw: '--' }
            ]
        };

        const datos = procesosPorCiclo[ciclo] || procesosPorCiclo['otto'];
        
        const $grid = $('#tabla-estados').data('kendoGrid');
        if ($grid) {
            $grid.dataSource.data(datos);
        }
    }

    /**
     * Actualiza la tabla de Estados (cuando cambia el dropdown)
     * @param {string} ciclo - Tipo de ciclo seleccionado
     */
    function actualizarTablaEstados(ciclo) {
        cargarTablaEstados(ciclo, {});
    }

    /**
     * Carga la tabla de Resumen para un ciclo individual
     * @param {object} resultado - Resultado del cálculo
     */
    function cargarTablaResumen(resultado) {
        const cicloNombre = resultado.tipo_ciclo || 'Otto';
        
        const datos = [{
            ciclo: cicloNombre,
            t1: '--',
            t2: '--',
            t3: '--',
            t4: '--',
            qin: '--',
            qout: '--',
            wneto: '--',
            eterma: '--',
            cilindrada: '--'
        }];

        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) {
            $grid.dataSource.data(datos);
        }
    }

    /**
     * Carga la tabla de Resumen para modo comparativa (3 ciclos)
     * @param {array} resultados - Array con los 3 resultados
     */
    function cargarTablaResumenComparativa(resultados) {
        const ciclos = ['Otto', 'Diesel', 'Sabathé'];
        
        const datos = ciclos.map((cicloNombre) => ({
            ciclo: cicloNombre,
            t1: '--',
            t2: '--',
            t3: '--',
            t4: '--',
            qin: '--',
            qout: '--',
            wneto: '--',
            eterma: '--',
            cilindrada: '--'
        }));

        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) {
            $grid.dataSource.data(datos);
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

        valor = valor.replace(/\s/g, '');

        if (valor.includes('.') && valor.includes(',')) {
            valor = valor.replace(/\./g, '').replace(',', '.');
        } else if (valor.includes(',') && !valor.includes('.')) {
            valor = valor.replace(',', '.');
        }

        const numero = parseFloat(valor);
        return isNaN(numero) ? null : numero;
    }

    /**
     * Limpia el formulario
     */
    function limpiarFormulario() {
        $('#parametros-form')[0].reset();
        $('#rpm').data('kendoNumericTextBox').value(null);
        $('#mezcla-relativa').data('kendoNumericTextBox').value(null);
        $('#k-aire').data('kendoNumericTextBox').value(1.4);
        $('#rendimiento-mecanico').data('kendoNumericTextBox').value(null);
        $('#potencia').val('');
        $('#altitud').val('');
        $('#ciclo-estados').prop('disabled', false).val('otto');
        $('#ciclo-estados').change();
        $(document).find('#parametros-form input, #parametros-form select')
            .removeClass('input-error')
            .css('border-color', '#ddd');
    }

    /**
     * Genera un ID de historial en formato dd-mm-yyyy - HH:MM:SS
     * @returns {string} ID formateado
     */
    function generarIDHistorial() {
        const ahora = new Date();
        const dd = String(ahora.getDate()).padStart(2, '0');
        const mm = String(ahora.getMonth() + 1).padStart(2, '0');
        const yyyy = ahora.getFullYear();
        const hh = String(ahora.getHours()).padStart(2, '0');
        const min = String(ahora.getMinutes()).padStart(2, '0');
        const ss = String(ahora.getSeconds()).padStart(2, '0');
        
        return `${dd}-${mm}-${yyyy} - ${hh}:${min}:${ss}`;
    }

    /**
     * Verifica si un item ya existe en el historial
     * @param {object} itemNuevo - Item a verificar
     * @returns {boolean} true si existe
     */
    function existeEnHistorial(itemNuevo) {
        return historial.some(item => 
            item.ciclo === itemNuevo.ciclo &&
            item.parametros.rpm === itemNuevo.parametros.rpm &&
            item.parametros.potencia === itemNuevo.parametros.potencia &&
            item.parametros.potencia_unidad === itemNuevo.parametros.potencia_unidad &&
            item.parametros.altitud === itemNuevo.parametros.altitud &&
            item.parametros.altitud_unidad === itemNuevo.parametros.altitud_unidad &&
            item.parametros.mezcla_relativa === itemNuevo.parametros.mezcla_relativa &&
            item.parametros.k_aire === itemNuevo.parametros.k_aire &&
            item.parametros.rendimiento_mecanico === itemNuevo.parametros.rendimiento_mecanico
        );
    }

    /**
     * Guarda el historial en localStorage
     */
    function guardarHistorial() {
        const historialSerializado = historial.map(item => ({
            ...item,
            fechaObjeto: item.fechaObjeto.toISOString()
        }));
        localStorage.setItem('historial_calculos', JSON.stringify(historialSerializado));
    }

    /**
     * Carga el historial de localStorage
     */
    function cargarHistorial() {
        const historialGuardado = localStorage.getItem('historial_calculos');
        if (historialGuardado) {
            try {
                historial = JSON.parse(historialGuardado).map(item => ({
                    ...item,
                    fechaObjeto: new Date(item.fechaObjeto)
                }));
            } catch (e) {
                console.error('Error cargando historial:', e);
                historial = [];
            }
        }
    }

    /**
     * Limpia el historial en localStorage (para beforeunload)
     */
    function limpiarHistorialStorage() {
        localStorage.removeItem('historial_calculos');
    }

    /**
     * Actualiza la tabla visual del historial
     */
    function actualizarTablaHistorial() {
        const $tbody = $('#historial-body');
        $tbody.empty();

        if (historial.length === 0) {
            const fila = $('<tr>')
                .append('<td colspan="3" style="text-align: center;">Sin registros</td>');
            $tbody.append(fila);
            return;
        }

        historial.forEach(item => {
            const fechaFormato = formatearFecha(item.fechaObjeto);
            
            const btnConsulta = `<button class="k-button k-icon k-i-search historial-btn" data-id="${item.id}" data-action="consulta" title="Consultar"></button>`;
            const btnCargar = `<button class="k-button k-icon k-i-level-up historial-btn" data-id="${item.id}" data-action="cargar" title="Cargar parámetros"></button>`;
            const btnEliminar = `<button class="k-button k-icon k-i-delete historial-btn" data-id="${item.id}" data-action="eliminar" title="Eliminar"></button>`;
            const acciones = `<div class="botones-accion">${btnConsulta}${btnCargar}${btnEliminar}</div>`;

            const fila = $('<tr>')
                .append(`<td>${fechaFormato}</td>`)
                .append(`<td>${item.ciclo}</td>`)
                .append(`<td>${acciones}</td>`);
            
            $tbody.append(fila);

            $(`.historial-btn[data-id="${item.id}"]`).on('click', function(e) {
                e.preventDefault();
                const action = $(this).data('action');
                const itemId = $(this).data('id');
                
                if (action === 'consulta') {
                    abrirModalConsulta(itemId);
                } else if (action === 'cargar') {
                    cargarParametrosDelHistorial(itemId);
                } else if (action === 'eliminar') {
                    eliminarDelHistorial(itemId);
                }
            });
        });
    }

    /**
     * Formatea una fecha al formato dd-mm-yyyy - HH:MM:SS
     * @param {Date} fecha - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    function formatearFecha(fecha) {
        const dd = String(fecha.getDate()).padStart(2, '0');
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const yyyy = fecha.getFullYear();
        const hh = String(fecha.getHours()).padStart(2, '0');
        const min = String(fecha.getMinutes()).padStart(2, '0');
        const ss = String(fecha.getSeconds()).padStart(2, '0');
        
        return `${dd}-${mm}-${yyyy} - ${hh}:${min}:${ss}`;
    }

    /**
     * Abre el modal de consulta de historial
     * @param {string} itemId - ID del item del historial
     */
    function abrirModalConsulta(itemId) {
        const item = historial.find(h => h.id === itemId);
        if (!item) return;

        const fechaFormato = formatearFecha(item.fechaObjeto);
        $('#modal-fecha').text(fechaFormato);
        $('#modal-ciclo').text(item.ciclo);

        const $tbody = $('#modal-datos-body');
        $tbody.empty();

        const parametrosLabels = {
            'rpm': { label: 'RPM', unidad: '' },
            'potencia': { label: 'Potencia', unidad: 'potencia_unidad' },
            'altitud': { label: 'Altitud', unidad: 'altitud_unidad' },
            'mezcla_relativa': { label: 'Relación de Compresión', unidad: '' },
            'k_aire': { label: 'k del Aire (γ)', unidad: '' },
            'rendimiento_mecanico': { label: 'Rendimiento Mecánico', unidad: '' }
        };

        Object.entries(parametrosLabels).forEach(([key, config]) => {
            let valor = item.parametros[key];
            let unidad = '';
            
            if (config.unidad) {
                unidad = item.parametros[config.unidad];
            }

            if (typeof valor === 'number') {
                valor = valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
            }

            const fila = $('<tr>')
                .append(`<td>${config.label}</td>`)
                .append(`<td>${valor}</td>`)
                .append(`<td>${unidad}</td>`);
            $tbody.append(fila);
        });

        $('#historial-modal').css('display', 'flex');
    }

    /**
     * Cierra el modal
     */
    function cerrarModal() {
        $('#historial-modal').css('display', 'none');
    }

    /**
     * Carga los parámetros del historial al formulario
     * @param {string} itemId - ID del item del historial
     */
    function cargarParametrosDelHistorial(itemId) {
        const item = historial.find(h => h.id === itemId);
        if (!item) return;

        $('#rpm').data('kendoNumericTextBox').value(item.parametros.rpm);
        $('#potencia').val(item.parametros.potencia);
        $('#unidad-potencia').val(item.parametros.potencia_unidad);
        $('#altitud').val(item.parametros.altitud);
        $('#unidad-altitud').val(item.parametros.altitud_unidad);
        $('#mezcla-relativa').data('kendoNumericTextBox').value(item.parametros.mezcla_relativa);
        $('#k-aire').data('kendoNumericTextBox').value(item.parametros.k_aire);
        $('#rendimiento-mecanico').data('kendoNumericTextBox').value(item.parametros.rendimiento_mecanico);

        mostrarAlerta('Parámetros cargados desde historial', 'success');
    }

    /**
     * Elimina un item del historial
     * @param {string} itemId - ID del item a eliminar
     */
    function eliminarDelHistorial(itemId) {
        historial = historial.filter(h => h.id !== itemId);
        guardarHistorial();
        actualizarTablaHistorial();
        mostrarAlerta('Cálculo eliminado del historial', 'info');
    }

    /**
     * Muestra un mensaje de alerta
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo de alerta (warning, error, success, info)
     */
    function mostrarAlerta(mensaje, tipo = 'warning') {
        const alertHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
        const $alerta = $(alertHTML);
        
        $('#parametros-form').prepend($alerta);
        
        setTimeout(function() {
            $alerta.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }
});
