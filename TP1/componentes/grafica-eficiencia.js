/**
 * COMPONENTE DE EJEMPLO - Gráfica de Eficiencia Térmica
 * 
 * Este es un archivo de ejemplo para mostrar cómo crear componentes
 * que se pueden reutilizar en la calculadora.
 * 
 * ESTRUCTURA:
 * Cada componente debe tener:
 * 1. Una función que inicialize el componente
 * 2. Una función que renderice el HTML
 * 3. Métodos para actualizar datos
 */

/**
 * Componente: Gráfica de Eficiencia Térmica
 * Muestra cómo varía la eficiencia térmica según el ciclo termodinámico
 */
const ComponenteEficiencia = {
    
    /**
     * Inicializar el componente
     */
    init: function() {
        this.render();
        this.setupChart();
    },

    /**
     * Renderizar el HTML del componente
     */
    render: function() {
        const html = `
            <div id="grafica-eficiencia" class="componente-grafica">
                <h3>Eficiencia Térmica por Ciclo</h3>
                <canvas id="canvas-eficiencia"></canvas>
                <p class="descripcion">
                    Comparación de eficiencias térmicas teóricas para diferentes ciclos termodinámicos.
                    Los valores mostrados corresponden a las fórmulas teóricas basadas en la relación de compresión.
                </p>
            </div>
        `;
        
        $('#componentes-section').append(html);
    },

    /**
     * Configurar la gráfica (usando Kendo UI Charts)
     */
    setupChart: function() {
        // Datos de ejemplo
        const datosEficiencia = [
            { relacion: 8, otto: 56.5, diesel: 45.2, sabath: 50.8 },
            { relacion: 9, otto: 58.2, diesel: 46.9, sabath: 52.4 },
            { relacion: 10, otto: 59.7, diesel: 48.4, sabath: 53.9 },
            { relacion: 11, otto: 61.0, diesel: 49.8, sabath: 55.2 },
            { relacion: 12, otto: 62.2, diesel: 51.0, sabath: 56.3 }
        ];

        $('#canvas-eficiencia').kendoChart({
            dataSource: {
                data: datosEficiencia
            },
            series: [
                {
                    field: 'otto',
                    name: 'Ciclo Otto',
                    color: '#667eea'
                },
                {
                    field: 'diesel',
                    name: 'Ciclo Diesel',
                    color: '#f093fb'
                },
                {
                    field: 'sabath',
                    name: 'Ciclo Sabathé',
                    color: '#4facfe'
                }
            ],
            xAxis: {
                field: 'relacion',
                title: {
                    text: 'Relación de Compresión'
                }
            },
            yAxis: {
                title: {
                    text: 'Eficiencia Térmica (%)'
                }
            },
            tooltip: {
                visible: true,
                format: '#= seriesName #: #= value #%'
            },
            legend: {
                position: 'top'
            }
        });
    },

    /**
     * Actualizar datos de la gráfica
     * @param {array} nuevosDatos - Nuevos datos para graficar
     */
    actualizarDatos: function(nuevosDatos) {
        const chart = $('#canvas-eficiencia').data('kendoChart');
        if (chart) {
            chart.dataSource.data(nuevosDatos);
            chart.refresh();
        }
    }
};

// Inicializar cuando el documento esté listo
$(document).ready(function() {
    // Descomentar esta línea cuando se desee cargar el componente:
    // ComponenteEficiencia.init();
});
