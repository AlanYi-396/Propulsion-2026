/**
 * CICLO JOULE-BRAYTON - Modelo Matemático
 * ========================================
 * Traducción a JS de los cálculos de TP6/EjercicioFinal.py (sin la capa de
 * graficación de Matplotlib). Cada ejercicio del script es una función:
 *
 *   Ej. 1  Ciclo Joule-Brayton simple ideal        → cicloSimple
 *   Ej. 2  Análisis paramétrico del calor útil      → analisisParametrico
 *   Ej. 3  Regeneración térmica                      → regeneracion
 *   Ej. 4  Postcombustión (recalentamiento)         → postcombustion
 *   Ej. 5  Turborreactor real (magnitudes remanso)  → turborreactor
 *
 * Convenciones de signo (primer principio, trabajo del fluido):
 *   q > 0: calor absorbido    q < 0: calor cedido al medio
 *   w > 0: trabajo entregado  w < 0: trabajo tomado del fluido
 *
 * Unidades (idénticas al script Python):
 *   P [kPa], v [m³/kg], T [K], s [kJ/(kg·K)] (relativa: s₁ = 0 ó s_A = 0)
 *   q, w [kJ/kg], V [m/s], altitud [m]
 *
 * Curvas: cada serie se devuelve como arreglo de puntos { x, y }, formato
 * directo para series 'scatterLine' de Kendo UI.
 */

