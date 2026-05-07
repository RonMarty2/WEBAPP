import type { ExamenConfig, Simulador } from "./types";

// In-memory store for development
const configStore: Record<string, ExamenConfig> = {};
const simuladorStore: Record<string, Simulador> = {};

export const axiomDB = {
  async getConfig(id: string): Promise<ExamenConfig | null> {
    return configStore[id] || null;
  },

  async createConfig(config: ExamenConfig): Promise<ExamenConfig> {
    configStore[config.id] = config;
    return config;
  },

  async updateConfig(
    id: string,
    updates: Partial<ExamenConfig>
  ): Promise<ExamenConfig> {
    const config = configStore[id];
    if (!config) throw new Error("Config not found");
    Object.assign(config, updates);
    return config;
  },

  async getSimulador(id: string): Promise<Simulador | null> {
    return simuladorStore[id] || null;
  },

  async createSimulador(simulador: Simulador): Promise<Simulador> {
    simuladorStore[simulador.id] = simulador;
    return simulador;
  },

  async updateSimulador(
    id: string,
    updates: Partial<Simulador>
  ): Promise<Simulador> {
    const simulador = simuladorStore[id];
    if (!simulador) throw new Error("Simulador not found");
    Object.assign(simulador, updates);
    return simulador;
  },

  async saveRespuestas(
    simuladorId: string,
    respuestas: Record<string, string>
  ): Promise<void> {
    const simulador = simuladorStore[simuladorId];
    if (simulador) {
      simulador.respuestas_usuario = respuestas;
    }
  },
};
