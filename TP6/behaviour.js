/**
 * BEHAVIOUR.JS
 * Calculadora de Turborreactores (ciclo Joule-Brayton real) - Predimensionamiento Aeronáutico
 */

$(document).ready(function() {

    // ── VARIABLES GLOBALES ────────────────────────────────────────────────────
    let resultadoTurborreactor = null;

    const RENDIMIENTOS = ['eta-difusor', 'eta-compresor', 'eta-turbina', 'eta-tobera'];
    const CAMPOS_NUMERICOS = ['v0', 'v1', 'relacion-compresion', 'dp-cc', 't-lim', 'bpr'].concat(RENDIMIENTOS);

    // Tabla de estados: se declaran antes de inicializarApp(), que la construye.
    // Ciclo del turborreactor (sin fan) y una fila Total con el empuje (con fan).
    const KJ_POR_KCAL = 4.184;
    const ESTADOS_JB  = ['0', '1', '2', '3', '4', 'j'];
    const PROCESOS_JB = [
        { etapa: '(0-1)', tiempo: 'Difusor'    },
        { etapa: '(1-2)', tiempo: 'Compresión' },
        { etapa: '(2-3)', tiempo: 'Combustión' },
        { etapa: '(3-4)', tiempo: 'Expansión'  },
        { etapa: '(4-j)', tiempo: 'Tobera'     }
    ];

    // Gráficos: se declaran antes de inicializarApp(), que los construye.
    // Diagrama T-s: un color por componente, estados en amarillo (como TP1).
    const CHART_COLOR_DOT  = '#E9C062';   // Lucario yellow
    const CHART_COLOR_ISO  = '#7A8FA6';
    const CHART_TEXTO      = '#B0C4D8';
    const CHART_GRILLA     = '#3D5166';
    const TS_COMPONENTES = [
        { nombre: 'Difusor',              leyenda: 'Difusor A→01',   color: '#8EC5F0' },
        { nombre: 'Compresor',            leyenda: 'Compresor 01→02', color: '#5C98CD' },
        { nombre: 'Cámara de combustión', leyenda: 'Cámara 02→03',    color: '#EB4C4C' },
        { nombre: 'Turbina',              leyenda: 'Turbina 03→04',   color: '#A5C261' },
        { nombre: 'Tobera',               leyenda: 'Tobera 04→j',     color: '#E9A33E' }
    ];
    // Estados de la tabla (0…4, j) con la nomenclatura del .py (A, 01…04, j)
    const TS_ETIQUETAS = { '0': 'A', '1': '01', '2': '02', '3': '03', '4': '04', 'j': 'j' };
    // Gráfico propulsivo (Ej. 5 del .py): curvas adimensionales vs ν = V0/Vj
    const PROP_CURVAS = [
        { clave: 'empuje_adimensional', leyenda: 'Eₛ/Vⱼ = 1 − ν',          color: '#5C98CD', op: 'empuje'   },
        { clave: 'rendimiento_prop',    leyenda: 'ηₚ = 2ν/(1 + ν)',          color: '#A5C261', op: 'eta_p'    },
        { clave: 'potencia_empuje',     leyenda: 'Pₑ/(ṁ·Vⱼ²) = ν·(1 − ν)',  color: '#EB4C4C', op: 'potencia' }
    ];

    // ── INICIALIZACIÓN ────────────────────────────────────────────────────────
    inicializarApp();

    function inicializarApp() {
        // La tabla vacía y los eventos primero: no dependen de Kendo
        inicializarTablaEstados();
        inicializarEventos();
        inicializarKendoControls();
        inicializarKendoGrids();
        inicializarGraficos();
    }

    // ── KENDO CONTROLS ────────────────────────────────────────────────────────
    function inicializarKendoControls() {
        $('#v0').kendoNumericTextBox({ min: 0, decimals: 1, step: 10 });
        $('#v1').kendoNumericTextBox({ min: 0, decimals: 1, step: 10 });
        $('#relacion-compresion').kendoNumericTextBox({ min: 1, decimals: 2, step: 0.5 });
        $('#dp-cc').kendoNumericTextBox({ min: 0, max: 100, decimals: 1, step: 0.5 });
        $('#t-lim').kendoNumericTextBox({ min: 0, decimals: 0, step: 10 });
        $('#bpr').kendoNumericTextBox({ min: 0, decimals: 2, step: 0.1 });
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
    // Filas de estado intercaladas con filas de proceso (tiempos del ciclo).
    // El modelo entrega kPa y kJ; la tabla muestra Pa y kCal como en TP1.

    function fmt(n, dec) {
        if (n == null) return '-';
        return n.toLocaleString('es-AR', {
            minimumFractionDigits: dec,
            maximumFractionDigits: dec
        });
    }

    function envolverTablaEstados(filas) {
        return `
            <thead>
                <tr>
                    <th colspan="12" class="tabla-ciclo-titulo">
                        Estados y Tiempos del Ciclo — CICLO JOULE-BRAYTON (TURBORREACTOR)
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

    function construirHTMLTabla(resultado) {
        const ALERTA = 'background:#eb4c4c;color:#F8F8F8;font-weight:700';
        const emp = resultado.empuje;

        let filas = '';
        resultado.estados.forEach(function(e, i) {
            const P_Pa = e.P * 1000;
            const stP = P_Pa > 10000000 ? ` style="${ALERTA}"` : '';
            const stT = e.T > 4800      ? ` style="${ALERTA}"` : '';
            // Como el .py: 0 y j estáticos, 1–4 de remanso. u y h con cp/cv del
            // fluido de cada estado (aire hasta 2, gases de combustión desde 3)
            filas += `<tr class="fila-estado">
                <td>${e.num}</td><td colspan="2" title="Fluido: ${e.fluido}">${e.magnitud}</td>
                <td${stP}>${fmt(P_Pa, 2)}</td>
                <td>${fmt(e.rho, 4)}</td>
                <td>${fmt(1 / e.rho, 6)}</td>
                <td${stT}>${fmt(e.T, 2)}</td>
                <td>${fmt(e.u / KJ_POR_KCAL, 3)}</td>
                <td>${fmt(e.h / KJ_POR_KCAL, 3)}</td>
                <td colspan="3">-</td>
            </tr>`;

            if (i < resultado.procesos.length) {
                const p = resultado.procesos[i];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td colspan="6">-</td>
                    <td>${p.q != null ? fmt(p.q / KJ_POR_KCAL, 3) : '-'}</td>
                    <td>${p.w != null ? fmt(p.w, 2) : '-'}</td>
                    <td>${fmt(p.ds / KJ_POR_KCAL, 4)}</td>
                </tr>`;
            }
        });

        // Empuje determinado con el fan: E = ṁc·(Vj − V0) + ṁb·(Vjf − V0)
        filas += `<tr class="fila-proceso">
            <td>-</td><td colspan="2"><b>Total</b></td>
            <td colspan="6">BPR = ${fmt(emp.bpr, 2)} · FPR óptimo = ${fmt(emp.fpr, 3)} · ṁ = ${fmt(emp.m_total, 2)} kg/s · E sin fan = ${fmt(emp.E_turborreactor, 1)} N</td>
            <td>-</td>
            <td title="Núcleo Ec = ${fmt(emp.Ec, 1)} N + fan Ef = ${fmt(emp.Ef, 1)} N"><b>E = ${fmt(emp.E, 1)} N</b></td>
            <td>-</td>
        </tr>`;

        return envolverTablaEstados(filas);
    }

    function construirHTMLTablaVacia() {
        let filas = '';
        ESTADOS_JB.forEach(function(num, i) {
            filas += `<tr class="fila-estado">
                <td>${num}</td><td colspan="2">-</td>
                <td colspan="9">-</td>
            </tr>`;
            if (i < PROCESOS_JB.length) {
                const p = PROCESOS_JB[i];
                filas += `<tr class="fila-proceso">
                    <td>-</td><td>${p.etapa}</td><td>${p.tiempo}</td>
                    <td colspan="9">-</td>
                </tr>`;
            }
        });
        filas += `<tr class="fila-proceso">
            <td>-</td><td colspan="2"><b>Total</b></td>
            <td colspan="9">-</td>
        </tr>`;
        return envolverTablaEstados(filas);
    }

    function inicializarTablaEstados() {
        $('#tabla-estados').html(construirHTMLTablaVacia());
    }

    function cargarTablaEstados(resultado) {
        if (!resultado) {
            inicializarTablaEstados();
            return;
        }
        $('#tabla-estados').html(construirHTMLTabla(resultado));
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

        $(window).on('resize', function() {
            ['#plot-ts', '#plot-prop'].forEach(function(sel) {
                const chart = $(sel).data('kendoChart');
                if (chart) chart.resize();
            });
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
            cargarTablaEstados(resultadoTurborreactor);
            renderizarGraficoTS(resultadoTurborreactor);
            renderizarGraficoPropulsivo(resultadoTurborreactor);
            // TODO: resumen del ciclo

            resultadoTurborreactor.advertencias.forEach(function(msg) {
                mostrarAlerta(msg, 'warning');
            });
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
            caudal_sl: {
                valor: convertirANumero($('#caudal')),
                unidad: $('#unidad-caudal').val()
            },
            V0:            valorNumerico('v0'),
            V1:            valorNumerico('v1'),
            rc:            valorNumerico('relacion-compresion'),
            dp_cc:         valorNumerico('dp-cc'),
            T3:            valorNumerico('t-lim'),
            bpr:           valorNumerico('bpr'),
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
        if (p.caudal_sl.valor === null || p.caudal_sl.valor <= 0)
            return marcarError('#caudal', 'Caudal de aire SL: debe ser un número positivo.');
        if (p.V0 === null || p.V0 < 0)
            return marcarError('#v0', 'V0: debe ser mayor o igual a 0 (0 = despegue estático).');
        if (p.V1 === null || p.V1 <= 0)
            return marcarError('#v1', 'V1: debe ser un número positivo.');
        if (p.rc === null || p.rc <= 1)
            return marcarError('#relacion-compresion', 'Relación de Compresión: debe ser mayor a 1.');
        if (p.dp_cc === null || p.dp_cc < 0 || p.dp_cc >= 100)
            return marcarError('#dp-cc', 'Δp cámara: debe estar entre 0 y 100 %.');
        if (p.T3 === null || p.T3 <= 0)
            return marcarError('#t-lim', 'T límite: debe ser un número positivo.');
        if (p.bpr === null || p.bpr < 0)
            return marcarError('#bpr', 'BPR: debe ser mayor o igual a 0 (0 = turborreactor puro).');

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
        } else if (/^-?\d{1,3}(\.\d{3})+$/.test(valor)) {
            // Solo puntos en grupos de 3 → separador de miles (es-AR): 4.900 = 4900
            valor = valor.replace(/\./g, '');
        }
        const n = parseFloat(valor);
        return isNaN(n) ? null : n;
    }

    // ── FORMULARIO ────────────────────────────────────────────────────────────
    function limpiarFormulario() {
        $('#parametros-form')[0].reset();
        CAMPOS_NUMERICOS.forEach(function(id) {
            $('#' + id).data('kendoNumericTextBox').value(null);
        });
        $('#caudal').val('');
        $('#altitud').val('');
        $('#parametros-form input, #parametros-form select').removeClass('input-error');
        resultadoTurborreactor = null;
        inicializarTablaEstados();
        const $grid = $('#tabla-resumen').data('kendoGrid');
        if ($grid) $grid.dataSource.data([]);
        inicializarGraficos();
    }

    // ── GRÁFICOS ──────────────────────────────────────────────────────────────
    // Diagrama T-s del turborreactor real (sin fan), como el Ej. 5 del .py:
    // un color por componente, estados en amarillo (como TP1) e isobaras punteadas.
    function inicializarGraficos() {
        inicializarGraficoTS();
        inicializarGraficoPropulsivo();
    }

    function inicializarGraficoTS() {
        const $el = $('#plot-ts');
        const inst = $el.data('kendoChart');
        if (inst) inst.destroy();
        $el.empty();
        $el.kendoChart({
            legend: {
                visible: true,
                position: 'bottom',
                labels: { font: '10px Segoe UI', color: CHART_TEXTO }
            },
            // Serie vacía del tipo correcto: sin ella Kendo dibuja sus ejes por defecto
            series: [{ type: 'scatterLine', data: [], visibleInLegend: false }],
            xAxis: {
                title: { text: 's − sA [kJ/(kg·K)]', font: '11px Segoe UI', color: CHART_TEXTO, margin: { top: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n1}', color: CHART_TEXTO },
                min: 0, max: 1.4, majorUnit: 0.2,  // rango vacío; al calcular se ajusta a los datos
                majorGridLines: { color: CHART_GRILLA },
                color: CHART_GRILLA,
                axisCrossingValue: -1000        // eje T siempre a la izquierda
            },
            yAxis: {
                title: { text: 'T [K]', font: '11px Segoe UI', color: CHART_TEXTO, margin: { right: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n0}', color: CHART_TEXTO },
                min: 0, max: 1400, majorUnit: 200,
                majorGridLines: { color: CHART_GRILLA },
                color: CHART_GRILLA,
                axisCrossingValue: -1000        // eje s siempre abajo
            },
            tooltip: { visible: false },
            chartArea: { background: 'transparent', border: { width: 0 }, margin: 4 },
            plotArea:  { border: { width: 0 }, margin: { top: 10, right: 16, bottom: 5, left: 5 } }
        });
    }

    function renderizarGraficoTS(resultado) {
        const chart = $('#plot-ts').data('kendoChart');
        if (!chart || !resultado) return;

        const series = [];

        // Isobaras de referencia (punteadas)
        resultado.curvas.isobaras.forEach(function(iso) {
            series.push({
                type: 'scatterLine', data: iso.puntos,
                color: CHART_COLOR_ISO, width: 1, dashType: 'dot',
                markers: { visible: false }, tooltip: { visible: false },
                visibleInLegend: false
            });
        });

        // Procesos: un color por componente
        TS_COMPONENTES.forEach(function(comp) {
            const curva = resultado.curvas.ts.find(function(c) { return c.nombre === comp.nombre; });
            if (!curva) return;
            series.push({
                type: 'scatterLine', name: comp.leyenda, data: curva.puntos,
                color: comp.color, width: 2.5,
                markers: { visible: false }, tooltip: { visible: false }
            });
        });

        // Estados A … j
        resultado.estados.forEach(function(e) {
            series.push({
                type: 'scatter',
                name: TS_ETIQUETAS[e.num] || e.num,
                data: [{ x: e.s, y: e.T }],
                color: CHART_COLOR_DOT,
                markers: { type: 'circle', size: 9, background: CHART_COLOR_DOT, border: { color: '#fff', width: 2 } },
                labels: {
                    // A debajo: en despegue estático (V0 = 0) A y 01 casi coinciden
                    visible: true, position: e.num === '0' ? 'below' : 'right', template: '#= series.name #',
                    font: '11px Segoe UI', color: '#F8F8F8', background: 'transparent'
                },
                tooltip: {
                    visible: true,
                    template: 'Estado #= series.name # (' + e.magnitud.toLowerCase() + ')<br/>' +
                              'T = #= kendo.toString(value.y, "n1") # K<br/>' +
                              's − s<sub>A</sub> = #= kendo.toString(value.x, "n4") # kJ/(kg·K)'
                },
                visibleInLegend: false
            });
        });

        // Rango de ejes a partir de las curvas, redondeado a valores de la grilla
        const xs = [], ys = [];
        series.forEach(function(se) { se.data.forEach(function(pt) { xs.push(pt.x); ys.push(pt.y); }); });
        const PASO_S = 0.2;
        chart.options.xAxis.min = Math.floor(Math.min.apply(null, xs) / PASO_S) * PASO_S;
        chart.options.xAxis.max = Math.ceil(Math.max.apply(null, xs) / PASO_S) * PASO_S;
        chart.options.xAxis.majorUnit = PASO_S;
        chart.options.yAxis.min = Math.floor((Math.min.apply(null, ys) - 50) / 100) * 100;
        chart.options.yAxis.max = Math.ceil(Math.max.apply(null, ys) / 100) * 100;
        chart.options.yAxis.majorUnit = 100;

        chart.options.series = series;
        chart.refresh();
    }

    // Empuje, rendimiento propulsivo y potencia de empuje vs ν = V0/Vj.
    // Al inicio solo se dibujan los ejes vacíos; curvas, puntos notables y punto
    // de operación salen del resultado de "Calcular" (resultado.curvas).
    function inicializarGraficoPropulsivo() {
        const $el = $('#plot-prop');
        const inst = $el.data('kendoChart');
        if (inst) inst.destroy();
        $el.empty();
        $el.kendoChart({
            legend: {
                visible: true,
                position: 'bottom',
                labels: { font: '11px Segoe UI', color: CHART_TEXTO }
            },
            // Serie vacía del tipo correcto: sin ella Kendo dibuja sus ejes por defecto
            series: [{ type: 'scatterLine', data: [], visibleInLegend: false }],
            xAxis: {
                title: { text: 'ν = V₀/Vⱼ', font: '11px Segoe UI', color: CHART_TEXTO, margin: { top: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n1}', color: CHART_TEXTO },
                min: 0, max: 1, majorUnit: 0.2,
                majorGridLines: { color: CHART_GRILLA },
                color: CHART_GRILLA
            },
            yAxis: {
                title: { text: 'Magnitudes adimensionales', font: '11px Segoe UI', color: CHART_TEXTO, margin: { right: 2 } },
                labels: { font: '10px Segoe UI', format: '{0:n1}', color: CHART_TEXTO },
                min: 0, max: 1.1, majorUnit: 0.2,
                majorGridLines: { color: CHART_GRILLA },
                color: CHART_GRILLA
            },
            tooltip: { visible: false },
            chartArea: { background: 'transparent', border: { width: 0 }, margin: 4 },
            plotArea:  { border: { width: 0 }, margin: { top: 10, right: 16, bottom: 5, left: 5 } }
        });
    }

    // Puntos notables leídos de las curvas calculadas (no fijados de antemano)
    function puntosNotables(curvas) {
        const E   = curvas.empuje_adimensional;
        const eta = curvas.rendimiento_prop;
        const pot = curvas.potencia_empuje;
        const potMax = pot.reduce(function(a, b) { return b.y > a.y ? b : a; });
        const fin    = E[E.length - 1];
        return [
            { punto: E[0],             color: '#5C98CD', pos: 'right',
              texto: 'Punto fijo: empuje máximo, ηₚ = ' + fmt(eta[0].y, 0) },
            { punto: potMax,           color: '#EB4C4C', pos: 'above',
              texto: 'Máx. potencia de empuje (ν = ' + fmt(potMax.x, 1) + ')' },
            { punto: eta[eta.length - 1], color: '#A5C261', pos: 'below', texto: '' },
            { punto: fin,              color: '#F8F8F8', pos: 'left',  texto: '' },
            // Anotación sin marcador, dentro del área (como en la referencia)
            { punto: { x: 0.74, y: 0.47 }, color: 'transparent', pos: 'right', oculto: true,
              texto: 'V₀ → Vⱼ: ηₚ → ' + fmt(eta[eta.length - 1].y, 0) + ', empuje → ' + fmt(fin.y, 0) }
        ];
    }

    function renderizarGraficoPropulsivo(resultado) {
        inicializarGraficoPropulsivo();
        const chart = $('#plot-prop').data('kendoChart');
        if (!chart || !resultado) return;

        const curvas = resultado.curvas.propulsivas;
        const po = resultado.curvas.punto_operativo;
        const nu = fmt(po.x, 3);
        const vj = fmt(resultado.magnitudes.Vj, 1);
        const series = [];

        // Curvas del cálculo
        PROP_CURVAS.forEach(function(c) {
            series.push({
                type: 'scatterLine', name: c.leyenda, data: curvas[c.clave],
                color: c.color, width: 2.5,
                markers: { visible: false }, tooltip: { visible: false }
            });
        });

        // Puntos notables con su anotación
        puntosNotables(curvas).forEach(function(n) {
            series.push({
                type: 'scatter', data: [n.punto],
                color: n.color,
                markers: n.oculto ? { visible: false }
                                  : { type: 'circle', size: 8, background: n.color, border: { color: n.color, width: 1 } },
                labels: {
                    visible: n.texto !== '', position: n.pos, template: n.texto,
                    font: '10px Segoe UI', color: CHART_TEXTO, background: 'transparent'
                },
                tooltip: { visible: false },
                visibleInLegend: false
            });
        });

        // Línea vertical del punto de operación (turborreactor sin fan)
        series.push({
            type: 'scatterLine', name: 'Operación: ν = ' + nu,
            data: [{ x: po.x, y: 0 }, { x: po.x, y: 1.1 }],
            color: CHART_COLOR_DOT, width: 1.5, dashType: 'dash',
            markers: { visible: false }, tooltip: { visible: false }
        });

        // El punto de operación sobre cada curva
        PROP_CURVAS.forEach(function(c) {
            series.push({
                type: 'scatter', data: [{ x: po.x, y: po[c.op] }],
                color: CHART_COLOR_DOT,
                markers: { type: 'circle', size: 9, background: CHART_COLOR_DOT, border: { color: '#fff', width: 2 } },
                tooltip: {
                    visible: true,
                    template: c.leyenda + '<br/>ν = V₀/Vⱼ = ' + nu + ' (Vⱼ = ' + vj + ' m/s)<br/>' +
                              'valor = #= kendo.toString(value.y, "n3") #'
                },
                visibleInLegend: false
            });
        });

        chart.options.series = series;
        chart.refresh();
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