const CicloJouleBrayton = {

    constantes: {
        // ── DATOS DEL AIRE (gas ideal) ────────────────────────────────────────
        cp_kj: 1.005,       // kJ/(kg·K) — calor específico a P=cte (balances de energía)
        cp_j:  1005.0,      // J/(kg·K)  — ídem, para términos cinéticos (V²/2)
        gamma: 1.4,         // —         — exponente adiabático (cp/cv)
        R:     287.05,      // J/(kg·K)  — constante particular del aire

        // ── GASES DE COMBUSTIÓN (aguas abajo de la cámara) ────────────────────
        // Valores medios para productos de combustión de queroseno entre ~800 y
        // 1.300 K (Saravanamuttoo, Gas Turbine Theory): R = cp·(γ−1)/γ ≈ 287 J/(kg·K)
        cp_gas:    1.148,   // kJ/(kg·K)
        gamma_gas: 1.333,   // —

        prop_O2: 0.236,     // —         — fracción másica de O₂ en aire (ídem TP1)

        // ── ATMÓSFERA ESTÁNDAR (ISA, troposfera — mismo modelo que TP1) ───────
        P_atm_nivel_mar: 101325,  // Pa
        T_standar:       288.15,  // K
        g:               9.81,    // m/s²
        L_gradiente:     0.0065,  // K/m
        R_isa:           286.71,  // J/(kg·K) — R usada por TP1 en el exponente g/(L·R)

        // ── N-CETANO C₁₆H₃₄ (turborreactor) ───────────────────────────────────
        // C₁₆H₃₄ + 24.5 O₂ → 16 CO₂ + 17 H₂O
        cetano_n_C: 16,         // átomos de Carbono
        cetano_n_H: 34,         // átomos de Hidrógeno
        cetano_Hc:  43000.0     // kJ/kg — Poder Calorífico (43,0 MJ/kg)
    },

    // ─── DATOS DE LOS EJERCICIOS (valores por defecto del .py) ────────────────
    datosBase: {
        // Estados del ciclo simple (Ejercicios 1, 3 y 4)
        estados: [
            { num: 1, P: 101.325, T:  260.0, v: 0.736 },
            { num: 2, P: 329.3,   T:  364.0, v: 0.317 },
            { num: 3, P: 329.3,   T: 1275.0, v: 1.11  },
            { num: 4, P: 101.323, T:  910.0, v: 2.578 }
        ],

        // Ejercicio 2
        parametrico: {
            T1:     263.0,              // K — ajustada para los valores de control
            T_lims: [1200, 1270, 1300], // K — temperaturas límite a comparar
            theta_min: 1.0, theta_max: 3.5, n: 200
        },

        // Ejercicio 3
        regeneracion: { theta_min: 1.0, theta_max: 2.9, n: 200 },

        // Ejercicio 4
        postcombustion: {
            theta_t: 1.30,   // — relación de temperaturas en la 1ª etapa de turbina
            T5:      1400.0  // K — temperatura a la salida del postcombustor
        },

        // Ejercicio 5 — turborreactor real; el fan (BPR) solo interviene en el empuje.
        // Valores por defecto: motor de referencia P&WC JT15D-1A, despegue estático a nivel del mar ISA
        turborreactor: {
            // ── Entradas por pantalla
            h_vuelo:       0.0,     // m     — altitud: nivel del mar (o { valor, unidad })
            V0:            0.0,     // m/s   — velocidad de corriente libre (0 = despegue estático)
            rc:            10.0,    // —     — relación de compresión del núcleo po2/po1
            V1:            150.0,   // m/s   — velocidad a la entrada del compresor
            dp_cc:         4.0,     // %     — pérdida de presión total en cámara
            T3:            1200,    // K     — T límite: entrada a turbina (límite metalúrgico)
            eta_difusor:   0.92,
            eta_compresor: 0.80,
            eta_turbina:   0.88,
            eta_tobera:    0.95,
            bpr:           3.3,     // —     — relación de bypass ṁb/ṁc (0 = turborreactor puro)
            caudal_sl:     34.0,    // kg/s  — caudal de aire total a nivel del mar (dato del fabricante;
                                    //         o { valor, unidad: 'kg/s'|'lb/s' }); JT15D-1A: 75 lb/s

            // ── Parámetros fijos
            eta_combustion: 0.97,     // —     — fracción de Hc liberada en la cámara (.py)
            eta_mecanico:   1.00,     // —     — transmisión turbina → compresor (cojinetes)
            eta_fan:        0.85,     // —     — rendimiento isentrópico típico de un fan

            v_min: 0.0, v_max: 1.0, n: 101  // barrido de ν = V0/Vj (0 = punto fijo)
        }
    },

    // ─── DISPATCHER ────────────────────────────────────────────────────────────
    calcular: function(tipo, parametros) {
        tipo = (tipo || '').toLowerCase().trim();
        switch (tipo) {
            case 'simple':         return this.cicloSimple(parametros);
            case 'parametrico':    return this.analisisParametrico(parametros);
            case 'regeneracion':   return this.regeneracion(parametros);
            case 'postcombustion': return this.postcombustion(parametros);
            case 'turborreactor':  return this.turborreactor(parametros);
            default:
                console.error('Cálculo no reconocido:', tipo);
                return null;
        }
    },

    // ─── ATMÓSFERA ESTÁNDAR (ISA) ──────────────────────────────────────────────
    // Acepta la altitud en metros o como { valor, unidad } ('m' | 'ft' | 'km').
    calcularCondicionesAtmosfericas: function(altitud) {
        let h = typeof altitud === 'number' ? altitud : altitud.valor;
        if (typeof altitud === 'object') {
            switch (altitud.unidad) {
                case 'ft': h *= 0.3048; break;
                case 'km': h *= 1000;   break;
            }
        }
        if (h > 11000) console.warn('Altitud > 11 km; modelo ISA capa troposférica.');

        const c   = this.constantes;
        const T   = c.T_standar - c.L_gradiente * h;
        const exp = c.g / (c.L_gradiente * c.R_isa);   // ≈ 5.26, constante ISA
        const P   = c.P_atm_nivel_mar * Math.pow(T / c.T_standar, exp);
        const rho = P / (c.R_isa * T);

        return {
            altitud_m:      h,
            temperatura_K:  T,
            presion_Pa:     P,
            presion_kPa:    P / 1000,
            densidad_kg_m3: rho,
            delta: P / c.P_atm_nivel_mar,
            theta: T / c.T_standar
        };
    },

    // ─── HELPERS INTERNOS ──────────────────────────────────────────────────────
    _params: function(clave, parametros) {
        return Object.assign({}, this.datosBase[clave], parametros || {});
    },
    _linspace: function(a, b, n) {
        if (n < 2) return [a];
        const out = [];
        for (let i = 0; i < n; i++) out.push(a + (b - a) * i / (n - 1));
        return out;
    },
    _puntos: function(xs, ys) {
        return xs.map(function(x, i) { return { x: x, y: ys[i] }; });
    },
    _m: function(k) {
        // Exponente isentrópico (k-1)/k — 0.2857 para k = 1.4 (y 1/m = 3.5)
        return (k - 1) / k;
    },
    _ds: function(Ta, Tb, pa, pb) {
        // Gibbs: ds = cp·ln(Tb/Ta) − R·ln(pb/pa)   [kJ/(kg·K)]
        // Con R = cp·(k−1)/k para que las isentrópicas (p ∝ T^(k/(k−1))) den ds = 0;
        // cp = 1.005 y R = 287.05 no cumplen exactamente cp = k·R/(k−1).
        const cp = this.constantes.cp_kj;
        return cp * Math.log(Tb / Ta)
             - cp * this._m(this.constantes.gamma) * Math.log(pb / pa);
    },
    _volumen: function(P_kPa, T) {
        return this.constantes.R * T / (P_kPa * 1000);
    },

    // ─── ESTADOS IDEALES A PARTIR DE PARÁMETROS ───────────────────────────────
    // Genera los 4 estados del ciclo simple a partir de (P1, T1, π_c, T3).
    // Con P1=101.325, T1=260, π_c=3.25, T3=1275 reproduce los datos base.
    estadosIdeales: function(P1, T1, pi_c, T3) {
        const m  = this._m(this.constantes.gamma);
        const P2 = P1 * pi_c;
        const T2 = T1 * Math.pow(pi_c, m);
        const P3 = P2;
        const P4 = P1;
        const T4 = T3 / Math.pow(pi_c, m);
        const self = this;
        return [[P1, T1], [P2, T2], [P3, T3], [P4, T4]].map(function(e, i) {
            return { num: i + 1, P: e[0], T: e[1], v: self._volumen(e[0], e[1]) };
        });
    },

    // ─── EJ. 1: CICLO JOULE-BRAYTON SIMPLE ────────────────────────────────────
    // 1→2  Compresión isentrópica
    // 2→3  Adición de calor isobárica
    // 3→4  Expansión isentrópica
    // 4→1  Rechazo de calor isobárico
    cicloSimple: function(parametros) {
        const est = (parametros && parametros.estados) || this.datosBase.estados;
        const k   = this.constantes.gamma;
        const cp  = this.constantes.cp_kj;
        const n   = 100;
        const e1 = est[0], e2 = est[1], e3 = est[2], e4 = est[3];

        // ── Entropías relativas (s₁ = 0)
        const s1 = 0.0;
        const s2 = s1;
        const s3 = s2 + cp * Math.log(e3.T / e2.T);
        const s4 = s3;

        // ── Curvas P-v: adiabáticas P·v^k = cte, isobáricas P = cte
        const v12 = this._linspace(e2.v, e1.v, n);
        const v23 = this._linspace(e2.v, e3.v, n);
        const v34 = this._linspace(e3.v, e4.v, n);
        const v41 = this._linspace(e1.v, e4.v, n);
        const pv = [
            { nombre: '1-2: Comp. Isentrópica', puntos: this._puntos(v12, v12.map(v => e1.P * Math.pow(e1.v / v, k))) },
            { nombre: '2-3: Adición de Calor',  puntos: this._puntos(v23, v23.map(() => e2.P)) },
            { nombre: '3-4: Exp. Isentrópica',  puntos: this._puntos(v34, v34.map(v => e3.P * Math.pow(e3.v / v, k))) },
            { nombre: '4-1: Rechazo de Calor',  puntos: this._puntos(v41, v41.map(() => e1.P)) }
        ];

        // ── Curvas T-s: isentrópicas verticales, isobáricas T = T₀·exp(Δs/cp)
        const s23 = this._linspace(s2, s3, n);
        const s41 = this._linspace(s1, s4, n);
        const T12 = this._linspace(e1.T, e2.T, n);
        const T34 = this._linspace(e4.T, e3.T, n);
        const ts = [
            { nombre: '1-2: Comp. Isentrópica', puntos: this._puntos(T12.map(() => s1), T12) },
            { nombre: '2-3: Adición de Calor',  puntos: this._puntos(s23, s23.map(s => e2.T * Math.exp((s - s2) / cp))) },
            { nombre: '3-4: Exp. Isentrópica',  puntos: this._puntos(T34.map(() => s3), T34) },
            { nombre: '4-1: Rechazo de Calor',  puntos: this._puntos(s41, s41.map(s => e1.T * Math.exp((s - s1) / cp))) }
        ];

        // ── Intercambios por proceso [kJ/kg] (complemento: no figura en el .py)
        const w12 = -cp * (e2.T - e1.T);   // negativo (compresor)
        const q23 =  cp * (e3.T - e2.T);   // positivo (cámara)
        const w34 =  cp * (e3.T - e4.T);   // positivo (turbina)
        const q41 =  cp * (e1.T - e4.T);   // negativo (escape)
        const w_util = w12 + w34;

        const s = [s1, s2, s3, s4];
        return {
            tipo_ciclo: 'Joule-Brayton simple',
            estados: est.map(function(e, i) {
                return { num: e.num, P: e.P, v: e.v, T: e.T, s: s[i], h: cp * e.T };
            }),
            procesos: [
                { etapa: '(1-2)', tiempo: 'Compresión', q: null, w: w12,  ds: 0 },
                { etapa: '(2-3)', tiempo: 'Combustión', q: q23,  w: null, ds: s3 - s2 },
                { etapa: '(3-4)', tiempo: 'Expansión',  q: null, w: w34,  ds: 0 },
                { etapa: '(4-1)', tiempo: 'Escape',     q: q41,  w: null, ds: s1 - s4 }
            ],
            rendimientos: {
                eta_th: w_util / q23,   // = 1 − T1/T2 en el ciclo ideal
                w_util,
                q_in:  q23,
                q_out: q41
            },
            curvas: { pv, ts },
            k_aire: k, cp_kj: cp
        };
    },

    // ─── EJ. 2: ANÁLISIS PARAMÉTRICO ──────────────────────────────────────────
    // Calor útil adimensionalizado en función de θ = T₂/T₁ y α = T₃/T₁.
    // d(qu)/dθ = 0  →  θ* = √α  (compresión óptima de máximo trabajo).
    calorUtil: function(theta, alpha, T1, cp) {
        return cp * T1 * (alpha - theta - alpha / theta + 1);
    },

    analisisParametrico: function(parametros) {
        const p     = this._params('parametrico', parametros);
        const cp    = this.constantes.cp_kj;
        const theta = this._linspace(p.theta_min, p.theta_max, p.n);
        const self  = this;

        const series = p.T_lims.map(function(T_lim) {
            const alpha     = T_lim / p.T1;
            const theta_opt = Math.sqrt(alpha);
            return {
                T_lim,
                alpha,
                theta_opt,
                qu_max: self.calorUtil(theta_opt, alpha, p.T1, cp),
                puntos: self._puntos(theta, theta.map(t => self.calorUtil(t, alpha, p.T1, cp)))
            };
        });

        return { tipo: 'Análisis paramétrico', T1: p.T1, series };
    },

    // ─── EJ. 3: REGENERACIÓN TÉRMICA ──────────────────────────────────────────
    // Simple:       η = 1 − 1/θ
    // Regenerativo: η = 1 − θ/α   (solo posible si θ < √α: T₂ < T₄)
    regeneracion: function(parametros) {
        const p   = this._params('regeneracion', parametros);
        const est = p.estados || this.datosBase.estados;
        const T1  = est[0].T, T2 = est[1].T, T3 = est[2].T;

        const alpha        = T3 / T1;
        const theta_prob   = T2 / T1;
        const theta_limite = Math.sqrt(alpha);
        const theta        = this._linspace(p.theta_min, p.theta_max, p.n);

        const etaSimple = t => (1 - 1 / t) * 100;       // [%]
        const etaReg    = t => (1 - t / alpha) * 100;   // [%]

        return {
            tipo: 'Regeneración',
            alpha,
            theta_limite,
            punto_operativo: {
                theta:      theta_prob,
                eta_simple: etaSimple(theta_prob),
                eta_reg:    etaReg(theta_prob)
            },
            curvas: {
                simple:       this._puntos(theta, theta.map(etaSimple)),
                regenerativo: this._puntos(theta, theta.map(etaReg))
            }
        };
    },

    // ─── EJ. 4: POSTCOMBUSTIÓN (RECALENTAMIENTO) ──────────────────────────────
    // 1→2 Compresor, 2→3 Cámara principal, 3→4 Expansión (1ª etapa),
    // 4→5 Postcombustor (isobárico), 5→6 Expansión (2ª etapa) hasta P₁.
    postcombustion: function(parametros) {
        const p   = this._params('postcombustion', parametros);
        const est = p.estados || this.datosBase.estados;
        const cp  = this.constantes.cp_kj;
        const m   = this._m(this.constantes.gamma);
        const P1 = est[0].P, T1 = est[0].T, T2 = est[1].T;
        const P3 = est[2].P, T3 = est[2].T;

        const T4 = T3 / p.theta_t;
        const P4 = P3 * Math.pow(p.theta_t, -1 / m);   // θ_t^(-3.5)
        const T5 = p.T5, P5 = P4;
        const T6 = T5 * Math.pow(P1 / P5, m);

        // ── Entropías relativas (s₁ = 0)
        const s1 = 0.0;
        const s2 = s1;
        const s3 = s2 + cp * Math.log(T3 / T2);
        const s4 = s3;
        const s5 = s4 + cp * Math.log(T5 / T4);
        const s6 = s5;

        const sIso = this._linspace(s1, s6, 100);
        const seg  = (sa, sb, Ta, Tb) => [{ x: sa, y: Ta }, { x: sb, y: Tb }];

        return {
            tipo: 'Postcombustión',
            estados: [
                { num: 1, P: P1, T: T1, s: s1 },
                { num: 2, P: est[1].P, T: T2, s: s2 },
                { num: 3, P: P3, T: T3, s: s3 },
                { num: 4, P: P4, T: T4, s: s4 },
                { num: 5, P: P5, T: T5, s: s5 },
                { num: 6, P: P1, T: T6, s: s6 }
            ],
            curvas: {
                isobara_baja:     this._puntos(sIso, sIso.map(s => T1 * Math.exp((s - s1) / cp))),
                compresor:        seg(s1, s2, T1, T2),
                camara_principal: seg(s2, s3, T2, T3),
                expansion_1:      seg(s3, s4, T3, T4),
                postcombustor:    seg(s4, s5, T4, T5),
                expansion_2:      seg(s5, s6, T5, T6)
            }
        };
    },

    // ─── EJ. 5: TURBORREACTOR REAL + EMPUJE CON FAN ────────────────────────────
    // Ciclo del turborreactor (Ejercicio 5 de EjercicioFinal.py), estación por estación:
    //   0  Atmósfera (ISA a h_vuelo; magnitudes estáticas T0, p0)
    //   1  Salida difusor / entrada compresor   ┐
    //   2  Salida compresor                      │ magnitudes de remanso
    //   3  Salida cámara / entrada turbina (T3)  │ (To, po)
    //   4  Salida turbina / entrada tobera       ┘
    //   j  Salida tobera (estática, expansión adaptada hasta p0)
    // Propiedades: aire (cp, γ) hasta el compresor; gases de combustión
    // (cp_gas, γ_gas) en cámara, turbina y tobera.
    // Hipótesis del .py: 1 eje (la turbina entrega exactamente wC), caudal de
    // gases ≈ caudal de aire. Este ciclo (sin fan) alimenta la tabla y las gráficas.
    //
    // Empuje: se determina con un fan de relación de bypass BPR (turbofán de
    // flujos separados). La turbina del núcleo acciona compresor y fan
    // (wT = wC + BPR·wF) y el FPR es el que maximiza el empuje. Con BPR = 0
    // coincide con el empuje del turborreactor.
    //   E = ṁc·(Vj − V0) + ṁb·(Vjf − V0)
    // Caudal: se ingresa el caudal de aire total a nivel del mar (dato del fabricante)
    // y se lleva a la condición de vuelo con el caudal corregido constante:
    //   ṁ = ṁ_SL·δ1/√θ1,  δ1 = po1/101,325 kPa,  θ1 = To1/288,15 K
    //   ṁc = ṁ/(1 + BPR) (núcleo),  ṁb = BPR·ṁc (bypass)
    turborreactor: function(parametros) {
        const p    = this._params('turborreactor', parametros);
        const c    = this.constantes;
        const cpJ  = c.cp_j;                        // J/(kg·K) — aire
        const R    = c.R;
        const B    = p.bpr;

        // Aire (difusor, compresor, fan) y gases de combustión (cámara, turbina, tobera)
        const aire = { cp: c.cp_kj,  m: this._m(c.gamma) };
        const gas  = { cp: c.cp_gas, m: this._m(c.gamma_gas) };
        // km = k/(k−1); cv = cp − R, con R = cp·(k−1)/k
        aire.km = 1 / aire.m;   aire.cv = aire.cp * (1 - aire.m);
        gas.km  = 1 / gas.m;    gas.cv  = gas.cp  * (1 - gas.m);
        // ds = cp·ln(Tb/Ta) − R·ln(pb/pa), con R = cp·(k−1)/k (isentrópicas → ds = 0)
        const ds = (prop, Ta, Tb, pa, pb) =>
            prop.cp * Math.log(Tb / Ta) - prop.cp * prop.m * Math.log(pb / pa);

        const m_sl = this._caudalKgS(p.caudal_sl);
        this._validarTurborreactor(p, m_sl);

        // ── Combustible: n-cetano
        const comb = this._estequiometria();

        // ── Estado 0: atmósfera (ISA)
        const atm = this.calcularCondicionesAtmosfericas(p.h_vuelo);
        const T0  = atm.temperatura_K;
        const p0  = atm.presion_kPa;

        // ── Estado 1: toma de aire — lleva la corriente de V0 a V1 (To1 = T0 + V0²/2cp)
        //    Difusión (V1 ≤ V0, vuelo):      ηd = (T1s − T0)/(T1 − T0) → solo ηd·ΔEc se recupera
        //    Aceleración (V1 > V0, p. ej. despegue estático V0 = 0):
        //                                    ηd = (T0 − T1)/(T0 − T1s) → po1 < p0 (pérdida)
        const To1 = T0 + p.V0 * p.V0 / (2 * cpJ);
        const T1  = To1 - p.V1 * p.V1 / (2 * cpJ);             // estática a V1
        const T1s = p.V1 <= p.V0
            ? T0 + p.eta_difusor * (T1 - T0)
            : T0 - (T0 - T1) / p.eta_difusor;
        const p1  = p0 * Math.pow(T1s / T0, aire.km);           // estática a V1
        const po1 = p1 * Math.pow(To1 / T1, aire.km);           // = p0·(1 + ηd·(To1/T0 − 1))^3.5 si V1 = 0

        // ── Estado 2: compresor (penalizado por ηc)
        const po2         = p.rc * po1;
        const dTreal_comp = To1 * (Math.pow(p.rc, aire.m) - 1) / p.eta_compresor;
        const wC          = aire.cp * dTreal_comp;              // kJ/kg
        const To2         = To1 + dTreal_comp;

        // ── Estado 3: cámara (pérdida de carga Δpcc y rendimiento de combustión)
        //    Entra aire a To2 y salen gases a To3: q = cp_gas·To3 − cp·To2
        const To3 = p.T3;
        const po3 = (1 - p.dp_cc / 100) * po2;
        const q_in = gas.cp * To3 - aire.cp * To2;              // kJ/kg — calor aportado
        if (!(To3 > To2) || !(q_in > 0)) {
            throw new Error(`T límite (${To3} K) debe superar la salida del compresor (To2 = ${To2.toFixed(1)} K).`);
        }
        const f = q_in / (p.eta_combustion * c.cetano_Hc);      // kg comb / kg aire
        if (f > comb.f_est) {
            throw new Error(`Dosado f = ${f.toFixed(4)} supera el estequiométrico (${comb.f_est.toFixed(4)}); reducir T límite.`);
        }

        // ── Turbina (gases): entrega w [kJ/kg núcleo]; null si no deja salto para la tobera
        const turbina = function(w) {
            const dT   = w / gas.cp;
            const To4  = To3 - dT;
            const base = 1 - (dT / p.eta_turbina) / To3;
            if (!(base > 0)) return null;
            const po4 = po3 * Math.pow(base, gas.km);
            return po4 > p0 ? { To4, po4 } : null;
        };
        // ── Tobera adaptada (pj = p0), penalizada por ηtob
        const tobera = function(prop, To, po) {
            const Ts = To * Math.pow(p0 / po, prop.m);
            const T  = To - p.eta_tobera * (To - Ts);
            return { T, V: Math.sqrt(2 * prop.cp * 1000 * (To - T)) };
        };

        // ════ CICLO DEL TURBORREACTOR (sin fan): tabla y gráficas ════
        const wT = wC / p.eta_mecanico;                         // kJ/kg
        const t4 = turbina(wT);
        if (!t4) {
            throw new Error('La turbina no deja salto de presión para la tobera; aumentar T límite o revisar RC y rendimientos.');
        }
        const To4 = t4.To4, po4 = t4.po4;
        const tj  = tobera(gas, To4, po4);
        const Tj  = tj.T, Vj = tj.V, pj = p0;

        // Si po4/p0 supera ((k+1)/2)^(k/(k-1)) ≈ 1.85 (gases), una tobera convergente
        // se bloquea (M = 1 en la garganta): la expansión adaptada exige tobera C-D.
        const rel_critica      = Math.pow((c.gamma_gas + 1) / 2, gas.km);
        const tobera_bloqueada = po4 / pj > rel_critica;

        // ── Entropías relativas (s0 = 0)
        const s0 = 0.0;
        const s1 = s0 + ds(aire, T0,  To1, p0,  po1);
        const s2 = s1 + ds(aire, To1, To2, po1, po2);
        const s3 = s2 + ds(gas,  To2, To3, po2, po3);           // aporte de calor, con cp de gases
        const s4 = s3 + ds(gas,  To3, To4, po3, po4);
        const sj = s4 + ds(gas,  To4, Tj,  po4, pj);

        // ── Estados como en el .py: 0 y j estáticos, 1–4 de remanso
        const estado = (num, nombre, magnitud, prop, T, P, s) => ({
            num, nombre, magnitud, T, P, s,
            rho: P * 1000 / (R * T),
            u: prop.cv * T,                                     // kJ/kg
            h: prop.cp * T,                                     // kJ/kg
            fluido: prop === gas ? 'gases' : 'aire'
        });
        const estados = [
            estado('0', 'Atmósfera',       'Estática', aire, T0,  p0,  s0),
            estado('1', 'Entrada compr.',  'Remanso',  aire, To1, po1, s1),
            estado('2', 'Salida compr.',   'Remanso',  aire, To2, po2, s2),
            estado('3', 'Entrada turbina', 'Remanso',  gas,  To3, po3, s3),
            estado('4', 'Salida turbina',  'Remanso',  gas,  To4, po4, s4),
            estado('j', 'Salida tobera',   'Estática', gas,  Tj,  pj,  sj)
        ];

        // ── Caudal en la condición de vuelo: caudal corregido constante (ṁ·√θ1/δ1)
        const delta1  = po1 / (c.P_atm_nivel_mar / 1000);
        const theta1  = To1 / c.T_standar;
        const m_total = m_sl * delta1 / Math.sqrt(theta1);     // kg/s — aire total
        const mc = m_total / (1 + B);                           // kg/s — núcleo
        const mf = f * mc;                                      // kg/s combustible
        const E_tr = mc * (Vj - p.V0);                          // N — turborreactor sin fan

        // ── Prestaciones del turborreactor (sin fan), con las fórmulas del Ej. 5
        //    Trabajo neto del ciclo abierto = aumento de energía cinética del chorro
        const w_neto = ((1 + f) * Vj * Vj - p.V0 * p.V0) / 2 / 1000;   // kJ/kg aire
        const eta_th = w_neto / (f * c.cetano_Hc);              // térmico: ΔEc / energía del combustible
        const eta_pr = 2 * p.V0 / (Vj + p.V0);                  // propulsivo (≈, desprecia f)
        const prestaciones = {
            Es:     (1 + f) * Vj - p.V0,                        // N·s/kg — empuje específico
            q_in,                                               // kJ/kg — calor aportado en la cámara
            q_out:  q_in - w_neto,                              // kJ/kg — calor cedido con los gases de escape
            w_neto,                                             // kJ/kg
            eta_th,
            eta_p:  eta_pr,
            eta_G:  eta_th * eta_pr,                            // global
            M0:     p.V0 / Math.sqrt(c.gamma * R * T0)          // Mach de vuelo (con T0 = TA)
        };

        // ════ EMPUJE CON FAN (turbofán de flujos separados) ════
        const conFan = function(fpr) {
            const pof = fpr * po1;
            const Tof = To1 * (1 + (Math.pow(fpr, aire.m) - 1) / p.eta_fan);
            const wF  = aire.cp * (Tof - To1);                  // kJ/kg de bypass
            const t   = turbina((wC + B * wF) / p.eta_mecanico);
            if (!t || !(pof > p0)) return null;
            const jc = tobera(gas,  t.To4, t.po4);              // tobera caliente
            const jf = tobera(aire, Tof, pof);                  // tobera fría
            const E_esp = (jc.V - p.V0) + B * (jf.V - p.V0);    // N por kg/s de núcleo
            return { fpr, wF, To4: t.To4, Vj: jc.V, Vjf: jf.V, Tjf: jf.T, E_esp };
        };
        let op = null;
        if (B > 0) {
            // FPR óptimo: barrido grueso y refinamiento alrededor del máximo
            const barrer = (a, b, paso) => {
                for (let fpr = a; fpr <= b; fpr += paso) {
                    const r = conFan(fpr);
                    if (r && (!op || r.E_esp > op.E_esp)) op = r;
                }
            };
            barrer(1.005, p.rc, 0.005);
            if (op) barrer(Math.max(1.0001, op.fpr - 0.005), op.fpr + 0.005, 0.0001);
            if (!op) {
                throw new Error('La turbina no puede accionar compresor y fan: reducir BPR o RC, o aumentar T límite.');
            }
        } else {
            op = { fpr: 1, wF: 0, To4, Vj, Vjf: p.V0, Tjf: T0, E_esp: Vj - p.V0 };
        }
        if (!(op.E_esp > 0)) {
            throw new Error('El motor no produce empuje con estos parámetros.');
        }
        const mb = B * mc;                                      // kg/s bypass
        const Ec = mc * (op.Vj - p.V0);                         // N — tobera caliente
        const Ef = mb * (op.Vjf - p.V0);                        // N — tobera fría
        const E  = Ec + Ef;                                     // N — empuje neto
        const TSFC = mf / E;                                    // kg/(N·s)

        const P_chorros = mc * (op.Vj * op.Vj - p.V0 * p.V0) / 2
                        + mb * (op.Vjf * op.Vjf - p.V0 * p.V0) / 2;  // W
        const eta_t = P_chorros / (mf * c.cetano_Hc * 1000);    // térmico
        const eta_p = E * p.V0 / P_chorros;                     // propulsivo
        const eta_o = eta_t * eta_p;                            // global

        const empuje = {
            bpr: B, fpr: op.fpr, wF: op.wF,
            To4: op.To4, Vj: op.Vj, Vjf: op.Vjf,                // núcleo del turbofán
            mc, mb, m_total: mc + mb,
            P_turbina: mc * (wC + B * op.wF) / p.eta_mecanico * 1000,   // W — acciona compresor y fan
            Ec, Ef, E,
            E_turborreactor: E_tr,                              // referencia sin fan
            TSFC, TSFC_h: TSFC * 3600,
            eta_t, eta_p, eta_o,
            A0: p.V0 > 0 ? (mc + mb) * R * T0 / (p0 * 1000 * p.V0) : null  // captación total [m²]
        };

        // ── Intercambios por proceso del turborreactor [kJ/kg]
        const procesos = [
            { etapa: '(0-1)', tiempo: 'Difusor',    q: null, w: null, ds: s1 - s0 },
            { etapa: '(1-2)', tiempo: 'Compresión', q: null, w: -wC,  ds: s2 - s1 },
            { etapa: '(2-3)', tiempo: 'Combustión', q: q_in, w: null, ds: s3 - s2 },
            { etapa: '(3-4)', tiempo: 'Expansión',  q: null, w: wT,   ds: s4 - s3 },
            { etapa: '(4-j)', tiempo: 'Tobera',     q: null, w: null, ds: sj - s4 }
        ];

        const seg = (sa, sb, Ta, Tb) => [{ x: sa, y: Ta }, { x: sb, y: Tb }];

        // ── Isobaras de referencia del diagrama T-s: T = Tref·exp((s − sref)/cp).
        //    Cada tramo usa las propiedades del fluido de su zona para pasar
        //    exactamente por sus estados (p0 por A con aire y por j con gases).
        const isobara = (prop, Tref, sref, sa, sb) => {
            const ss = this._linspace(sa, sb, 60);
            return this._puntos(ss, ss.map(sv => Tref * Math.exp((sv - sref) / prop.cp)));
        };
        const ancho = sj - s0;
        const sMin  = s0 - 0.05 * ancho;
        const sMax  = sj + 0.08 * ancho;

        // ── Rendimiento propulsivo vs v = V0/Vj (turborreactor)
        const v_ratio = this._linspace(p.v_min, p.v_max, p.n);
        const v_ej    = p.V0 / Vj;

        return {
            tipo_ciclo: 'Joule-Brayton',
            atmosfera:  atm,
            combustible: comb,
            estados,
            procesos,
            empuje,
            prestaciones,
            advertencias: [],
            magnitudes: {                                       // ciclo del turborreactor
                wC, wT, q_in,                                   // kJ/kg
                f, lambda: comb.f_est / f,                      // dosado y exceso de aire relativo
                Vj, mc, mf,                                     // m/s, kg/s
                m_sl, m_total, delta1, theta1,                  // caudal SL → condición de vuelo
                P_turbina: mc * wT * 1000,                      // W — turborreactor sin fan
                E: E_tr,                                        // N — sin fan
                propiedades: { aire, gas },
                v_ej,
                rel_critica, tobera_bloqueada
            },
            curvas: {
                ts: [
                    { nombre: 'Difusor',              puntos: seg(s0, s1, T0,  To1) },
                    { nombre: 'Compresor',            puntos: seg(s1, s2, To1, To2) },
                    { nombre: 'Cámara de combustión', puntos: seg(s2, s3, To2, To3) },
                    { nombre: 'Turbina',              puntos: seg(s3, s4, To3, To4) },
                    { nombre: 'Tobera',               puntos: seg(s4, sj, To4, Tj)  }
                ],
                isobaras: [
                    { nombre: 'p0 (aire)',   puntos: isobara(aire, T0,  s0, sMin, s2 + 0.35 * (s3 - s2)) },
                    { nombre: 'p0 (gases)',  puntos: isobara(gas,  Tj,  sj, s2 + 0.55 * (s3 - s2), sMax) },
                    { nombre: 'po3 (gases)', puntos: isobara(gas,  To3, s3, s2, sMax) }
                ],
                propulsivas: {
                    empuje_adimensional: this._puntos(v_ratio, v_ratio.map(v => 1 - v)),
                    rendimiento_prop:    this._puntos(v_ratio, v_ratio.map(v => 2 * v / (1 + v))),
                    potencia_empuje:     this._puntos(v_ratio, v_ratio.map(v => (1 - v) * v))
                },
                // Punto de operación del motor calculado sobre las tres curvas
                punto_operativo: {
                    x: v_ej,
                    empuje:   1 - v_ej,
                    eta_p:    2 * v_ej / (1 + v_ej),
                    potencia: v_ej * (1 - v_ej)
                }
            }
        };
    },

    // ─── HELPERS DEL TURBORREACTOR ─────────────────────────────────────────────
    // Caudal en kg/s; acepta número o { valor, unidad: 'kg/s' | 'lb/s' }.
    _caudalKgS: function(caudal) {
        if (caudal === null || caudal === undefined) return null;
        if (typeof caudal === 'number') return caudal;
        return (caudal.unidad || '').toLowerCase() === 'lb/s'
            ? caudal.valor * 0.45359237
            : caudal.valor;
    },

    // Estequiometría del n-cetano: CₙHₘ + (n + m/4) O₂ → n CO₂ + m/2 H₂O
    _estequiometria: function() {
        const c   = this.constantes;
        const M   = c.cetano_n_C * 12.011 + c.cetano_n_H * 1.008;   // g/mol
        const nO2 = c.cetano_n_C + c.cetano_n_H / 4;                // mol O₂ / mol comb.
        const AFR = nO2 * 31.998 / (M * c.prop_O2);                 // kg aire / kg comb.
        return { M, nO2, AFR, f_est: 1 / AFR, Hc: c.cetano_Hc };
    },

    _validarTurborreactor: function(p, m_sl) {
        const err = msg => { throw new Error(msg); };
        if (!(m_sl > 0))                       err('Caudal de aire SL: debe ser un número positivo.');
        if (!(p.V0 >= 0))                      err('V0: debe ser mayor o igual a 0 (0 = despegue estático).');
        if (!(p.V1 > 0))                       err('V1: debe ser positiva.');
        if (!(p.rc > 1))                       err('Relación de compresión: debe ser mayor a 1.');
        if (!(p.dp_cc >= 0 && p.dp_cc < 100))  err('Δp cámara: debe estar entre 0 y 100 %.');
        if (!(p.bpr >= 0))                     err('BPR: debe ser mayor o igual a 0.');
        ['eta_difusor', 'eta_compresor', 'eta_turbina', 'eta_tobera',
         'eta_combustion', 'eta_mecanico', 'eta_fan'].forEach(function(clave) {
            if (!(p[clave] > 0 && p[clave] <= 1)) err(`${clave}: debe estar entre 0 y 1.`);
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CicloJouleBrayton;
}
