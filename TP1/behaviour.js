/**
 * BEHAVIOUR.JS
 * Calculadora de Motores Pistoneros - Predimensionamiento Aeronáutico
 */

$(document).ready(function() {

    // ── VARIABLES GLOBALES ────────────────────────────────────────────────────
    let historial = [];
    let resultadosActuales = {};   // almacena el último resultado por ciclo

    const ciclosSimples = {
        'otto':   'Otto',
        'diesel': 'Diesel',
        'sabath': 'Sabathé'
    };

    // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
    inicializarApp();

    function inicializarApp() {
        inicializarKendoControls();
        inicializarKendoGrids();
        inicializarTablaEstados('otto');
        inicializarEventos();
        cargarHistorial();
        actualizarTablaHistorial();
    }

    // ── KENDO CONTROLS ────────────────────────────────────────────────────────
    function inicializarKendoControls() {
        $('#rpm').kendoNumericTextBox({ min: 0, decimals: 0, step: 100 });
        $('#mezcla-relativa').kendoNumericTextBox({ min: 1, decimals: 2, step: 0.5 });
        $('#k-aire').kendoNumericTextBox({ min: 0, decimals: 3, step: 0.1, value: 1.4 });
        $('#rendimiento-mecanico').kendoNumericTextBox({ min: 0, max: 1, decimals: 2, step: 0.05 });
        $('#delta-t-in').kendoNumericTextBox({ min: 0, decimals: 1, step: 5, value: 0 });
    }

    // ── KENDO GRIDS (solo tabla-resumen) ──────────────────────────────────────
    function inicializarKendoGrids() {
        $('#tabla-resumen').kendoGrid({
            sortable: false,
            selectable: false,
            resizable: true,
            toolbar: ['csv'],
            csv: { fileName: 'Resumen_Ciclo.csv', allPages: true },
            columns: [
                { field: 'ciclo',      title: 'Ciclo',            width: 70, attributes: { style: 'text-align: left'   } },
                { field: 't1',         title: 'T₁ [K]',           width: 65, attributes: { style: 'text-align: center' } },
                { field: 't2',         title: 'T₂ [K]',           width: 65, attributes: { style: 'text-align: center' } },
                { field: 't3',         title: 'T₃ [K]',           width: 65, attributes: { style: 'text-align: center' } },
                { field: 't4',         title: 'T₄ [K]',           width: 65, attributes: { style: 'text-align: center' } },
                { field: 'qin',        title: 'Q_in [kCal/kg]',   width: 95, attributes: { style: 'text-align: center' } },
                { field: 'qout',       title: 'Q_out [kCal/kg]',  width: 95, attributes: { style: 'text-align: center' } },
                { field: 'wneto',      title: 'W_neto [kJ/kg]',   width: 90, attributes: { style: 'text-align: center' } },
                { field: 'eterma',     title: 'η Térmica',        width: 75, attributes: { style: 'text-align: center' } },
                { field: 'cilindrada', title: 'Cilindrada',       width: 70, attributes: { style: 'text-align: center' } }
            ],
            dataSource: { data: [] }
        });
    }

    // ── TABLA DE ESTADOS (HTML plano, no kendoGrid) ───────────────────────────

    function fmt(n, dec) {
        if (n == null) return '-';
        return n.toLocaleString('es-AR', {
            minimumFractionDigits: dec,
            maximumFractionDigits: dec
        });
    }

    function construirHTMLTabla(resultado) {
        const titulo = `CICLO ${resultado.tipo_ciclo.toUpperCase()} IDEAL`;

        let filas = '';
        resultado.estados.forEach(function(e, i) {
            filas += `<tr class="fila-estado">
                <td>${e.num}</td><td>-</td><td>-</td>
                <td>${fmt(e.P, 2)}</td>
                <td>${fmt(e.rho, 4)}</td>
                <td>${fmt(e.v, 6)}</td>
                <td>${fmt(e.T, 2)}</td>
                <td>${fmt(e.u, 3)}</td>
                <td>${fmt(e.h, 3)}</td>
                <td>-</td><td>-</td>
            </tr>`;

            if (i < resultado.procesos.length) {
                const p = resultado.procesos[i];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
                    <td>${p.q != null ? fmt(p.q, 3) : '-'}</td>
                    <td>${p.w != null ? fmt(p.w, 2) : '-'}</td>
                </tr>`;
            }
        });

        return `
            <thead>
                <tr><th colspan="11" class="tabla-ciclo-titulo">${titulo}</th></tr>
                <tr>
                    <th>ESTADO</th><th>ETAPA</th><th>Tiempo</th>
                    <th>P [Pa]</th><th>ρ [kg/m³]</th><th>v [m³/kg]</th>
                    <th>T [K]</th><th>u [kCal/kg]</th><th>h [kCal/kg]</th>
                    <th>q [kCal/kg]</th><th>w [kJ/kg]</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>`;
    }

    function construirHTMLTablaVacia(ciclo) {
        const titulos = {
            otto:   'CICLO OTTO IDEAL',
            diesel: 'CICLO DIESEL IDEAL',
            sabath: 'CICLO SABATHÉ IDEAL'
        };
        const procesosOtto = [
            { etapa: '(1-2)', tiempo: 'Compresión'    },
            { etapa: '(2-3)', tiempo: 'Combustión'    },
            { etapa: '(3-4)', tiempo: 'Expansión'     },
            { etapa: '(4-1)', tiempo: 'Escape'        }
        ];
        const procesosSabath = [
            { etapa: '(1-2)', tiempo: 'Compresión'    },
            { etapa: '(2-3)', tiempo: 'Combustión VC' },
            { etapa: '(3-4)', tiempo: 'Combustión PC' },
            { etapa: '(4-5)', tiempo: 'Expansión'     },
            { etapa: '(5-1)', tiempo: 'Escape'        }
        ];
        const nEstados = ciclo === 'sabath' ? 5 : 4;
        const procesos = ciclo === 'sabath' ? procesosSabath : procesosOtto;

        let filas = '';
        for (let i = 1; i <= nEstados; i++) {
            filas += `<tr class="fila-estado">
                <td>${i}</td><td>-</td><td>-</td>
                <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>`;
            if (i <= procesos.length) {
                const p = procesos[i - 1];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
                </tr>`;
            }
        }

        return `
            <thead>
                <tr><th colspan="11" class="tabla-ciclo-titulo">${titulos[ciclo] || titulos.otto}</th></tr>
                <tr>
                    <th>ESTADO</th><th>ETAPA</th><th>Tiempo</th>
                    <th>P [Pa]</th><th>ρ [kg/m³]</th><th>v [m³/kg]</th>
                    <th>T [K]</th><th>u [kCal/kg]</th><th>h [kCal/kg]</th>
                    <th>q [kCal/kg]</th><th>w [kJ/kg]</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>`;
    }

    function inicializarTablaEstados(ciclo) {
        $('#tabla-estados').html(construirHTMLTablaVacia(ciclo));
    }

    function cargarTablaEstados(ciclo, resultado) {
        if (!resultado) {
            inicializarTablaEstados(ciclo);
            return;
        }
        $('#tabla-estados').html(construirHTMLTabla(resultado));
    }

    function actualizarTablaEstados(ciclo) {
        if (resultadosActuales[ciclo]) {
            cargarTablaEstados(ciclo, resultadosActuales[ciclo]);
        } else {
            inicializarTablaEstados(ciclo);
        }
    }

    // ── TABLA RESUMEN ─────────────────────────────────────────────────────────
    function cargarTablaResumen(resultado) {
        const r = resultado;
        const T = r.estados;
        const datos = [{
            ciclo:      r.tipo_ciclo,
            t1:         fmt(T[0].T, 2),
            t2:         fmt(T[1].T, 2),
            t3:         fmt(T[2].T, 2),
            t4:         fmt(T[3] ? T[3].T : null, 2),
            qin:        fmt(r.rendimientos.q_in, 3),
            qout:       fmt(r.rendimientos.q_out, 3),
            wneto:      fmt(r.rendimientos.w_neto, 2),
            eterma:     (r.rendimientos.eta_th * 100).toFixed(2) + '%',
            cilindrada: '--'
        }];
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data(datos);
    }

    function cargarTablaResumenComparativa(resultados) {
        const datos = resultados.map(function(r) {
            const T = r.estados;
            return {
                ciclo:      r.tipo_ciclo,
                t1:         fmt(T[0].T, 2),
                t2:         fmt(T[1].T, 2),
                t3:         fmt(T[2].T, 2),
                t4:         fmt(T[3] ? T[3].T : null, 2),
                qin:        fmt(r.rendimientos.q_in, 3),
                qout:       fmt(r.rendimientos.q_out, 3),
                wneto:      fmt(r.rendimientos.w_neto, 2),
                eterma:     (r.rendimientos.eta_th * 100).toFixed(2) + '%',
                cilindrada: '--'
            };
        });
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data(datos);
    }

    // ── EVENTOS ───────────────────────────────────────────────────────────────
    function inicializarEventos() {
        $(document).on('click', '#btn-calcular', function(e) {
            e.preventDefault();
            realizarCalculo();
        });

        $(document).on('click', '.btn-secondary', function() {
            limpiarFormulario();
        });

        $(document).on('change', '#ciclo-estados', function() {
            actualizarTablaEstados($(this).val());
        });

        $(document).on('click', '#modal-close-btn', function() {
            cerrarModal();
        });

        $(document).on('click', '#historial-modal', function(e) {
            if (e.target === this) cerrarModal();
        });

        $(window).on('beforeunload', function() {
            limpiarHistorialStorage();
        });

        // Quitar borde de error al escribir
        $('#parametros-form').on('input change', 'input, select', function() {
            $(this).removeClass('input-error');
        });
    }

    // ── CÁLCULO PRINCIPAL ─────────────────────────────────────────────────────
    async function realizarCalculo() {
        $('#parametros-form').find('input, select').removeClass('input-error');

        const ciclo = $('#ciclo-selector').val();
        if (!ciclo) {
            $('#ciclo-selector').addClass('input-error');
            mostrarAlerta('Selecciona un tipo de ciclo antes de calcular.', 'warning');
            return;
        }

        const parametros = obtenerParametros();
        if (!validarParametros(parametros)) return;

        try {
            if (typeof CiclosMotores === 'undefined') {
                mostrarAlerta('Error: módulo de ciclos no disponible.', 'error');
                return;
            }

            let resultados = [];

            if (ciclo === 'comparacion') {
                ['otto', 'diesel', 'sabath'].forEach(function(c) {
                    const res = CiclosMotores.calcular(c, parametros);
                    resultadosActuales[c] = res;
                    resultados.push(res);
                });

                $('#ciclo-estados').val('otto').prop('disabled', false);
                cargarTablaEstados('otto', resultadosActuales['otto']);
                cargarTablaResumenComparativa(resultados);

                ['pv', 'ts'].forEach(function(g) {
                    $('#ciclo-' + g).prop('disabled', false);
                });

            } else {
                const resultado = CiclosMotores.calcular(ciclo, parametros);
                resultadosActuales[ciclo] = resultado;
                resultados.push(resultado);

                $('#ciclo-estados').val(ciclo).prop('disabled', true);
                cargarTablaEstados(ciclo, resultado);
                cargarTablaResumen(resultado);

                ['pv', 'ts'].forEach(function(g) {
                    $('#ciclo-' + g).val(ciclo).prop('disabled', true);
                });
            }

            // ── Historial
            const idHistorial = generarIDHistorial();
            const itemHistorial = {
                id: idHistorial,
                fechaObjeto: new Date(),
                ciclo: ciclo === 'comparacion' ? 'Comparativa' : ciclosSimples[ciclo],
                parametros: {
                    rpm:                 parametros.rpm,
                    potencia:            parametros.potencia.valor,
                    potencia_unidad:     parametros.potencia.unidad,
                    altitud:             parametros.altitud.valor,
                    altitud_unidad:      parametros.altitud.unidad,
                    mezcla_relativa:     parametros.mezlaRelativa,
                    k_aire:              parametros.kAire,
                    rendimiento_mecanico: parametros.rendimientoMecanico,
                    delta_t_in:          parametros.deltaT
                }
            };

            if (!existeEnHistorial(itemHistorial)) {
                historial.push(itemHistorial);
                guardarHistorial();
                actualizarTablaHistorial();
                mostrarAlerta('Cálculo completado y guardado en historial.', 'success');
            } else {
                mostrarAlerta('Este cálculo ya existe en el historial.', 'info');
            }

        } catch (error) {
            console.error('Error en cálculo:', error);
            mostrarAlerta('Error durante el cálculo: ' + error.message, 'error');
        }
    }

    // ── PARÁMETROS Y VALIDACIÓN ───────────────────────────────────────────────
    function obtenerParametros() {
        return {
            altitud: {
                valor: convertirANumero($('#altitud')),
                unidad: $('#unidad-altitud').val()
            },
            potencia: {
                valor: convertirANumero($('#potencia')),
                unidad: $('#unidad-potencia').val()
            },
            mezlaRelativa:      $('#mezcla-relativa').data('kendoNumericTextBox').value(),
            rpm:                $('#rpm').data('kendoNumericTextBox').value(),
            kAire:              $('#k-aire').data('kendoNumericTextBox').value(),
            rendimientoMecanico: $('#rendimiento-mecanico').data('kendoNumericTextBox').value(),
            deltaT:             $('#delta-t-in').data('kendoNumericTextBox').value() || 0,
            ciclo:              $('#ciclo-selector').val()
        };
    }

    function validarParametros(p) {
        if (p.altitud.valor === null || p.altitud.valor < 0) {
            $('#altitud').addClass('input-error');
            mostrarAlerta('Altitud: valor inválido o negativo.', 'error');
            return false;
        }
        if (p.potencia.valor === null || p.potencia.valor <= 0) {
            $('#potencia').addClass('input-error');
            mostrarAlerta('Potencia: debe ser un número positivo.', 'error');
            return false;
        }
        if (p.mezlaRelativa === null || p.mezlaRelativa <= 1) {
            $('#mezcla-relativa').addClass('input-error');
            mostrarAlerta('Relación de Compresión: debe ser mayor a 1.', 'error');
            return false;
        }
        if (p.rpm === null || p.rpm <= 0) {
            $('#rpm').addClass('input-error');
            mostrarAlerta('RPM: debe ser un número positivo.', 'error');
            return false;
        }
        if (p.kAire === null || p.kAire <= 1) {
            $('#k-aire').addClass('input-error');
            mostrarAlerta('k del aire: debe ser mayor a 1.', 'error');
            return false;
        }
        if (p.rendimientoMecanico === null || p.rendimientoMecanico <= 0 || p.rendimientoMecanico >= 1) {
            $('#rendimiento-mecanico').addClass('input-error');
            mostrarAlerta('Rendimiento mecánico: debe estar entre 0 y 1 (excl.).', 'error');
            return false;
        }
        return true;
    }

    function convertirANumero($input) {
        let valor = $input.val().trim();
        if (valor === '') return null;
        valor = valor.replace(/\s/g, '');
        if (valor.includes('.') && valor.includes(',')) {
            valor = valor.replace(/\./g, '').replace(',', '.');
        } else if (valor.includes(',') && !valor.includes('.')) {
            valor = valor.replace(',', '.');
        }
        const n = parseFloat(valor);
        return isNaN(n) ? null : n;
    }

    // ── FORMULARIO ────────────────────────────────────────────────────────────
    function limpiarFormulario() {
        $('#parametros-form')[0].reset();
        $('#rpm').data('kendoNumericTextBox').value(null);
        $('#mezcla-relativa').data('kendoNumericTextBox').value(null);
        $('#k-aire').data('kendoNumericTextBox').value(1.4);
        $('#rendimiento-mecanico').data('kendoNumericTextBox').value(null);
        $('#delta-t-in').data('kendoNumericTextBox').value(0);
        $('#potencia').val('');
        $('#altitud').val('');
        $('#ciclo-estados').prop('disabled', false).val('otto');
        $('#ciclo-pv').prop('disabled', false).val('otto');
        $('#ciclo-ts').prop('disabled', false).val('otto');
        $('#parametros-form input, #parametros-form select').removeClass('input-error');
        resultadosActuales = {};
        inicializarTablaEstados('otto');
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data([]);
    }

    // ── HISTORIAL ─────────────────────────────────────────────────────────────
    function generarIDHistorial() {
        const d = new Date();
        const p = n => String(n).padStart(2, '0');
        return `${p(d.getDate())}-${p(d.getMonth()+1)}-${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }

    function formatearFecha(fecha) {
        const p = n => String(n).padStart(2, '0');
        return `${p(fecha.getDate())}-${p(fecha.getMonth()+1)}-${fecha.getFullYear()} - ${p(fecha.getHours())}:${p(fecha.getMinutes())}:${p(fecha.getSeconds())}`;
    }

    function existeEnHistorial(nuevo) {
        return historial.some(function(item) {
            return item.ciclo === nuevo.ciclo &&
                item.parametros.rpm === nuevo.parametros.rpm &&
                item.parametros.potencia === nuevo.parametros.potencia &&
                item.parametros.potencia_unidad === nuevo.parametros.potencia_unidad &&
                item.parametros.altitud === nuevo.parametros.altitud &&
                item.parametros.altitud_unidad === nuevo.parametros.altitud_unidad &&
                item.parametros.mezcla_relativa === nuevo.parametros.mezcla_relativa &&
                item.parametros.k_aire === nuevo.parametros.k_aire &&
                item.parametros.rendimiento_mecanico === nuevo.parametros.rendimiento_mecanico &&
                (item.parametros.delta_t_in || 0) === (nuevo.parametros.delta_t_in || 0);
        });
    }

    function guardarHistorial() {
        const serializado = historial.map(function(item) {
            return Object.assign({}, item, { fechaObjeto: item.fechaObjeto.toISOString() });
        });
        localStorage.setItem('historial_calculos', JSON.stringify(serializado));
    }

    function cargarHistorial() {
        const guardado = localStorage.getItem('historial_calculos');
        if (!guardado) return;
        try {
            historial = JSON.parse(guardado).map(function(item) {
                return Object.assign({}, item, { fechaObjeto: new Date(item.fechaObjeto) });
            });
        } catch(e) {
            console.error('Error cargando historial:', e);
            historial = [];
        }
    }

    function limpiarHistorialStorage() {
        localStorage.removeItem('historial_calculos');
    }

    function actualizarTablaHistorial() {
        const $tbody = $('#historial-body');
        $tbody.empty();

        if (historial.length === 0) {
            $tbody.append('<tr><td colspan="3" style="text-align:center;">Sin registros</td></tr>');
            return;
        }

        historial.forEach(function(item) {
            const id = item.id;
            const btnC = `<button class="historial-btn" data-id="${id}" data-action="consulta"  title="Consultar"><span class="k-icon k-i-search"></span></button>`;
            const btnL = `<button class="historial-btn" data-id="${id}" data-action="cargar"    title="Cargar parámetros"><span class="k-icon k-i-arrow-60-up"></span></button>`;
            const btnE = `<button class="historial-btn" data-id="${id}" data-action="eliminar"  title="Eliminar"><span class="k-icon k-i-delete"></span></button>`;
            const fila = $('<tr>')
                .append(`<td>${formatearFecha(item.fechaObjeto)}</td>`)
                .append(`<td>${item.ciclo}</td>`)
                .append(`<td><div class="botones-accion">${btnC}${btnL}${btnE}</div></td>`);
            $tbody.append(fila);

            fila.find('.historial-btn').on('click', function(e) {
                e.preventDefault();
                const action = $(this).data('action');
                const itemId = $(this).data('id');
                if (action === 'consulta')  abrirModalConsulta(itemId);
                if (action === 'cargar')    cargarParametrosDelHistorial(itemId);
                if (action === 'eliminar')  eliminarDelHistorial(itemId);
            });
        });
    }

    // ── MODAL ─────────────────────────────────────────────────────────────────
    function abrirModalConsulta(itemId) {
        const item = historial.find(function(h) { return h.id === itemId; });
        if (!item) return;

        $('#modal-fecha').text(formatearFecha(item.fechaObjeto));
        $('#modal-ciclo').text(item.ciclo);

        const $tbody = $('#modal-datos-body');
        $tbody.empty();

        const labels = {
            rpm:                  { label: 'RPM',                   unidad: ''                },
            potencia:             { label: 'Potencia',              unidad: 'potencia_unidad'  },
            altitud:              { label: 'Altitud',               unidad: 'altitud_unidad'   },
            mezcla_relativa:      { label: 'Relación de Compresión', unidad: ''               },
            k_aire:               { label: 'k del Aire (γ)',         unidad: ''               },
            rendimiento_mecanico: { label: 'Rendimiento Mecánico',   unidad: ''               },
            delta_t_in:           { label: 'ΔT_in [K]',              unidad: ''               }
        };

        Object.entries(labels).forEach(function([key, cfg]) {
            let valor = item.parametros[key];
            const unidad = cfg.unidad ? item.parametros[cfg.unidad] : '';
            if (typeof valor === 'number') {
                valor = valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
            }
            $tbody.append(
                $('<tr>').append(`<td>${cfg.label}</td><td>${valor}</td><td>${unidad}</td>`)
            );
        });

        $('#historial-modal').css('display', 'flex');
    }

    function cerrarModal() {
        $('#historial-modal').css('display', 'none');
    }

    function cargarParametrosDelHistorial(itemId) {
        const item = historial.find(function(h) { return h.id === itemId; });
        if (!item) return;

        $('#rpm').data('kendoNumericTextBox').value(item.parametros.rpm);
        $('#potencia').val(item.parametros.potencia);
        $('#unidad-potencia').val(item.parametros.potencia_unidad);
        $('#altitud').val(item.parametros.altitud);
        $('#unidad-altitud').val(item.parametros.altitud_unidad);
        $('#mezcla-relativa').data('kendoNumericTextBox').value(item.parametros.mezcla_relativa);
        $('#k-aire').data('kendoNumericTextBox').value(item.parametros.k_aire);
        $('#rendimiento-mecanico').data('kendoNumericTextBox').value(item.parametros.rendimiento_mecanico);
        $('#delta-t-in').data('kendoNumericTextBox').value(item.parametros.delta_t_in || 0);

        mostrarAlerta('Parámetros cargados desde historial.', 'success');
    }

    function eliminarDelHistorial(itemId) {
        historial = historial.filter(function(h) { return h.id !== itemId; });
        guardarHistorial();
        actualizarTablaHistorial();
        mostrarAlerta('Cálculo eliminado del historial.', 'info');
    }

    // ── ALERTAS ───────────────────────────────────────────────────────────────
    function mostrarAlerta(mensaje, tipo) {
        tipo = tipo || 'warning';
        const $alerta = $(`<div class="alert alert-${tipo}">${mensaje}</div>`);
        $('#parametros-form').prepend($alerta);
        setTimeout(function() {
            $alerta.fadeOut(300, function() { $(this).remove(); });
        }, 4000);
    }
});
