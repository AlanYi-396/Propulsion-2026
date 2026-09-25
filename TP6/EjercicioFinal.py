import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Button

# ==============================================================================
# PARÁMETROS GLOBALES Y DE FLUIDO
# ==============================================================================
# Estos parámetros se declaran una única vez y son heredados por todos los 
# ejercicios para mantener la coherencia termodinámica del modelo de gas ideal.
cp_kj = 1.005      # [kJ/(kg·K)] Calor específico a presión constante (balances de energía)
cp_j = 1005.0      # [J/(kg·K)] Calor específico para cálculos cinéticos (turborreactor)
gamma = 1.4        # Coeficiente de dilatación adiabática (relación cp/cv)
R = 287.05         # [J/(kg·K)] Constante particular del aire

# Datos del estado base (Compartidos entre Ejercicios 1, 3 y 4)
P1_base, T1_base, v1_base = 101.325, 260.0, 0.736
P2_base, T2_base, v2_base = 329.3, 364.0, 0.317
P3_base, T3_base, v3_base = 329.3, 1275.0, 1.11
P4_base, T4_base, v4_base = 101.323, 910.0, 2.578

# Parámetro exclusivo del Ejercicio 2 (Análisis paramétrico)
T1_ej2 = 263.0     # [K] Temperatura base ajustada para cumplir con los valores de control

# Datos operativos exclusivos del Turborreactor (Ejercicio 5)
h_vuelo = 4900.0   # [m] Altitud de vuelo
V0 = 250.0         # [m/s] Velocidad de entrada del aire (Mach de vuelo)
rc_turbo = 8.00    # Relación de compresión del motor
T_lim_turbo = 1150 # [K] Límite metalúrgico en la entrada a la turbina
Hc = 43000.0       # [kJ/kg] Poder calorífico del combustible (n-cetano)


