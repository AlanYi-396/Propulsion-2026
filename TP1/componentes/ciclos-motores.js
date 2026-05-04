/**
 * CICLOS MOTORES - Modelos Matemáticos
 * =====================================
 * Ciclo Otto, Diesel y Sabathé (ciclo mixto)
 *
 * Convenciones de signo (primer principio, trabajo del fluido):
 *   q > 0: calor absorbido    q < 0: calor cedido al medio
 *   w > 0: trabajo entregado  w < 0: trabajo tomado del fluido
 *
 * Unidades de salida:
 *   P [Pa], ρ [kg/m³], v [m³/kg], T [K]
 *   u [kCal/kg], h [kCal/kg]
 *   q [kCal/kg], w [kJ/kg]
 */

const CiclosMotores = {

    constantes: {
        // ── DATOS DEL AIRE ────────────────────────────────────────────────────
        R_aire:     286.71,     // J/(kg·K)   — constante específica del aire
        k:          1.40,       // —           — exponente adiabático
        Cp_aire:    0.2400,     // kCal/(kg·K) — calor específico a P=cte
        Cv_aire:    0.1715,     // kCal/(kg·K) — calor específico a V=cte
        J_por_kCal: 4184,       // J/kCal      — equivalencia trabajo-calor
        prop_O2:    0.236,      // —           — fracción másica de O₂ en aire
        prop_N2:    0.764,      // —           — fracción másica de N₂ en aire
        M_aire:     0.03,       // kg/mol      — masa molecular del aire

        // ── ATMÓSFERA ESTÁNDAR (ISA) ──────────────────────────────────────────
        P_atm_nivel_mar: 101325,
        T_standar:       288.15,
        g:               9.81,
        L_gradiente:     0.0065,

        // ── AVGAS 100LL (Otto y Sabathé) ──────────────────────────────────────
        // Fuente: tablas de parámetros de combustible y combustión
        avgas_LHV:      43.00,  // MJ/kg   — Poder Calorífico Inferior
        avgas_densidad:  0.74,  // kg/L
        avgas_f_mezcla:  0.068, // kg AvGas / kg mezcla (est., λ=1)
        // Datos de combustión (C₇H₁₅)
        avgas_n_C: 7,           // átomos de Carbono
        avgas_n_H: 15,          // átomos de Hidrógeno
        avgas_M:   99.13,       // g/mol — masa molecular
        avgas_AFR: 14.70,       // kg aire / kg combustible (estequiométrico)

        // ── DIESEL (solo ciclo Diesel) ────────────────────────────────────────
        // Fuente: tablas de parámetros de combustible y combustión Diesel
        diesel_LHV:        42.00,   // MJ/kg   — Poder Calorífico Inferior
        diesel_densidad:    0.82,   // kg/L    — a 15°C
        diesel_f_mezcla:   0.0638,  // kg Diesel / kg mezcla (est., λ=1)
        diesel_AFR:        14.68,   // kg aire / kg combustible (estequiométrico)
        diesel_n_C:        12,      // átomos de Carbono (C₁₂H₂₆)
        diesel_n_H:        26,      // átomos de Hidrógeno
        diesel_M:         160.14,   // g/mol — masa molecular (tabla de origen)

        // ── SABATHÉ ──────────────────────────────────────────────────────────
        sabathe_alpha: 1.5      // relación de presiones en la fase isocórica
    },

    // ─── DISPATCHER ────────────────────────────────────────────────────────────
    calcular: function(tipoCiclo, parametros) {
        tipoCiclo = tipoCiclo.toLowerCase().trim();
        const atm = this.calcularCondicionesAtmosfericas(parametros.altitud);
        switch (tipoCiclo) {
            case 'otto':   return this.cicloOtto(parametros, atm);
            case 'diesel': return this.cicloDiesel(parametros, atm);
            case 'sabath': return this.cicloSabath(parametros, atm);
            default:
                console.error('Ciclo no reconocido:', tipoCiclo);
                return null;
        }
    },

    // ─── ATMÓSFERA ESTÁNDAR (ISA) ──────────────────────────────────────────────
    calcularCondicionesAtmosfericas: function(altitud) {
        let h = altitud.valor;
        switch (altitud.unidad) {
            case 'ft': h *= 0.3048; break;
            case 'km': h *= 1000;   break;
        }
        if (h > 11000) console.warn('Altitud > 11 km; modelo ISA capa troposférica.');

        const T   = this.constantes.T_standar - this.constantes.L_gradiente * h;
        const exp = (this.constantes.g * h) / (this.constantes.R_aire * this.constantes.T_standar);
        const P   = this.constantes.P_atm_nivel_mar * Math.pow(T / this.constantes.T_standar, exp);
        const rho = P / (this.constantes.R_aire * T);

        return {
            altitud_m:     h,
            temperatura_K: T,
            presion_Pa:    P,
            densidad_kg_m3: rho,
            delta: P / this.constantes.P_atm_nivel_mar,
            theta: T / this.constantes.T_standar
        };
    },

    // ─── HELPERS INTERNOS ──────────────────────────────────────────────────────
    _cvJ: function(k) {
        // Cv en J/(kg·K) a partir de R y k
        return this.constantes.R_aire / (k - 1);
    },
    _cpJ: function(k) {
        return k * this.constantes.R_aire / (k - 1);
    },

    // ─── CICLO OTTO ────────────────────────────────────────────────────────────
    // 1→2  Compresión adiabática
    // 2→3  Combustión isocórica  (AvGas 100LL, λ=1)
    // 3→4  Expansión adiabática
    // 4→1  Escape isocórico
    cicloOtto: function(parametros, atm) {
        const k  = parametros.kAire;
        const r  = parametros.mezlaRelativa;   // relación de compresión
        const R  = this.constantes.R_aire;
        const Cv = this._cvJ(k);               // J/(kg·K)
        const Cp = this._cpJ(k);
        const JK = this.constantes.J_por_kCal; // 4184 J/kCal

        // ── Estado 1
        const P1   = atm.presion_Pa;
        const T1   = atm.temperatura_K + (parametros.deltaT || 0);
        const rho1 = P1 / (R * T1);
        const v1   = 1 / rho1;

        // ── Estado 2 (compresión adiabática)
        const T2   = T1   * Math.pow(r, k - 1);
        const P2   = P1   * Math.pow(r, k);
        const rho2 = rho1 * r;
        const v2   = v1   / r;

        // ── Calor de combustión (AvGas 100LL, f = 0.068 kg/kg mezcla)
        const q_in = this.constantes.avgas_LHV * 1e6 * this.constantes.avgas_f_mezcla; // J/kg

        // ── Estado 3 (combustión isocórica: v₃=v₂)
        const T3   = T2 + q_in / Cv;
        const P3   = P2 * (T3 / T2);
        const rho3 = rho2;
        const v3   = v2;

        // ── Estado 4 (expansión adiabática: v₄=v₁)
        const T4   = T3   / Math.pow(r, k - 1);
        const P4   = P3   / Math.pow(r, k);
        const rho4 = rho1;
        const v4   = v1;

        // ── Intercambios por proceso [J/kg → salida en kCal/kg y kJ/kg]
        const w12 = -Cv * (T2 - T1);   // negativo (compresión)
        const q23 =  q_in;             // = Cv*(T3-T2)
        const w34 =  Cv * (T3 - T4);   // positivo (expansión)
        const q41 =  Cv * (T1 - T4);   // negativo (escape)

        const eta_th = 1 - 1 / Math.pow(r, k - 1);
        const w_neto = (w12 + w34) / 1000; // kJ/kg

        // ── Variación de entropía por proceso [kCal/(kg·K)]
        const ds12 = 0;                                 // adiabático
        const ds23 = Cv * Math.log(T3 / T2) / JK;     // isocórico (> 0)
        const ds34 = 0;                                 // adiabático
        const ds41 = Cv * Math.log(T1 / T4) / JK;     // isocórico (< 0, escape)

        // ── Cilindrada necesaria — motor 4T: 2 rev/ciclo → factor 120
        // V_d [L] = P_W [W] * 120 / (η_mec * w_neto [kJ/kg] * ρ₁ [kg/m³] * RPM)
        const P_W   = parametros.potencia.unidad === 'hp'
            ? parametros.potencia.valor * 745.7
            : parametros.potencia.valor * 1000;
        const V_d_L = (P_W * 120) / (parametros.rendimientoMecanico * w_neto * rho1 * parametros.rpm);

        return {
            tipo_ciclo: 'Otto',
            estados: [
                { num:1, P:P1, rho:rho1, v:v1, T:T1, u:Cv*T1/JK, h:Cp*T1/JK },
                { num:2, P:P2, rho:rho2, v:v2, T:T2, u:Cv*T2/JK, h:Cp*T2/JK },
                { num:3, P:P3, rho:rho3, v:v3, T:T3, u:Cv*T3/JK, h:Cp*T3/JK },
                { num:4, P:P4, rho:rho4, v:v4, T:T4, u:Cv*T4/JK, h:Cp*T4/JK }
            ],
            procesos: [
                { etapa:'(1-2)', tiempo:'Compresión', q:null,   w:w12/1000, ds:ds12 },
                { etapa:'(2-3)', tiempo:'Combustión', q:q23/JK, w:null,     ds:ds23 },
                { etapa:'(3-4)', tiempo:'Expansión',  q:null,   w:w34/1000, ds:ds34 },
                { etapa:'(4-1)', tiempo:'Escape',     q:q41/JK, w:null,     ds:ds41 }
            ],
            rendimientos: {
                eta_th,
                eta_mecanico: parametros.rendimientoMecanico,
                w_neto,
                q_in:  q23 / JK,
                q_out: q41 / JK,
                cilindrada_L: V_d_L
            },
            k_aire: k, Cv_J: Cv, Cp_J: Cp, R: R, JK: JK
        };
    },

    // ─── CICLO DIESEL ──────────────────────────────────────────────────────────
    // 1→2  Compresión adiabática
    // 2→3  Combustión isobárica   (Diesel/Jet-A, λ=1)
    // 3→4  Expansión adiabática
    // 4→1  Escape isocórico
    cicloDiesel: function(parametros, atm) {
        const k  = parametros.kAire;
        const r  = parametros.mezlaRelativa;
        const R  = this.constantes.R_aire;
        const Cv = this._cvJ(k);
        const Cp = this._cpJ(k);
        const JK = this.constantes.J_por_kCal;

        // ── Estado 1
        const P1   = atm.presion_Pa;
        const T1   = atm.temperatura_K + (parametros.deltaT || 0);
        const rho1 = P1 / (R * T1);
        const v1   = 1 / rho1;

        // ── Estado 2 (compresión adiabática)
        const T2   = T1   * Math.pow(r, k - 1);
        const P2   = P1   * Math.pow(r, k);
        const rho2 = rho1 * r;
        const v2   = v1   / r;

        // ── Calor de combustión (Diesel, datos provisionales)
        const q_in = this.constantes.diesel_LHV * 1e6 * this.constantes.diesel_f_mezcla;

        // ── Estado 3 (combustión isobárica: P₃=P₂, q=Cp·ΔT)
        const T3   = T2 + q_in / Cp;
        const P3   = P2;
        const rho3 = P3 / (R * T3);
        const v3   = 1 / rho3;
        const rc   = v3 / v2;  // cutoff ratio

        // ── Estado 4 (expansión adiabática: v₄=v₁)
        const T4   = T3   * Math.pow(rc / r, k - 1);
        const P4   = P3   * Math.pow(rc / r, k);
        const rho4 = rho1;
        const v4   = v1;

        // ── Procesos
        const w12 = -Cv * (T2 - T1);
        const q23 =  q_in;
        const w23 =  R  * (T3 - T2);   // trabajo isobárico
        const w34 =  Cv * (T3 - T4);
        const q41 =  Cv * (T1 - T4);

        const eta_th = 1 - (1 / Math.pow(r, k-1)) * (Math.pow(rc,k) - 1) / (k * (rc - 1));
        const w_neto = (w12 + w23 + w34) / 1000;

        // ── Variación de entropía por proceso [kCal/(kg·K)]
        const ds12 = 0;                                 // adiabático
        const ds23 = Cp * Math.log(T3 / T2) / JK;     // isobárico (> 0)
        const ds34 = 0;                                 // adiabático
        const ds41 = Cv * Math.log(T1 / T4) / JK;     // isocórico (< 0, escape)

        // ── Cilindrada necesaria — motor 4T: 2 rev/ciclo → factor 120
        const P_W   = parametros.potencia.unidad === 'hp'
            ? parametros.potencia.valor * 745.7
            : parametros.potencia.valor * 1000;
        const V_d_L = (P_W * 120) / (parametros.rendimientoMecanico * w_neto * rho1 * parametros.rpm);

        return {
            tipo_ciclo: 'Diesel',
            estados: [
                { num:1, P:P1, rho:rho1, v:v1, T:T1, u:Cv*T1/JK, h:Cp*T1/JK },
                { num:2, P:P2, rho:rho2, v:v2, T:T2, u:Cv*T2/JK, h:Cp*T2/JK },
                { num:3, P:P3, rho:rho3, v:v3, T:T3, u:Cv*T3/JK, h:Cp*T3/JK },
                { num:4, P:P4, rho:rho4, v:v4, T:T4, u:Cv*T4/JK, h:Cp*T4/JK }
            ],
            procesos: [
                { etapa:'(1-2)', tiempo:'Compresión', q:null,   w:w12/1000, ds:ds12 },
                { etapa:'(2-3)', tiempo:'Combustión', q:q23/JK, w:null,     ds:ds23 },
                { etapa:'(3-4)', tiempo:'Expansión',  q:null,   w:w34/1000, ds:ds34 },
                { etapa:'(4-1)', tiempo:'Escape',     q:q41/JK, w:null,     ds:ds41 }
            ],
            rendimientos: {
                eta_th,
                eta_mecanico: parametros.rendimientoMecanico,
                w_neto,
                q_in:  q23 / JK,
                q_out: q41 / JK,
                cilindrada_L: V_d_L
            },
            k_aire: k, Cv_J: Cv, Cp_J: Cp, R: R, JK: JK
        };
    },

    // ─── CICLO SABATHÉ ─────────────────────────────────────────────────────────
    // 1→2  Compresión adiabática
    // 2→3  Combustión isocórica  (α = P₃/P₂ = 1.5, AvGas 100LL)
    // 3→4  Combustión isobárica  (calor restante)
    // 4→5  Expansión adiabática
    // 5→1  Escape isocórico
    cicloSabath: function(parametros, atm) {
        const k     = parametros.kAire;
        const r     = parametros.mezlaRelativa;
        const R     = this.constantes.R_aire;
        const Cv    = this._cvJ(k);
        const Cp    = this._cpJ(k);
        const JK    = this.constantes.J_por_kCal;
        const alpha = this.constantes.sabathe_alpha;

        // ── Estado 1
        const P1   = atm.presion_Pa;
        const T1   = atm.temperatura_K + (parametros.deltaT || 0);
        const rho1 = P1 / (R * T1);
        const v1   = 1 / rho1;

        // ── Estado 2 (compresión adiabática)
        const T2   = T1   * Math.pow(r, k - 1);
        const P2   = P1   * Math.pow(r, k);
        const rho2 = rho1 * r;
        const v2   = v1   / r;

        // ── Estado 3 (combustión isocórica: v₃=v₂, P₃=α·P₂)
        const P3   = P2 * alpha;
        const T3   = T2 * alpha;   // v=cte → T∝P
        const rho3 = rho2;
        const v3   = v2;
        const q_vc = Cv * (T3 - T2);   // calor en fase V.C. [J/kg]

        // ── Calor total (AvGas 100LL, f=0.068)
        const q_total = this.constantes.avgas_LHV * 1e6 * this.constantes.avgas_f_mezcla;
        const q_pc    = Math.max(0, q_total - q_vc);   // calor en fase P.C.

        // ── Estado 4 (combustión isobárica: P₄=P₃)
        const T4   = T3 + q_pc / Cp;
        const P4   = P3;
        const rho4 = P4 / (R * T4);
        const v4   = 1 / rho4;

        // ── Estado 5 (expansión adiabática: v₅=v₁)
        const T5   = T4   * Math.pow(v4 / v1, k - 1);
        const P5   = P4   * Math.pow(v4 / v1, k);
        const rho5 = rho1;
        const v5   = v1;

        // ── Procesos
        const w12 = -Cv * (T2 - T1);
        const q23 =  q_vc;
        const q34 =  q_pc;
        const w34 =  R  * (T4 - T3);
        const w45 =  Cv * (T4 - T5);
        const q51 =  Cv * (T1 - T5);

        const w_neto = (w12 + w34 + w45) / 1000;
        const eta_th  = w_neto / ((q_vc + q_pc) / 1000);

        // ── Variación de entropía por proceso [kCal/(kg·K)]
        const ds12 = 0;                                 // adiabático
        const ds23 = Cv * Math.log(T3 / T2) / JK;     // isocórico (> 0)
        const ds34 = Cp * Math.log(T4 / T3) / JK;     // isobárico (> 0)
        const ds45 = 0;                                 // adiabático
        const ds51 = Cv * Math.log(T1 / T5) / JK;     // isocórico (< 0, escape)

        // ── Cilindrada necesaria — motor 4T: 2 rev/ciclo → factor 120
        const P_W   = parametros.potencia.unidad === 'hp'
            ? parametros.potencia.valor * 745.7
            : parametros.potencia.valor * 1000;
        const V_d_L = (P_W * 120) / (parametros.rendimientoMecanico * w_neto * rho1 * parametros.rpm);

        return {
            tipo_ciclo: 'Sabathé',
            estados: [
                { num:1, P:P1, rho:rho1, v:v1, T:T1, u:Cv*T1/JK, h:Cp*T1/JK },
                { num:2, P:P2, rho:rho2, v:v2, T:T2, u:Cv*T2/JK, h:Cp*T2/JK },
                { num:3, P:P3, rho:rho3, v:v3, T:T3, u:Cv*T3/JK, h:Cp*T3/JK },
                { num:4, P:P4, rho:rho4, v:v4, T:T4, u:Cv*T4/JK, h:Cp*T4/JK },
                { num:5, P:P5, rho:rho5, v:v5, T:T5, u:Cv*T5/JK, h:Cp*T5/JK }
            ],
            procesos: [
                { etapa:'(1-2)', tiempo:'Compresión',    q:null,   w:w12/1000, ds:ds12 },
                { etapa:'(2-3)', tiempo:'Combustión VC', q:q23/JK, w:null,     ds:ds23 },
                { etapa:'(3-4)', tiempo:'Combustión PC', q:q34/JK, w:w34/1000, ds:ds34 },
                { etapa:'(4-5)', tiempo:'Expansión',     q:null,   w:w45/1000, ds:ds45 },
                { etapa:'(5-1)', tiempo:'Escape',        q:q51/JK, w:null,     ds:ds51 }
            ],
            rendimientos: {
                eta_th,
                eta_mecanico: parametros.rendimientoMecanico,
                w_neto,
                q_in:  (q_vc + q_pc) / JK,
                q_out: q51 / JK,
                cilindrada_L: V_d_L
            },
            k_aire: k, Cv_J: Cv, Cp_J: Cp, R: R, JK: JK
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CiclosMotores;
}
