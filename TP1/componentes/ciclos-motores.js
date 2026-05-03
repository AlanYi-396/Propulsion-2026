/**
 * CICLOS MOTORES - Modelos Matemáticos
 * =====================================
 * 
 * Módulo para el cálculo de ciclos termodinámicos:
 * - Ciclo Otto
 * - Ciclo Diesel
 * - Ciclo Sabathé (mixto)
 * 
 * Parámetros de entrada recopilados del formulario:
 * - altitud: {valor: número, unidad: string}
 * - potencia: número (kW)
 * - combustible: string
 * - mezlaRelativa: número (λ)
 * - rpm: número
 * - kAire: número (γ)
 * - rendimientoMecanico: número (0 < η < 1)
 * - ciclo: string (otto, diesel, sabath)
 */

const CiclosMotores = {
    
    /**
     * Constantes físicas
     */
    constantes: {
        R_aire: 287,                    // Constante específica del aire (J/kg·K)
        P_atm_nivel_mar: 101325,       // Presión atmosférica a nivel del mar (Pa)
        T_standar: 288.15,             // Temperatura estándar (K)
        g: 9.81,                       // Aceleración de la gravedad (m/s²)
        L_gradiente: 0.0065,           // Gradiente de temperatura (K/m)
        rho_aire_sea_level: 1.225      // Densidad del aire a nivel del mar (kg/m³)
    },

    /**
     * Función principal que distribuye el cálculo según el tipo de ciclo
     * @param {string} tipoCiclo - Código del ciclo (otto, diesel, sabath)
     * @param {object} parametros - Objeto con todos los parámetros de entrada
     * @returns {object} Resultados del cálculo
     */
    calcular: function(tipoCiclo, parametros) {
        // Normalizar el tipo de ciclo
        tipoCiclo = tipoCiclo.toLowerCase().trim();

        // Calcular condiciones atmosféricas basadas en altitud
        const atmosfera = this.calcularCondicionesAtmosfericas(parametros.altitud);

        // Distribuir según el tipo de ciclo
        switch(tipoCiclo) {
            case 'otto':
                return this.cicloOtto(parametros, atmosfera);
            case 'diesel':
                return this.cicloDiesel(parametros, atmosfera);
            case 'sabath':
                return this.cicloSabath(parametros, atmosfera);
            default:
                console.error(`Ciclo no reconocido: ${tipoCiclo}`);
                return null;
        }
    },

    /**
     * Calcula las condiciones atmosféricas según la altitud
     * Utiliza el modelo de atmósfera estándar internacional (ISA)
     * 
     * @param {object} altitud - Objeto {valor: número, unidad: string}
     * @returns {object} Propiedades atmosféricas
     */
    calcularCondicionesAtmosfericas: function(altitud) {
        // Convertir altitud a metros
        let h = altitud.valor;
        switch(altitud.unidad) {
            case 'ft':
                h = h * 0.3048; // pies a metros
                break;
            case 'km':
                h = h * 1000;   // km a metros
                break;
            case 'm':
            default:
                // Ya está en metros
                break;
        }

        // Limitar a capas donde se aplica el modelo (hasta 11 km)
        if (h > 11000) {
            console.warn('Altitud mayor a 11 km. Usando modelo simplificado.');
        }

        // Temperatura según modelo ISA
        const T = this.constantes.T_standar - (this.constantes.L_gradiente * h);

        // Presión según modelo ISA (fórmula barométrica)
        const exponente = (this.constantes.g * h) / (this.constantes.R_aire * this.constantes.T_standar);
        const P = this.constantes.P_atm_nivel_mar * Math.pow((this.constantes.T_standar - (this.constantes.L_gradiente * h)) / this.constantes.T_standar, exponente);

        // Densidad según ecuación de estado
        const rho = P / (this.constantes.R_aire * T);

        // Delta y Theta (parámetros de desviación de condiciones estándar)
        const delta = P / this.constantes.P_atm_nivel_mar;
        const theta = T / this.constantes.T_standar;

        return {
            altitud_m: h,
            temperatura_K: T,
            temperatura_C: T - 273.15,
            presion_Pa: P,
            presion_bar: P / 100000,
            densidad_kg_m3: rho,
            delta: delta,
            theta: theta
        };
    },

    /**
     * CICLO OTTO
     * ==========
     * 
     * Procesos termodinámicos:
     * 1→2: Compresión adiabática
     * 2→3: Combustión a volumen constante
     * 3→4: Expansión adiabática
     * 4→1: Rechazo de calor a volumen constante
     * 
     * @param {object} parametros - Parámetros de entrada
     * @param {object} atmosfera - Condiciones atmosféricas
     * @returns {object} Resultados del ciclo Otto
     */
    cicloOtto: function(parametros, atmosfera) {
        console.log('=== CICLO OTTO ===');
        console.log('Parámetros:', parametros);
        console.log('Atmósfera:', atmosfera);

        // ========== PARÁMETROS DE ENTRADA ==========
        // Condiciones de operación
        const rpm = parametros.rpm;
        const P_atm = atmosfera.presion_Pa;
        const T_atm = atmosfera.temperatura_K;
        const rho_atm = atmosfera.densidad_kg_m3;
        const lambda = parametros.mezlaRelativa;
        const eta_mecanico = parametros.rendimientoMecanico;
        const k = parametros.kAire;
        const W_requerida = parametros.potencia * 1000; // convertir kW a W

        // ========== CÁLCULOS INTERMEDIOS ==========
        // Estos valores deberán venir de parámetros adicionales del motor
        // (relación de compresión, cilindrada, etc.) que aún no están en el formulario
        
        const r = 8;  // Relación de compresión (placeholder)
        const n_cilindros = 4; // Número de cilindros (placeholder)
        const V_cilindrada = 2000 / 1000000; // Cilindrada total en m³ (placeholder: 2L)

        // Constante específica del aire
        const R = this.constantes.R_aire;

        // ========== CICLO TERMODINÁMICO ==========
        // Estado 1 (inicio de compresión)
        const P1 = P_atm;
        const T1 = T_atm;
        const V1 = V_cilindrada / n_cilindros * 4 / 2; // volumen en cilindrada 4T

        // Estado 2 (fin de compresión)
        const P2 = P1 * Math.pow(r, k);
        const T2 = T1 * Math.pow(r, k - 1);
        const V2 = V1 / r;

        // Combustión - parámetros teóricos para Otto
        const T_combustion = null; // A definir según combustible y λ
        
        // Estado 3 (fin de combustión, antes de expansión)
        const P3 = null; // A definir
        const T3 = null; // A definir
        const V3 = V2;

        // Estado 4 (fin de expansión)
        const P4 = null; // A definir
        const T4 = null; // A definir
        const V4 = V1;

        // ========== PARÁMETROS DE RENDIMIENTO ==========
        const eta_otto_teorico = null; // 1 - (1 / r^(k-1))
        const eta_otto_real = null; // con factores de pérdida
        const Q_entrada = null; // Calor suministrado
        const Q_salida = null; // Calor rechazado
        const W_ciclo = null; // Trabajo neto del ciclo
        const W_indicada = null; // Potencia indicada
        const W_efectiva = null; // Potencia efectiva con rendimiento mecánico
        const presion_media_efectiva = null; // PME

        // ========== RETORNO ==========
        return {
            tipo_ciclo: 'Otto',
            parametros_entrada: {
                rpm,
                presion_atm_Pa: P_atm,
                temperatura_atm_K: T_atm,
                densidad_atm: rho_atm,
                mezcla_relativa: lambda,
                rendimiento_mecanico: eta_mecanico,
                k_aire: k,
                potencia_requerida_W: W_requerida
            },
            parametros_motor: {
                relacion_compresion: r,
                numero_cilindros: n_cilindros,
                cilindrada_total_m3: V_cilindrada
            },
            estados_ciclo: {
                estado_1: { P: P1, T: T1, V: V1 },
                estado_2: { P: P2, T: T2, V: V2 },
                estado_3: { P: P3, T: T3, V: V3 },
                estado_4: { P: P4, T: T4, V: V4 }
            },
            rendimientos: {
                eta_otto_teorico,
                eta_otto_real,
                eta_mecanico: eta_mecanico
            },
            energias: {
                Q_entrada,
                Q_salida,
                W_ciclo,
                W_indicada,
                W_efectiva,
                PME: presion_media_efectiva
            }
        };
    },

    /**
     * CICLO DIESEL
     * ============
     * 
     * Procesos termodinámicos:
     * 1→2: Compresión adiabática
     * 2→3: Combustión a presión constante
     * 3→4: Expansión adiabática
     * 4→1: Rechazo de calor a volumen constante
     * 
     * @param {object} parametros - Parámetros de entrada
     * @param {object} atmosfera - Condiciones atmosféricas
     * @returns {object} Resultados del ciclo Diesel
     */
    cicloDiesel: function(parametros, atmosfera) {
        console.log('=== CICLO DIESEL ===');
        console.log('Parámetros:', parametros);
        console.log('Atmósfera:', atmosfera);

        // ========== PARÁMETROS DE ENTRADA ==========
        const rpm = parametros.rpm;
        const P_atm = atmosfera.presion_Pa;
        const T_atm = atmosfera.temperatura_K;
        const rho_atm = atmosfera.densidad_kg_m3;
        const lambda = parametros.mezlaRelativa;
        const eta_mecanico = parametros.rendimientoMecanico;
        const k = parametros.kAire;
        const W_requerida = parametros.potencia * 1000;

        // ========== CÁLCULOS INTERMEDIOS ==========
        const r = 16; // Relación de compresión (placeholder, típica para Diesel)
        const n_cilindros = 4;
        const V_cilindrada = 2000 / 1000000; // m³
        const cutoff_ratio = 2; // Relación de expansión isobárica (placeholder)

        const R = this.constantes.R_aire;

        // ========== CICLO TERMODINÁMICO ==========
        // Estado 1 (inicio de compresión)
        const P1 = P_atm;
        const T1 = T_atm;
        const V1 = V_cilindrada / n_cilindros * 4 / 2;

        // Estado 2 (fin de compresión)
        const P2 = P1 * Math.pow(r, k);
        const T2 = T1 * Math.pow(r, k - 1);
        const V2 = V1 / r;

        // Combustión isobárica (presión constante)
        const T_combustion_diesel = null; // A definir
        const P3 = P2; // Presión constante
        const V3 = null; // A definir según cutoff_ratio
        const T3 = null; // A definir

        // Estado 4 (fin de expansión)
        const P4 = null;
        const T4 = null;
        const V4 = V1;

        // ========== PARÁMETROS DE RENDIMIENTO ==========
        const eta_diesel_teorico = null;
        const eta_diesel_real = null;
        const Q_entrada = null;
        const Q_salida = null;
        const W_ciclo = null;
        const W_indicada = null;
        const W_efectiva = null;
        const presion_media_efectiva = null;

        // ========== RETORNO ==========
        return {
            tipo_ciclo: 'Diesel',
            parametros_entrada: {
                rpm,
                presion_atm_Pa: P_atm,
                temperatura_atm_K: T_atm,
                densidad_atm: rho_atm,
                mezcla_relativa: lambda,
                rendimiento_mecanico: eta_mecanico,
                k_aire: k,
                potencia_requerida_W: W_requerida
            },
            parametros_motor: {
                relacion_compresion: r,
                numero_cilindros: n_cilindros,
                cilindrada_total_m3: V_cilindrada,
                cutoff_ratio: cutoff_ratio
            },
            estados_ciclo: {
                estado_1: { P: P1, T: T1, V: V1 },
                estado_2: { P: P2, T: T2, V: V2 },
                estado_3: { P: P3, T: T3, V: V3 },
                estado_4: { P: P4, T: T4, V: V4 }
            },
            rendimientos: {
                eta_diesel_teorico,
                eta_diesel_real,
                eta_mecanico: eta_mecanico
            },
            energias: {
                Q_entrada,
                Q_salida,
                W_ciclo,
                W_indicada,
                W_efectiva,
                PME: presion_media_efectiva
            }
        };
    },

    /**
     * CICLO SABATHÉ (Ciclo Mixto)
     * ============================
     * 
     * Procesos termodinámicos:
     * 1→2: Compresión adiabática
     * 2→3: Combustión a volumen constante (parte Otto)
     * 3→4: Combustión a presión constante (parte Diesel)
     * 4→5: Expansión adiabática
     * 5→1: Rechazo de calor a volumen constante
     * 
     * @param {object} parametros - Parámetros de entrada
     * @param {object} atmosfera - Condiciones atmosféricas
     * @returns {object} Resultados del ciclo Sabathé
     */
    cicloSabath: function(parametros, atmosfera) {
        console.log('=== CICLO SABATHÉ ===');
        console.log('Parámetros:', parametros);
        console.log('Atmósfera:', atmosfera);

        // ========== PARÁMETROS DE ENTRADA ==========
        const rpm = parametros.rpm;
        const P_atm = atmosfera.presion_Pa;
        const T_atm = atmosfera.temperatura_K;
        const rho_atm = atmosfera.densidad_kg_m3;
        const lambda = parametros.mezlaRelativa;
        const eta_mecanico = parametros.rendimientoMecanico;
        const k = parametros.kAire;
        const W_requerida = parametros.potencia * 1000;

        // ========== CÁLCULOS INTERMEDIOS ==========
        const r = 12; // Relación de compresión (placeholder)
        const n_cilindros = 4;
        const V_cilindrada = 2000 / 1000000; // m³
        const combustion_volumen_constante_ratio = 0.4; // Fracción de combustión V.C.
        const cutoff_ratio = 1.5; // Relación de expansión isobárica

        const R = this.constantes.R_aire;

        // ========== CICLO TERMODINÁMICO ==========
        // Estado 1 (inicio de compresión)
        const P1 = P_atm;
        const T1 = T_atm;
        const V1 = V_cilindrada / n_cilindros * 4 / 2;

        // Estado 2 (fin de compresión)
        const P2 = P1 * Math.pow(r, k);
        const T2 = T1 * Math.pow(r, k - 1);
        const V2 = V1 / r;

        // Estado 3 (fin de combustión a V.C., antes de exp. isobárica)
        const P3 = null; // A definir
        const T3 = null; // A definir
        const V3 = V2;

        // Estado 4 (fin de expansión isobárica)
        const P4 = P3; // Presión constante
        const V4 = null; // A definir según cutoff_ratio
        const T4 = null; // A definir

        // Estado 5 (fin de expansión adiabática)
        const P5 = null;
        const T5 = null;
        const V5 = V1;

        // ========== PARÁMETROS DE RENDIMIENTO ==========
        const eta_sabath_teorico = null;
        const eta_sabath_real = null;
        const Q_entrada = null;
        const Q_salida = null;
        const W_ciclo = null;
        const W_indicada = null;
        const W_efectiva = null;
        const presion_media_efectiva = null;

        // ========== RETORNO ==========
        return {
            tipo_ciclo: 'Sabathé',
            parametros_entrada: {
                rpm,
                presion_atm_Pa: P_atm,
                temperatura_atm_K: T_atm,
                densidad_atm: rho_atm,
                mezcla_relativa: lambda,
                rendimiento_mecanico: eta_mecanico,
                k_aire: k,
                potencia_requerida_W: W_requerida
            },
            parametros_motor: {
                relacion_compresion: r,
                numero_cilindros: n_cilindros,
                cilindrada_total_m3: V_cilindrada,
                combustion_vc_ratio: combustion_volumen_constante_ratio,
                cutoff_ratio: cutoff_ratio
            },
            estados_ciclo: {
                estado_1: { P: P1, T: T1, V: V1 },
                estado_2: { P: P2, T: T2, V: V2 },
                estado_3: { P: P3, T: T3, V: V3 },
                estado_4: { P: P4, T: T4, V: V4 },
                estado_5: { P: P5, T: T5, V: V5 }
            },
            rendimientos: {
                eta_sabath_teorico,
                eta_sabath_real,
                eta_mecanico: eta_mecanico
            },
            energias: {
                Q_entrada,
                Q_salida,
                W_ciclo,
                W_indicada,
                W_efectiva,
                PME: presion_media_efectiva
            }
        };
    }
};

// Exportar para uso en navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CiclosMotores;
}