# ==============================================================================
# CLASE PRINCIPAL: INTERFAZ INTERACTIVA
# ==============================================================================
class IteradorEjercicios:
    """
    Programa: Clase gestora de la interfaz de Matplotlib. Inicializa la figura, 
    gestiona el índice del ejercicio actual y vincula los eventos de clic de los 
    botones con los métodos de renderizado de cada gráfico.
    """
    def __init__(self):
        self.fig = plt.figure(figsize=(15, 7))
        self.index = 0  # Comienza en el Ejercicio 1 (índice 0)
        self.update_plot()
        plt.show()

    def next_ej(self, event):
        # Programa: Operador módulo (%) asegura que después del Ej 5 vuelva al Ej 1
        self.index = (self.index + 1) % 5
        self.update_plot()

    def prev_ej(self, event):
        self.index = (self.index - 1) % 5
        self.update_plot()

    def update_plot(self):
        # Programa: Limpia todos los ejes (gráficos y botones) de la figura actual
        self.fig.clf()
        
        # Ajusta el margen inferior de los gráficos para no pisar los botones
        self.fig.subplots_adjust(bottom=0.15, wspace=0.25)

        # Recrea los ejes interactivos y los botones de navegación
        axprev = self.fig.add_axes([0.35, 0.02, 0.12, 0.05])
        axnext = self.fig.add_axes([0.55, 0.02, 0.12, 0.05])
        self.bprev = Button(axprev, '⬅ Anterior')
        self.bnext = Button(axnext, 'Siguiente ➔')
        
        # Conecta las funciones callback a los botones
        self.bprev.on_clicked(self.prev_ej)
        self.bnext.on_clicked(self.next_ej)

        # Enrutador de ejecución basado en el índice actual
        if self.index == 0: self.run_ej1()
        elif self.index == 1: self.run_ej2()
        elif self.index == 2: self.run_ej3()
        elif self.index == 3: self.run_ej4()
        elif self.index == 4: self.run_ej5()

        # Fuerza a Matplotlib a redibujar la ventana con los nuevos elementos
        self.fig.canvas.draw_idle()

    # ==========================================================================
    # LÓGICA DE LOS EJERCICIOS INDIVIDUALES
    # ==========================================================================
    def run_ej1(self):
        self.fig.suptitle("Ejercicio 1: Ciclo Joule-Brayton Simple", fontsize=16, fontweight='bold')
        ax1 = self.fig.add_subplot(121)
        ax2 = self.fig.add_subplot(122)

        # Teoría: La entropía es una propiedad de estado relativa. Fijamos s1 = 0 
        # y calculamos las diferencias usando la ecuación de Gibbs (ds = cp*ln(T/T0)).
        s1 = 0.0
        s2 = s1
        s3 = s2 + cp_kj * np.log(T3_base / T2_base)
        s4 = s3

        # Programa: np.linspace genera 100 puntos iterativos entre dos volúmenes o 
        # entropías para poder trazar curvas adiabáticas e isobáricas continuas.
        v_12 = np.linspace(v2_base, v1_base, 100); P_12 = P1_base * (v1_base / v_12)**gamma
        v_23 = np.linspace(v2_base, v3_base, 100); P_23 = np.full_like(v_23, P2_base)
        v_34 = np.linspace(v3_base, v4_base, 100); P_34 = P3_base * (v3_base / v_34)**gamma
        v_41 = np.linspace(v1_base, v4_base, 100); P_41 = np.full_like(v_41, P1_base)

        s_12 = np.full(100, s1); T_12 = np.linspace(T1_base, T2_base, 100)
        s_23 = np.linspace(s2, s3, 100); T_23 = T2_base * np.exp((s_23 - s2) / cp_kj)
        s_34 = np.full(100, s3); T_34 = np.linspace(T4_base, T3_base, 100)
        s_41 = np.linspace(s1, s4, 100); T_41 = T1_base * np.exp((s_41 - s1) / cp_kj)

        # --- Gráfico P-v ---
        ax1.plot(v_12, P_12, 'b-', lw=2, label='1-2: Comp. Isentrópica')
        ax1.plot(v_23, P_23, 'r-', lw=2, label='2-3: Adición de Calor')
        ax1.plot(v_34, P_34, 'g-', lw=2, label='3-4: Exp. Isentrópica')
        ax1.plot(v_41, P_41, 'k-', lw=2, label='4-1: Rechazo de Calor')
        ax1.scatter([v1_base, v2_base, v3_base, v4_base], [P1_base, P2_base, P3_base, P4_base], color='red', zorder=5)
        ax1.set(xlabel='Volumen específico $v$ [m³/kg]', ylabel='Presión $P$ [kPa]', title='Diagrama P-v')
        ax1.grid(True, linestyle='--', alpha=0.5); ax1.legend()

        # --- Gráfico T-s ---
        ax2.plot(s_12, T_12, 'b-', lw=2, label='1-2: Comp. Isentrópica')
        ax2.plot(s_23, T_23, 'r-', lw=2, label='2-3: Adición de Calor')
        ax2.plot(s_34, T_34, 'g-', lw=2, label='3-4: Exp. Isentrópica')
        ax2.plot(s_41, T_41, 'k-', lw=2, label='4-1: Rechazo de Calor')
        ax2.scatter([s1, s2, s3, s4], [T1_base, T2_base, T3_base, T4_base], color='red', zorder=5)
        ax2.set(xlabel='Entropía específica $s$ [kJ/(kg·K)]', ylabel='Temperatura $T$ [K]', title='Diagrama T-s')
        ax2.grid(True, linestyle='--', alpha=0.5); ax2.legend()

    def run_ej2(self):
        self.fig.suptitle("Ejercicio 2: Análisis Paramétrico", fontsize=16, fontweight='bold')
        ax = self.fig.add_subplot(111)

        # Programa: Definimos la ecuación de calor útil como función lambda o estándar 
        # para pasarle todo el vector 'theta' y calcular toda la curva en un solo paso.
        def qu(theta, alpha, T1, cp):
            # Teoría: Ecuación adimensionalizada del trabajo útil (que equivale al calor útil).
            # Demuestra matemáticamente que el ciclo tiene un punto óptimo de compresión.
            return cp * T1 * (alpha - theta - alpha/theta + 1)

        theta = np.linspace(1, 3.5, 200)
        T_lims = [1200, 1270, 1300]
        colores = ['#1f77b4', '#d62728', '#2ca02c'] 

        for T_lim, color in zip(T_lims, colores):
            alpha = T_lim / T1_ej2
            q_u = qu(theta, alpha, T1_ej2, cp_kj)
            ax.plot(theta, q_u, color=color, label=f'$T_{{lim}}$ = {T_lim} K')
            
            # Teoría: Derivando d(qu)/d(theta) = 0, se halla que el theta que maximiza 
            # el rendimiento es exactamente la raíz cuadrada de alfa.
            theta_star = np.sqrt(alpha)
            qu_max = qu(theta_star, alpha, T1_ej2, cp_kj)
            ax.plot(theta_star, qu_max, marker='o', color=color, markersize=6)

        ax.set(xlabel='$\\theta = T_4/T_1$', ylabel='$q_u$ [kJ/kg]', title='Calor útil según la temperatura límite')
        ax.grid(True, linestyle='-', alpha=0.4); ax.legend(loc='lower right')

    def run_ej3(self):
        self.fig.suptitle("Ejercicio 3: Regeneración Térmica", fontsize=16, fontweight='bold')
        ax = self.fig.add_subplot(111)

        # Teoría: La regeneración consiste en precalentar el aire que sale del compresor 
        # utilizando la alta temperatura de los gases de escape de la turbina.
        alpha = T3_base / T1_base
        theta_prob = T2_base / T1_base

        # Teoría: Condición límite. Si theta > sqrt(alpha), el aire del compresor 
        # sale más caliente que el escape, haciendo imposible la regeneración.
        theta_limite = np.sqrt(alpha)
        theta_arr = np.linspace(1.0, 2.9, 200)

        # Programa: Se operan arrays vectorizados directamente. Al multiplicar por 100, 
        # convertimos instantáneamente todo el array a valores porcentuales.
        eta_simple = (1 - 1/theta_arr) * 100
        eta_reg = (1 - theta_arr/alpha) * 100

        ax.plot(theta_arr, eta_simple, color='#1f77b4', lw=2, label=r'Ciclo simple')
        ax.plot(theta_arr, eta_reg, color='#2ca02c', lw=2, label=r'Ciclo regenerativo')
        ax.axvline(x=theta_limite, color='gray', linestyle='--', alpha=0.7)
        
        ax.set(xlabel='$\\theta = T_2/T_1$', ylabel='$\\eta_T$ [%]', title=f'Rendimiento simple vs. regenerativo ($\\alpha$ = {alpha:.2f})')
        ax.grid(True, linestyle='-', alpha=0.3); ax.legend()

    def run_ej4(self):
        self.fig.suptitle("Ejercicio 4: Postcombustión (Recalentamiento)", fontsize=16, fontweight='bold')
        ax = self.fig.add_subplot(111)

        # Teoría: Fraccionamos la expansión en dos etapas y añadimos combustible en el medio
        # para elevar el área bajo la curva (aumentar el trabajo/empuje).
        theta_t = 1.30
        T4 = T3_base / theta_t
        P4 = P3_base * (theta_t**(-3.5))
        T5, P5 = 1400.0, P4
        T6 = T5 * (P1_base / P5)**0.2857

        s1 = 0.0
        s2 = s1
        s3 = s2 + cp_kj * np.log(T3_base / T2_base)
        s4 = s3
        s5 = s4 + cp_kj * np.log(T5 / T4)
        s6 = s5

        # Programa: Trazado punto a punto utilizando listas de coordenadas [s_inicial, s_final], [T_inicial, T_final]
        s_isobara_baja = np.linspace(s1, s6, 100); T_isobara_baja = T1_base * np.exp((s_isobara_baja - s1) / cp_kj)
        ax.plot(s_isobara_baja, T_isobara_baja, color='gray', linestyle='-') 
        ax.plot([s2, s3], [T2_base, T3_base], color='red', lw=2)      # Cámara principal
        ax.plot([s3, s4], [T3_base, T4], color='green', lw=2)         # Expansión 1
        ax.plot([s4, s5], [T4, T5], color='orange', lw=2)             # Postcombustor
        ax.plot([s5, s6], [T5, T6], color='green', lw=2)              # Expansión 2
        ax.plot([s1, s2], [T1_base, T2_base], color='black', lw=2)    # Compresor

        ax.scatter([s1,s2,s3,s4,s5,s6], [T1_base,T2_base,T3_base,T4,T5,T6], color='black', zorder=5)
        ax.set(xlabel='Entropía relativa $s$ [kJ/(kg·K)]', ylabel='Temperatura $T$ [K]')
        ax.grid(True, linestyle='--', alpha=0.4)

    def run_ej5(self):
        self.fig.suptitle("Ejercicio 5: Turborreactor Real", fontsize=16, fontweight='bold')
        ax1 = self.fig.add_subplot(121)
        ax2 = self.fig.add_subplot(122)

        # ==================== TEORÍA: CÁLCULO ESTACIÓN POR ESTACIÓN ====================
        # En motores de aviación con velocidades altas, la energía cinética del flujo 
        # importa. Por eso calculamos la Atmósfera (TA, pA) y luego frenamos el aire en 
        # el difusor obteniendo Magnitudes de Remanso (To1, po1) que incluyen esa energía.
        
        TA = 288.15 - 0.0065 * h_vuelo
        pA = 101.325 * (TA / 288.15)**5.256

        # Difusor
        To1 = TA + (V0**2) / (2 * cp_j)
        po1 = pA * (1 + 0.92 * (To1/TA - 1))**3.5

        # Compresor (Penalizado por rendimiento isentrópico de 0.85)
        po2 = rc_turbo * po1
        dTreal_comp = (To1 * (rc_turbo**0.2857 - 1)) / 0.85
        wC = cp_kj * dTreal_comp
        To2 = To1 + dTreal_comp

        # Cámara (Sufre pérdida de carga neumática del 4%)
        To3 = T_lim_turbo
        po3 = (1 - 0.04) * po2
        f = cp_kj * (To3 - To2) / (0.97 * Hc) # Fracción de masa de combustible

        # Turbina (Entrega exactamente el trabajo que consume el compresor: wT = wC)
        dTreal_turb = wC / cp_kj
        To4 = To3 - dTreal_turb
        po4 = po3 * (1 - (dTreal_turb / 0.91) / To3)**3.5

        # Tobera (Convierte el salto de presión restante en velocidad pura Vj)
        Tjs = To4 * (pA / po4)**0.2857
        Vj = np.sqrt(2 * cp_j * 0.95 * (To4 - Tjs))

        # Programa: Cálculo secuencial de entropías para graficar 
        # ds = cp*ln(T_final/T_inicial) - R*ln(p_final/p_inicial)
        sA = 0.0
        so1 = sA + cp_kj * np.log(To1/TA) - (R/1000) * np.log(po1/pA)
        so2 = so1 + cp_kj * np.log(To2/To1) - (R/1000) * np.log(po2/po1)
        so3 = so2 + cp_kj * np.log(To3/To2) - (R/1000) * np.log(po3/po2)
        so4 = so3 + cp_kj * np.log(To4/To3) - (R/1000) * np.log(po4/po3)

        # --- Gráfico T-s del Motor Real ---
        ax1.plot([sA, so1], [TA, To1], 'b-', lw=2, label='Difusor')
        ax1.plot([so1, so2], [To1, To2], 'c-', lw=2, label='Compresor')
        ax1.plot([so2, so3], [To2, To3], 'r-', lw=2, label='Cámara de combustión')
        ax1.plot([so3, so4], [To3, To4], 'g-', lw=2, label='Turbina')
        ax1.scatter([sA, so1, so2, so3, so4], [TA, To1, To2, To3, To4], color='black', zorder=5)
        ax1.set(xlabel='s - sA [kJ/(kg·K)]', ylabel='T [K]', title='Diagrama T-s (Remanso)')
        ax1.grid(True, linestyle='--', alpha=0.5); ax1.legend()

        # --- Gráfico de Rendimiento Propulsivo ---
        # Teoría: Muestra que si V0 se acerca a Vj, la eficiencia propulsiva tiende al 100%, 
        # pero el empuje neto tiende a cero (no hay cambio en la cantidad de movimiento).
        v_ratio = np.linspace(0.01, 1.0, 100)
        empuje_ad = 1 - v_ratio                     
        rend_prop = 2 * v_ratio / (1 + v_ratio)     
        pot_empuje = empuje_ad * v_ratio            

        ax2.plot(v_ratio, empuje_ad, 'b-', label='Empuje adimensional')
        ax2.plot(v_ratio, rend_prop, 'g-', label='Rendimiento propulsivo ηp')
        ax2.plot(v_ratio, pot_empuje, 'r-', label='Potencia de empuje')
        
        # Marcamos el punto operativo de nuestro problema
        v_ej = V0 / Vj
        eta_p = 2 * v_ej / (1 + v_ej)
        ax2.scatter([v_ej], [eta_p], color='black', zorder=5, s=40)
        
        ax2.set(xlabel='v = V0 / Vj', ylabel='Magnitudes', title='Rendimiento vs. Vuelo')
        ax2.grid(True, linestyle='--', alpha=0.5); ax2.legend()

# ==============================================================================
# BLOQUE DE EJECUCIÓN PRINCIPAL
# ==============================================================================
# Programa: Este bloque asegura que la interfaz gráfica sólo se instancie y
# se abra si el archivo es ejecutado directamente desde la terminal.
if __name__ == '__main__':
    IteradorEjercicios()