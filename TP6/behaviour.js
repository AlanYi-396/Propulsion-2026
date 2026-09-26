/**
 * BEHAVIOUR.JS
 * Calculadora de Motores Pistoneros - Predimensionamiento Aeronáutico
 */

$(document).ready(function() {

    // ── VARIABLES GLOBALES ────────────────────────────────────────────────────
    let resultadosActuales = {};   // almacena el último resultado por ciclo
    let resultadoTurborreactor = null;

    const RENDIMIENTOS = ['eta-difusor', 'eta-compresor', 'eta-turbina', 'eta-tobera'];

    // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
    inicializarApp();

    function inicializarApp() {
        inicializarKendoControls();
        inicializarKendoGrids();
        inicializarTablaEstados('otto');
        inicializarGraficos();
        inicializarEventos();
    }

    // ── KENDO CONTROLS ────────────────────────────────────────────────────────
    function inicializarKendoControls() {
        $('#v0').kendoNumericTextBox({ min: 0, decimals: 1, step: 10 });
        $('#v1').kendoNumericTextBox({ min: 0, decimals: 1, step: 10 });
        $('#relacion-compresion').kendoNumericTextBox({ min: 1, decimals: 2, step: 0.5 });
        $('#dp-cc').kendoNumericTextBox({ min: 0, max: 100, decimals: 1, step: 0.5 });
        $('#t-lim').kendoNumericTextBox({ min: 0, decimals: 0, step: 10 });
        RENDIMIENTOS.forEach(function(id) {
            $('#' + id).kendoNumericTextBox({ min: 0, max: 1, decimals: 2, step: 0.05 });
        });
    }

    // ── KENDO GRIDS (solo tabla-resumen) ──────────────────────────────────────
    function inicializarKendoGrids() {
        $('#tabla-resumen').kendoGrid({
            sortable: false,
            selectable: false,
            resizable: true,
            scrollable: false,
            columns: [
                { field: 'ciclo',      title: 'Ciclo',                                                        width: 70, attributes: { style: 'text-align: left'   } },
                { field: 't1',         title: 'T₁ [K]',                                                       width: 65, attributes: { style: 'text-align: center' } },
                { field: 't2',         title: 'T₂ [K]',                                                       width: 65, attributes: { style: 'text-align: center' } },
                { field: 't3',         headerTemplate: 'T<sub>3</sub> [K]',                                   width: 65, attributes: { style: 'text-align: center' } },
                { field: 't4',         title: 'T₄ [K]',                                                       width: 65, attributes: { style: 'text-align: center' } },
                { field: 'qin',        headerTemplate: 'Q<sub>in</sub> [kCal/kg]',                            width: 95, attributes: { style: 'text-align: center' } },
                { field: 'qout',       headerTemplate: 'Q<sub>out</sub> [kCal/kg]',                           width: 95, attributes: { style: 'text-align: center' } },
                { field: 'wneto',      headerTemplate: 'W<sub>neto</sub> [kJ/kg]',                            width: 90, attributes: { style: 'text-align: center' } },
                { field: 'eterma',     headerTemplate: 'η<sub>t</sub>',                                       width: 75, attributes: { style: 'text-align: center' } },
                { field: 'cilindrada',  headerTemplate: 'V<sub>d</sub> [L]',                                   width: 70,  attributes: { style: 'text-align: center' } },
                { field: 'disposicion', headerTemplate: 'Disposición',                                          width: 140, attributes: { style: 'text-align: center; font-size: 11px; white-space: nowrap;' } }
            ],
            dataSource: { data: [] },
            dataBound: function() {
                const data = this.dataSource.data();
                const $tbody = $(this.tbody);
                data.forEach(function(item, idx) {
                    const raw = parseFloat((item.t3 || '').replace(/\./g, '').replace(',', '.'));
                    if (raw > 4800) {
                        $tbody.find('tr').eq(idx).find('td').eq(3).addClass('alerta-t3');
                    }
                });
            }
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

    function construirHTMLTabla(resultado, cicloKey) {
        const titulo = `CICLO ${resultado.tipo_ciclo.toUpperCase()} IDEAL`;
        const tipo   = cicloKey || resultado.tipo_ciclo.toLowerCase();
        const ALERTA = 'background:#eb4c4c;color:#F8F8F8;font-weight:700';

        let filas = '';
        resultado.estados.forEach(function(e, i) {
            const stP = e.P > 10000000 ? ` style="${ALERTA}"` : '';
            const stT = e.T > 4800     ? ` style="${ALERTA}"` : '';
            filas += `<tr class="fila-estado">
                <td>${e.num}</td><td colspan="2">-</td>
                <td${stP}>${fmt(e.P, 2)}</td>
                <td>${fmt(e.rho, 4)}</td>
                <td>${fmt(e.v, 6)}</td>
                <td${stT}>${fmt(e.T, 2)}</td>
                <td>${fmt(e.u, 3)}</td>
                <td>${fmt(e.h, 3)}</td>
                <td colspan="3">-</td>
            </tr>`;

            if (i < resultado.procesos.length) {
                const p = resultado.procesos[i];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td colspan="6">-</td>
                    <td>${p.q != null ? fmt(p.q, 3) : '-'}</td>
                    <td>${p.w != null ? fmt(p.w, 2) : '-'}</td>
                    <td>${fmt(p.ds, 4)}</td>
                </tr>`;
            }
        });

        return `
            <thead>
                <tr>
                    <th colspan="12" class="tabla-ciclo-titulo">
                        Estados y Tiempos del Ciclo — ${titulo}
                        <select id="ciclo-estados">
                            <option value="otto"   ${tipo==='otto'   ?'selected':''}>Otto</option>
                            <option value="diesel" ${tipo==='diesel' ?'selected':''}>Diesel</option>
                            <option value="sabath" ${tipo==='sabath' ?'selected':''}>Sabathé</option>
                        </select>
                    </th>
                </tr>
                <tr>
                    <th>ESTADO</th><th>ETAPA</th><th>Tiempo</th>
                    <th>P [Pa]</th><th>ρ [kg/m³]</th><th>v [m³/kg]</th>
                    <th>T [K]</th><th>u [kCal/kg]</th><th>h [kCal/kg]</th>
                    <th>q [kCal/kg]</th><th>w [kJ/kg]</th><th>ΔS [kCal/(kg·K)]</th>
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
                <td>${i}</td><td colspan="2">-</td>
                <td colspan="9">-</td>
            </tr>`;
            if (i <= procesos.length) {
                const p = procesos[i - 1];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td colspan="9">-</td>
                </tr>`;
            }
        }

        return `
            <thead>
                <tr>
                    <th colspan="12" class="tabla-ciclo-titulo">
                        Estados y Tiempos del Ciclo — ${titulos[ciclo] || titulos.otto}
                        <select id="ciclo-estados">
                            <option value="otto"   ${ciclo==='otto'   ?'selected':''}>Otto</option>
                            <option value="diesel" ${ciclo==='diesel' ?'selected':''}>Diesel</option>
                            <option value="sabath" ${ciclo==='sabath' ?'selected':''}>Sabathé</option>
                        </select>
                    </th>
                </tr>
                <tr>
                    <th>ESTADO</th><th>ETAPA</th><th>Tiempo</th>
                    <th>P [Pa]</th><th>ρ [kg/m³]</th><th>v [m³/kg]</th>
                    <th>T [K]</th><th>u [kCal/kg]</th><th>h [kCal/kg]</th>
                    <th>q [kCal/kg]</th><th>w [kJ/kg]</th><th>ΔS [kCal/(kg·K)]</th>
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
        $('#tabla-estados').html(construirHTMLTabla(resultado, ciclo));
    }

    function actualizarTablaEstados(ciclo) {
        if (resultadosActuales[ciclo]) {
            cargarTablaEstados(ciclo, resultadosActuales[ciclo]);
        } else {
            inicializarTablaEstados(ciclo);
        }
    }

    // ── TABLA RESUMEN ─────────────────────────────────────────────────────────
    function calcularDisposicion(cilindrada_L, tipoCiclo) {
        const tipo = (tipoCiclo || '').toLowerCase();
        const rbs  = tipo.includes('diesel') ? 1.10 : tipo.includes('sabat') ? 0.90 : 1.25;

        // Busca la cantidad par de cilindros mínima tal que bore ≤ 6"
        for (let n = 2; n <= 24; n += 2) {
            const V_cil_mm3 = (cilindrada_L / n) * 1e6;
            const L_mm = Math.cbrt(4 * V_cil_mm3 / (Math.PI * rbs * rbs));
            const D_mm = rbs * L_mm;
            const D_in = D_mm / 25.4;
            const L_in = L_mm / 25.4;
            if (D_in <= 6.0) {
                return `${n}c × ${D_in.toFixed(2)}" × ${L_in.toFixed(2)}"`;
            }
        }
        return '—';
    }

    function cargarTablaResumen(resultado) {
        const r = resultado;
        const T = r.estados;
        const datos = [{
            ciclo:       r.tipo_ciclo,
            t1:          fmt(T[0].T, 2),
            t2:          fmt(T[1].T, 2),
            t3:          fmt(T[2].T, 2),
            t4:          fmt(T[3] ? T[3].T : null, 2),
            qin:         fmt(r.rendimientos.q_in, 3),
            qout:        fmt(r.rendimientos.q_out, 3),
            wneto:       fmt(r.rendimientos.w_neto, 2),
            eterma:      (r.rendimientos.eta_th * 100).toFixed(2) + '%',
            cilindrada:  fmt(r.rendimientos.cilindrada_L, 2) + ' L',
            disposicion: calcularDisposicion(r.rendimientos.cilindrada_L, r.tipo_ciclo)
        }];
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data(datos);
    }

    function cargarTablaResumenComparativa(resultados) {
        const datos = resultados.map(function(r) {
            const T = r.estados;
            return {
                ciclo:       r.tipo_ciclo,
                t1:          fmt(T[0].T, 2),
                t2:          fmt(T[1].T, 2),
                t3:          fmt(T[2].T, 2),
                t4:          fmt(T[3] ? T[3].T : null, 2),
                qin:         fmt(r.rendimientos.q_in, 3),
                qout:        fmt(r.rendimientos.q_out, 3),
                wneto:       fmt(r.rendimientos.w_neto, 2),
                eterma:      (r.rendimientos.eta_th * 100).toFixed(2) + '%',
                cilindrada:  fmt(r.rendimientos.cilindrada_L, 2) + ' L',
                disposicion: calcularDisposicion(r.rendimientos.cilindrada_L, r.tipo_ciclo)
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

        $(document).on('change', '#ciclo-pv', function() {
            const c = $(this).val();
            if (resultadosActuales[c]) renderizarGraficoPV(resultadosActuales[c]);
        });

        $(document).on('change', '#ciclo-ts', function() {
            const c = $(this).val();
            if (resultadosActuales[c]) renderizarGraficoTS(resultadosActuales[c]);
        });

        $(window).on('resize', function() {
            const cPV = $('#plot-pv').data('kendoChart');
            const cTS = $('#plot-ts').data('kendoChart');
            if (cPV) cPV.resize();
            if (cTS) cTS.resize();
        });

        // Quitar borde de error al escribir
        $('#parametros-form').on('input change', 'input, select', function() {
            $(this).removeClass('input-error');
        });
    }

    // ── CÁLCULO PRINCIPAL ─────────────────────────────────────────────────────
    function realizarCalculo() {
        $('#parametros-form').find('input, select').removeClass('input-error');

        const parametros = obtenerParametros();
        if (!validarParametros(parametros)) return;

        try {
            if (typeof CicloJouleBrayton === 'undefined') {
                mostrarAlerta('Error: módulo de ciclos no disponible.', 'error');
                return;
            }

            resultadoTurborreactor = CicloJouleBrayton.calcular('turborreactor', parametros);
            // TODO: volcar el resultado en las tablas y gráficas de salida
            console.log('Turborreactor:', resultadoTurborreactor);
            mostrarAlerta('Cálculo completado.', 'success');

        } catch (error) {
            console.error('Error en cálculo:', error);
            mostrarAlerta('Error durante el cálculo: ' + error.message, 'error');
        }
    }

    // ── PARÁMETROS Y VALIDACIÓN ───────────────────────────────────────────────
    function valorNumerico(id) {
        return $('#' + id).data('kendoNumericTextBox').value();
    }

    function obtenerParametros() {
        return {
            h_vuelo: {
                valor: convertirANumero($('#altitud')),
                unidad: $('#unidad-altitud').val()
            },
            potencia: {
                valor: convertirANumero($('#potencia')),
                unidad: $('#unidad-potencia').val()
            },
            V0:            valorNumerico('v0'),
            V1:            valorNumerico('v1'),
            rc:            valorNumerico('relacion-compresion'),
            dp_cc:         valorNumerico('dp-cc'),
            T3:            valorNumerico('t-lim'),
            eta_difusor:   valorNumerico('eta-difusor'),
            eta_compresor: valorNumerico('eta-compresor'),
            eta_turbina:   valorNumerico('eta-turbina'),
            eta_tobera:    valorNumerico('eta-tobera')
        };
    }

    function marcarError(selector, mensaje) {
        $(selector).addClass('input-error');
        mostrarAlerta(mensaje, 'error');
        return false;
    }

    function validarParametros(p) {
        if (p.h_vuelo.valor === null || p.h_vuelo.valor < 0)
            return marcarError('#altitud', 'Altitud: valor inválido o negativo.');
        if (p.potencia.valor === null || p.potencia.valor <= 0)
            return marcarError('#potencia', 'Potencia: debe ser un número positivo.');
        if (p.V0 === null || p.V0 <= 0)
            return marcarError('#v0', 'V0: debe ser un número positivo.');
        if (p.V1 === null || p.V1 <= 0)
            return marcarError('#v1', 'V1: debe ser un número positivo.');
        if (p.V1 > p.V0)
            return marcarError('#v1', 'V1 debe ser ≤ V0: el difusor desacelera la corriente.');
        if (p.rc === null || p.rc <= 1)
            return marcarError('#relacion-compresion', 'Relación de Compresión: debe ser mayor a 1.');
        if (p.dp_cc === null || p.dp_cc < 0 || p.dp_cc >= 100)
            return marcarError('#dp-cc', 'Δp cámara: debe estar entre 0 y 100 %.');
        if (p.T3 === null || p.T3 <= 0)
            return marcarError('#t-lim', 'T límite: debe ser un número positivo.');

        const nombres = {
            'eta-difusor':   'Rendimiento del difusor',
            'eta-compresor': 'Rendimiento del compresor',
            'eta-turbina':   'Rendimiento de la turbina',
            'eta-tobera':    'Rendimiento de la tobera'
        };
        for (const id of RENDIMIENTOS) {
            const v = valorNumerico(id);
            if (v === null || v <= 0 || v > 1)
                return marcarError('#' + id, nombres[id] + ': debe estar entre 0 (excl.) y 1.');
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
        ['v0', 'v1', 'relacion-compresion', 'dp-cc', 't-lim'].concat(RENDIMIENTOS).forEach(function(id) {
            $('#' + id).data('kendoNumericTextBox').value(null);
        });
        $('#potencia').val('');
        $('#altitud').val('');
        $('#ciclo-pv').prop('disabled', false).val('otto');
        $('#ciclo-ts').prop('disabled', false).val('otto');
        $('#parametros-form input, #parametros-form select').removeClass('input-error');
        resultadosActuales = {};
        resultadoTurborreactor = null;
        inicializarTablaEstados('otto');
        $('#ciclo-estados').prop('disabled', false); // select vive dentro de la tabla; se activa tras rebuild
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data([]);
        // Limpiar gráficos
        ['#plot-pv', '#plot-ts'].forEach(function(sel) {
            const c = $(sel).data('kendoChart');
            if (c) { c.options.series = []; c.refresh(); }
        });
        inicializarGraficoEta();
    }

    // ── GRÁFICOS P-V y T-S ────────────────────────────────────────────────────
    const CHART_COLOR_LINEA = '#5C98CD';   // Lucario blue
    const CHART_COLOR_DOT   = '#E9C062';   // Lucario yellow
    const CHART_N_PUNTOS    = 40;

    function inicializarGraficos() {
        crearGraficoBase('#plot-pv', 'v [m³/kg]', 'P [kPa]', '{0:n3}', '{0:n0}');
        crearGraficoBase('#plot-ts', 'ΔS [kCal/(kg·K)]', 'T [K]', '{0:n4}', '{0:n0}');
        inicializarGraficoEta();
    }

    function inicializarGraficoEta() {
        const $el = $('#plot-eta');
        const inst = $el.data('kendoChart');
        if (inst) inst.destroy();
        $el.empty();
        $el.kendoChart({
            legend:  { visible: false, position: 'bottom', labels: { color: '#B0C4D8', font: '10px Segoe UI' } },
            series:  [],
            xAxis: {
                title:  { text: 'r (-)', font: '11px Segoe UI', color: '#B0C4D8', margin: { top: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n0}', color: '#B0C4D8' },
                min: 1, max: 30,
                majorGridLines: { color: '#3D5166' },
                color: '#3D5166'
            },
            yAxis: {
                title:  { text: 'η [%]', font: '11px Segoe UI', color: '#B0C4D8', margin: { right: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n0}', color: '#B0C4D8' },
                min: 0, max: 100,
                majorGridLines: { color: '#3D5166' },
                color: '#3D5166'
            },
            tooltip:   { visible: false },
            chartArea: { background: 'transparent', border: { width: 0 }, margin: 4 },
            plotArea:  { border: { width: 0 }, margin: { top: 10, right: 10, bottom: 5, left: 5 } }
        });
    }

    function crearGraficoBase(selector, xLabel, yLabel, xFmt, yFmt) {
        const $el = $(selector);
        const inst = $el.data('kendoChart');
        if (inst) inst.destroy();
        $el.empty();
        $el.kendoChart({
            legend:  { visible: false },
            series:  [],
            xAxis: {
                title: { text: xLabel, font: '11px Segoe UI', color: '#B0C4D8', margin: { top: 2 } },
                labels: { font: '10px Segoe UI', format: xFmt, rotation: -30, color: '#B0C4D8' },
                majorGridLines: { color: '#3D5166' },
                color: '#3D5166'
            },
            yAxis: {
                title: { text: yLabel, font: '11px Segoe UI', color: '#B0C4D8', margin: { right: 2 } },
                labels: { font: '10px Segoe UI', format: yFmt, color: '#B0C4D8' },
                majorGridLines: { color: '#3D5166' },
                color: '#3D5166'
            },
            tooltip: { visible: false },
            chartArea: { background: 'transparent', border: { width: 0 }, margin: 4 },
            plotArea:  { border: { width: 0 }, margin: { top: 10, right: 10, bottom: 5, left: 5 } }
        });
    }

    function renderizarGraficoPV(resultado) {
        const chart = $('#plot-pv').data('kendoChart');
        if (!chart || !resultado) return;
        chart.options.series = generarSeriesPV(resultado);
        chart.refresh();
    }

    function renderizarGraficoTS(resultado) {
        const chart = $('#plot-ts').data('kendoChart');
        if (!chart || !resultado) return;
        chart.options.series = generarSeriesTS(resultado);
        chart.refresh();
    }

    function _construirSeriesChart(procPts, estadosPuntos) {
        const series = [];
        procPts.forEach(function(pts) {
            series.push({
                type: 'scatterLine',
                data: pts,
                color: CHART_COLOR_LINEA,
                width: 2,
                markers: { visible: false },
                tooltip: { visible: false },
                visibleInLegend: false
            });
        });
        estadosPuntos.forEach(function(ep) {
            series.push({
                type: 'scatter',
                name: ep.label,
                data: [{ x: ep.x, y: ep.y }],
                color: CHART_COLOR_DOT,
                markers: {
                    type: 'circle', size: 9,
                    background: CHART_COLOR_DOT,
                    border: { color: '#fff', width: 2 }
                },
                tooltip: {
                    visible: true,
                    template: 'Estado #= series.name #'
                },
                visibleInLegend: false
            });
        });
        return series;
    }

    function generarSeriesPV(resultado) {
        const est  = resultado.estados;
        const k    = resultado.k_aire;
        const tipo = resultado.tipo_ciclo.toLowerCase();
        const n    = CHART_N_PUNTOS;

        function adiabatica(eA, eB) {
            const C = eA.P * Math.pow(eA.v, k);
            const pts = [];
            for (let i = 0; i <= n; i++) {
                const v = eA.v + (eB.v - eA.v) * i / n;
                pts.push({ x: v, y: C / Math.pow(v, k) / 1000 });
            }
            return pts;
        }
        function isochorica(eA, eB) {
            return [{ x: eA.v, y: eA.P / 1000 }, { x: eB.v, y: eB.P / 1000 }];
        }
        function isobarica(eA, eB) {
            return [{ x: eA.v, y: eA.P / 1000 }, { x: eB.v, y: eB.P / 1000 }];
        }

        const procPts = [];
        if (tipo === 'otto') {
            procPts.push(adiabatica(est[0], est[1]));
            procPts.push(isochorica(est[1], est[2]));
            procPts.push(adiabatica(est[2], est[3]));
            procPts.push(isochorica(est[3], est[0]));
        } else if (tipo === 'diesel') {
            procPts.push(adiabatica(est[0], est[1]));
            procPts.push(isobarica(est[1], est[2]));
            procPts.push(adiabatica(est[2], est[3]));
            procPts.push(isochorica(est[3], est[0]));
        } else {
            procPts.push(adiabatica(est[0], est[1]));
            procPts.push(isochorica(est[1], est[2]));
            procPts.push(isobarica(est[2], est[3]));
            procPts.push(adiabatica(est[3], est[4]));
            procPts.push(isochorica(est[4], est[0]));
        }

        const estadosPuntos = est.map(function(e) {
            return { x: e.v, y: e.P / 1000, label: String(e.num) };
        });

        return _construirSeriesChart(procPts, estadosPuntos);
    }

    function generarSeriesTS(resultado) {
        const est  = resultado.estados;
        const Cv   = resultado.Cv_J;
        const Cp   = resultado.Cp_J;
        const JK   = resultado.JK;
        const tipo = resultado.tipo_ciclo.toLowerCase();
        const n    = CHART_N_PUNTOS;

        function adiabatTS(S_val, TA, TB) {
            return [{ x: S_val, y: TA }, { x: S_val, y: TB }];
        }
        function isocTS(S_ini, TA, TB) {
            const S_fin = S_ini + Cv * Math.log(TB / TA) / JK;
            const pts = [];
            for (let i = 0; i <= n; i++) {
                const S = S_ini + (S_fin - S_ini) * i / n;
                pts.push({ x: S, y: TA * Math.exp((S - S_ini) * JK / Cv) });
            }
            return pts;
        }
        function isobTS(S_ini, TA, TB) {
            const S_fin = S_ini + Cp * Math.log(TB / TA) / JK;
            const pts = [];
            for (let i = 0; i <= n; i++) {
                const S = S_ini + (S_fin - S_ini) * i / n;
                pts.push({ x: S, y: TA * Math.exp((S - S_ini) * JK / Cp) });
            }
            return pts;
        }

        const Sv = [];
        const procPts = [];

        if (tipo === 'otto') {
            Sv[0] = 0;
            Sv[1] = Sv[0];
            Sv[2] = Sv[1] + Cv * Math.log(est[2].T / est[1].T) / JK;
            Sv[3] = Sv[2];
            procPts.push(adiabatTS(Sv[0], est[0].T, est[1].T));
            procPts.push(isocTS(Sv[1], est[1].T, est[2].T));
            procPts.push(adiabatTS(Sv[2], est[2].T, est[3].T));
            procPts.push(isocTS(Sv[3], est[3].T, est[0].T));
        } else if (tipo === 'diesel') {
            Sv[0] = 0;
            Sv[1] = Sv[0];
            Sv[2] = Sv[1] + Cp * Math.log(est[2].T / est[1].T) / JK;
            Sv[3] = Sv[2];
            procPts.push(adiabatTS(Sv[0], est[0].T, est[1].T));
            procPts.push(isobTS(Sv[1], est[1].T, est[2].T));
            procPts.push(adiabatTS(Sv[2], est[2].T, est[3].T));
            procPts.push(isocTS(Sv[3], est[3].T, est[0].T));
        } else {
            Sv[0] = 0;
            Sv[1] = Sv[0];
            Sv[2] = Sv[1] + Cv * Math.log(est[2].T / est[1].T) / JK;
            Sv[3] = Sv[2] + Cp * Math.log(est[3].T / est[2].T) / JK;
            Sv[4] = Sv[3];
            procPts.push(adiabatTS(Sv[0], est[0].T, est[1].T));
            procPts.push(isocTS(Sv[1], est[1].T, est[2].T));
            procPts.push(isobTS(Sv[2], est[2].T, est[3].T));
            procPts.push(adiabatTS(Sv[3], est[3].T, est[4].T));
            procPts.push(isocTS(Sv[4], est[4].T, est[0].T));
        }

        const estadosPuntos = est.map(function(e, i) {
            return { x: Sv[i], y: e.T, label: String(e.num) };
        });

        return _construirSeriesChart(procPts, estadosPuntos);
    }

    function renderizarGraficoEta(ciclo, parametros) {
        const chart = $('#plot-eta').data('kendoChart');
        if (!chart || !parametros) return;

        const curvas = generarCurvasEta(ciclo, parametros);
        const esComparativa = ciclo === 'comparacion';
        const CICLOS_CFG = [
            { key: 'otto',   name: 'Otto',    color: '#5C98CD' },
            { key: 'diesel', name: 'Diesel',  color: '#A5C261' },
            { key: 'sabath', name: 'Sabathé', color: '#E9C062' }
        ];

        const series = [];
        CICLOS_CFG.forEach(function(cfg) {
            if (!curvas[cfg.key] || curvas[cfg.key].length === 0) return;
            series.push({
                type: 'scatterLine',
                name: cfg.name,
                data: curvas[cfg.key],
                color: cfg.color,
                width: 1.5,
                markers: { visible: false },
                visibleInLegend: esComparativa,
                tooltip: { visible: false }
            });
        });

        chart.options.series = series;
        chart.options.legend = {
            visible: esComparativa,
            position: 'bottom',
            labels: { color: '#B0C4D8', font: '10px Segoe UI' }
        };
        chart.refresh();
    }

    function generarCurvasEta(ciclo, parametros) {
        const atm  = CiclosMotores.calcularCondicionesAtmosfericas(parametros.altitud);
        const k    = parametros.kAire;
        const R    = 286.71;
        const Cv   = R / (k - 1);
        const Cp   = k * R / (k - 1);
        const T1   = atm.temperatura_K + (parametros.deltaT || 0);

        const rangR = [];
        for (let r = 1.05; r <= 30.01; r += 0.25) rangR.push(parseFloat(r.toFixed(4)));

        function etaOtto(r) {
            return 1 - Math.pow(r, 1 - k);
        }

        function etaDiesel(r) {
            const q_in = 42.00e6 * 0.0638;
            const T2   = T1 * Math.pow(r, k - 1);
            const rc   = 1 + q_in / (Cp * T2);
            if (rc <= 1 || rc >= r) return null;
            return 1 - (Math.pow(rc, k) - 1) / (k * (rc - 1) * Math.pow(r, k - 1));
        }

        function etaSabathe(r) {
            const alpha   = 1.5;
            const q_total = 43.00e6 * 0.068;
            const T2      = T1 * Math.pow(r, k - 1);
            const q_vc    = Cv * T2 * (alpha - 1);
            const q_pc    = Math.max(0, q_total - q_vc);
            const T3      = T2 * alpha;
            const beta    = 1 + q_pc / (Cp * T3);
            const num     = alpha * Math.pow(beta, k) - 1;
            const den     = (alpha - 1 + alpha * k * (beta - 1)) * Math.pow(r, k - 1);
            if (den === 0) return null;
            return 1 - num / den;
        }

        const incl = {
            otto:   ciclo === 'otto'   || ciclo === 'comparacion',
            diesel: ciclo === 'diesel' || ciclo === 'comparacion',
            sabath: ciclo === 'sabath' || ciclo === 'comparacion'
        };

        const curvas = {};
        if (incl.otto) {
            curvas.otto = rangR
                .map(r => { const e = etaOtto(r); return e > 0 && e < 1 ? { x: r, y: e * 100 } : null; })
                .filter(Boolean);
        }
        if (incl.diesel) {
            curvas.diesel = rangR
                .map(r => { const e = etaDiesel(r); return e !== null && e > 0 && e < 1 ? { x: r, y: e * 100 } : null; })
                .filter(Boolean);
        }
        if (incl.sabath) {
            curvas.sabath = rangR
                .map(r => { const e = etaSabathe(r); return e !== null && e > 0 && e < 1 ? { x: r, y: e * 100 } : null; })
                .filter(Boolean);
        }
        return curvas;
    }

    // ── ALERTAS ───────────────────────────────────────────────────────────────
    function mostrarAlerta(mensaje, tipo) {
        tipo = tipo || 'warning';
        const $alerta = $(`<div class="alert alert-${tipo}">${mensaje}</div>`);
        $('body').append($alerta);
        setTimeout(function() {
            $alerta.fadeOut(300, function() { $(this).remove(); });
        }, 4000);
    }
});
