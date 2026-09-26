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

        // Ejercicio 5 — turborreactor real de 1 eje
        turborreactor: {
            // ── Entradas por pantalla
            h_vuelo:       4900.0,  // m     — altitud (o { valor, unidad })
            V0:            250.0,   // m/s   — velocidad de corriente libre (estado 0)
            rc:            8.00,    // —     — relación de compresión po2/po1
            V1:            150.0,   // m/s   — velocidad a la entrada del compresor
            dp_cc:         4.0,     // %     — pérdida de presión total en cámara
            T3:            1150,    // K     — T límite: entrada a turbina (límite metalúrgico)
            eta_difusor:   0.92,
            eta_compresor: 0.85,
            eta_turbina:   0.91,
            eta_tobera:    0.95,
            potencia:      null,    // W     — obligatoria (o { valor, unidad: 'w'|'kw'|'hp' })

            // ── Parámetros fijos (valores por defecto del .py)
            eta_combustion: 0.97,     // —     — fracción de Hc liberada en la cámara
            eta_mecanico:   1.00,     // —     — transmisión turbina → compresor (cojinetes)
            tipo_potencia:  'empuje', // 'empuje' (E·V0) | 'eje' (ṁ·wC) | 'chorro' (ΔEc)

            v_min: 0.01, v_max: 1.0, n: 100  // barrido de V0/Vj
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
        return this.constantes.cp_kj * Math.log(Tb / Ta)
             - (this.constantes.R / 1000) * Math.log(pb / pa);
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

    // ─── EJ. 5: TURBORREACTOR REAL (1 EJE) ─────────────────────────────────────
    // Estados (estáticos T, P y de remanso To, Po):
    //   0  Corriente libre (ISA a h_vuelo, velocidad V0)
    //   1  Salida difusor / entrada compresor (velocidad V1)
    //   2  Salida compresor
    //   3  Salida cámara / entrada turbina (T3 = límite metalúrgico)
    //   4  Salida turbina / entrada tobera
    //   j  Salida tobera (expansión adaptada: pj = p0)
    // Hipótesis: 1 eje → (1+f)·wT·ηm = wC; gas ideal con cp y γ constantes;
    // procesos adiabáticos salvo la cámara; velocidad despreciable en 2, 3 y 4
    // (estático ≈ remanso); combustible n-cetano C₁₆H₃₄.
    //
    // La potencia fija el caudal de aire ṁa según 'tipo_potencia':
    //   'empuje' → W = E·V0          (potencia de empuje)
    //   'eje'    → W = ṁa·wC         (potencia absorbida por el compresor)
    //   'chorro' → W = ΔEc del chorro (potencia útil del ciclo)
    turborreactor: function(parametros) {
        const p   = this._params('turborreactor', parametros);
        const c   = this.constantes;
        const cp  = c.cp_kj;       // kJ/(kg·K)
        const cpJ = c.cp_j;        // J/(kg·K)
        const k   = c.gamma;
        const m   = this._m(k);    // (k-1)/k
        const km  = 1 / m;         // k/(k-1) = 3.5
        const R   = c.R;

        const W = this._potenciaW(p.potencia);
        this._validarTurborreactor(p, W);

        // ── Combustible: n-cetano
        const comb = this._estequiometria();

        // ── Estado 0: corriente libre (ISA)
        const atm = this.calcularCondicionesAtmosfericas(p.h_vuelo);
        const T0  = atm.temperatura_K;
        const p0  = atm.presion_kPa;
        const To0 = T0 + p.V0 * p.V0 / (2 * cpJ);
        const po0 = p0 * Math.pow(To0 / T0, km);

        // ── Estado 1: el difusor frena de V0 a V1 (To1 = To0, adiabático)
        //    ηd = (T1s − T0)/(T1 − T0): solo ηd·ΔEc se recupera como presión
        const T1  = T0 + (p.V0 * p.V0 - p.V1 * p.V1) / (2 * cpJ);
        const T1s = T0 + p.eta_difusor * (T1 - T0);
        const p1  = p0 * Math.pow(T1s / T0, km);
        const To1 = To0;
        const po1 = p1 * Math.pow(To1 / T1, km);

        // ── Estado 2: compresor (penalizado por ηc)
        const po2 = p.rc * po1;
        const To2 = To1 * (1 + (Math.pow(p.rc, m) - 1) / p.eta_compresor);
        const wC  = cp * (To2 - To1);                  // kJ/kg aire

        // ── Estado 3: cámara de combustión
        //    ṁa·cp·To2 + ηcomb·ṁf·Hc = (ṁa + ṁf)·cp·To3   →   f = ṁf/ṁa
        const To3 = p.T3;
        const po3 = (1 - p.dp_cc / 100) * po2;
        if (To3 <= To2) {
            throw new Error(`T3 (${To3} K) debe superar la salida del compresor (To2 = ${To2.toFixed(1)} K).`);
        }
        const f = cp * (To3 - To2) / (p.eta_combustion * c.cetano_Hc - cp * To3);
        if (f > comb.f_est) {
            throw new Error(`Dosado f = ${f.toFixed(4)} supera el estequiométrico (${comb.f_est.toFixed(4)}); reducir T3.`);
        }

        // ── Estado 4: turbina — entrega exactamente lo que consume el compresor
        const wT   = wC / ((1 + f) * p.eta_mecanico);  // kJ/kg gas
        const To4  = To3 - wT / cp;
        const To4s = To3 - (To3 - To4) / p.eta_turbina;
        const po4  = po3 * Math.pow(To4s / To3, km);
        if (!(To4s > 0) || !(po4 > p0)) {
            throw new Error('La turbina no deja salto de presión para la tobera; aumentar T3 o revisar RC y rendimientos.');
        }

        // ── Estado j: tobera adaptada (pj = p0), penalizada por ηtob
        const pj  = p0;
        const Tjs = To4 * Math.pow(pj / po4, m);
        const Tj  = To4 - p.eta_tobera * (To4 - Tjs);
        const Vj  = Math.sqrt(2 * cpJ * (To4 - Tj));
        const Toj = To4;
        const poj = pj * Math.pow(Toj / Tj, km);
        // Si po4/p0 supera ((k+1)/2)^(k/(k-1)) ≈ 1.893, una tobera convergente se
        // bloquea (M = 1 en la garganta): la expansión adaptada exige tobera C-D.
        const rel_critica      = Math.pow((k + 1) / 2, km);
        const tobera_bloqueada = po4 / pj > rel_critica;

        // ── Actuaciones específicas (por kg/s de aire)
        const E_esp = (1 + f) * Vj - p.V0;                          // N/(kg/s)
        const dEc   = ((1 + f) * Vj * Vj - p.V0 * p.V0) / 2;        // J/kg aire
        const q_f   = f * c.cetano_Hc * 1000;                       // J/kg aire
        const eta_t = dEc / q_f;                                    // térmico
        const eta_p = E_esp * p.V0 / dEc;                           // propulsivo
        const eta_o = eta_t * eta_p;                                // global

        // ── Caudales a partir de la potencia
        const w_ref = { empuje: E_esp * p.V0, eje: wC * 1000, chorro: dEc }[p.tipo_potencia];
        if (!(w_ref > 0)) {
            throw new Error('El motor no entrega potencia neta con estos parámetros (empuje ≤ 0).');
        }
        const ma = W / w_ref;          // kg/s aire
        const mf = f * ma;             // kg/s combustible
        const mg = ma + mf;            // kg/s gases
        const E  = E_esp * ma;         // N
        const TSFC = mf / E;           // kg/(N·s)

        // ── Entropías relativas (s0 = 0), sobre magnitudes de remanso
        const s0 = 0.0;
        const s1 = s0 + this._ds(To0, To1, po0, po1);
        const s2 = s1 + this._ds(To1, To2, po1, po2);
        const s3 = s2 + this._ds(To2, To3, po2, po3);
        const s4 = s3 + this._ds(To3, To4, po3, po4);
        const sj = s4 + this._ds(To4, Toj, po4, poj);

        // ── Estados: velocidad null → estático ≈ remanso
        const estado = (num, nombre, T, P, To, Po, V, s, caudal) => {
            const rho = P * 1000 / (R * T);
            return { num, nombre, T, P, To, Po, V, rho, s,
                     A: V ? caudal / (rho * V) : null };   // área de paso [m²]
        };
        const estados = [
            estado('0', 'Corriente libre', T0,  p0,  To0, po0, p.V0, s0, ma),
            estado('1', 'Entrada compr.',  T1,  p1,  To1, po1, p.V1, s1, ma),
            estado('2', 'Salida compr.',   To2, po2, To2, po2, null, s2, ma),
            estado('3', 'Entrada turbina', To3, po3, To3, po3, null, s3, mg),
            estado('4', 'Salida turbina',  To4, po4, To4, po4, null, s4, mg),
            estado('j', 'Salida tobera',   Tj,  pj,  Toj, poj, Vj,   sj, mg)
        ];

        // ── Intercambios por proceso [kJ/kg aire]
        const procesos = [
            { etapa: '(0-1)', tiempo: 'Difusor',    q: null,                       w: null,           ds: s1 - s0 },
            { etapa: '(1-2)', tiempo: 'Compresor',  q: null,                       w: -wC,            ds: s2 - s1 },
            { etapa: '(2-3)', tiempo: 'Combustión', q: p.eta_combustion * q_f / 1000, w: null,        ds: s3 - s2 },
            { etapa: '(3-4)', tiempo: 'Turbina',    q: null,                       w: (1 + f) * wT,   ds: s4 - s3 },
            { etapa: '(4-j)', tiempo: 'Tobera',     q: null,                       w: null,           ds: sj - s4 }
        ];

        const seg = (sa, sb, Ta, Tb) => [{ x: sa, y: Ta }, { x: sb, y: Tb }];

        // ── Rendimiento propulsivo vs v = V0/Vj
        const v_ratio = this._linspace(p.v_min, p.v_max, p.n);
        const v_ej    = p.V0 / Vj;

        return {
            tipo_ciclo: 'Turborreactor',
            atmosfera:  atm,
            combustible: comb,
            estados,
            procesos,
            magnitudes: {
                wC, wT,                          // kJ/kg aire, kJ/kg gas
                f, lambda: comb.f_est / f,       // dosado y exceso de aire relativo
                Vj, E_esp,                       // m/s, N/(kg/s)
                ma, mf, E,                       // kg/s, kg/s, N
                TSFC, TSFC_h: TSFC * 3600,       // kg/(N·s), kg/(N·h)
                P_compresor: ma * wC * 1000,     // W
                eta_t, eta_p, eta_o,
                v_ej,
                rel_critica, tobera_bloqueada
            },
            curvas: {
                ts: [
                    { nombre: 'Difusor',              puntos: seg(s0, s1, To0, To1) },
                    { nombre: 'Compresor',            puntos: seg(s1, s2, To1, To2) },
                    { nombre: 'Cámara de combustión', puntos: seg(s2, s3, To2, To3) },
                    { nombre: 'Turbina',              puntos: seg(s3, s4, To3, To4) },
                    { nombre: 'Tobera',               puntos: seg(s4, sj, To4, Tj)  }
                ],
                propulsivas: {
                    empuje_adimensional: this._puntos(v_ratio, v_ratio.map(v => 1 - v)),
                    rendimiento_prop:    this._puntos(v_ratio, v_ratio.map(v => 2 * v / (1 + v))),
                    potencia_empuje:     this._puntos(v_ratio, v_ratio.map(v => (1 - v) * v))
                },
                punto_operativo: { x: v_ej, y: 2 * v_ej / (1 + v_ej) }
            }
        };
    },

    // ─── HELPERS DEL TURBORREACTOR ─────────────────────────────────────────────
    // Potencia en W; acepta número o { valor, unidad: 'w' | 'kw' | 'hp' }.
    _potenciaW: function(potencia) {
        if (potencia === null || potencia === undefined) return null;
        if (typeof potencia === 'number') return potencia;
        switch ((potencia.unidad || 'w').toLowerCase()) {
            case 'kw': return potencia.valor * 1000;
            case 'hp': return potencia.valor * 745.7;
            default:   return potencia.valor;
        }
    },

    // Estequiometría del n-cetano: CₙHₘ + (n + m/4) O₂ → n CO₂ + m/2 H₂O
    _estequiometria: function() {
        const c   = this.constantes;
        const M   = c.cetano_n_C * 12.011 + c.cetano_n_H * 1.008;   // g/mol
        const nO2 = c.cetano_n_C + c.cetano_n_H / 4;                // mol O₂ / mol comb.
        const AFR = nO2 * 31.998 / (M * c.prop_O2);                 // kg aire / kg comb.
        return { M, nO2, AFR, f_est: 1 / AFR, Hc: c.cetano_Hc };
    },

    _validarTurborreactor: function(p, W) {
        const err = msg => { throw new Error(msg); };
        if (!(W > 0))                          err('Potencia: debe ser un número positivo.');
        if (!(p.V0 >= 0))                      err('V0: debe ser mayor o igual a 0.');
        if (!(p.V1 > 0))                       err('V1: debe ser positiva.');
        if (p.V1 > p.V0)                       err('V1 debe ser ≤ V0: el difusor desacelera la corriente.');
        if (!(p.rc > 1))                       err('Relación de compresión: debe ser mayor a 1.');
        if (!(p.dp_cc >= 0 && p.dp_cc < 100))  err('Δp cámara: debe estar entre 0 y 100 %.');
        ['eta_difusor', 'eta_compresor', 'eta_turbina', 'eta_tobera',
         'eta_combustion', 'eta_mecanico'].forEach(function(clave) {
            if (!(p[clave] > 0 && p[clave] <= 1)) err(`${clave}: debe estar entre 0 y 1.`);
        });
        if (!['empuje', 'eje', 'chorro'].includes(p.tipo_potencia)) {
            err(`tipo_potencia no reconocido: ${p.tipo_potencia}`);
        }
        if (p.tipo_potencia === 'empuje' && !(p.V0 > 0)) {
            err('Con potencia de empuje (E·V0) se requiere V0 > 0.');
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CicloJouleBrayton;
}
