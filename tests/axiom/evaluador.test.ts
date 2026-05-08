import { axiomEvaluador } from "@/lib/axiom/evaluador";
import type { Simulador, ExamenConfig, Pregunta } from "@/lib/axiom/types";

describe("axiomEvaluador", () => {
  const mockConfig: ExamenConfig = {
    id: "test-exam",
    nombre: "Test Exam",
    areas: [
      { nombre: "Matemáticas", cantidad: 10, ponderacion: 0.33 },
      { nombre: "Económicas", cantidad: 10, ponderacion: 0.33 },
      { nombre: "Verbal", cantidad: 10, ponderacion: 0.34 },
    ],
    tiempo_minutos: 180,
    activo: true,
    creado: new Date().toISOString(),
  };

  const mockPregunta = (id: string, area: string, respuestaCorrecta: string): Pregunta => ({
    id,
    area,
    contenido: "¿Cuál es la respuesta correcta?",
    opciones: ["A", "B", "C", "D"],
    respuesta_correcta: respuestaCorrecta,
    explicacion: "Esta es la explicación de la pregunta",
    dificultad: "medio",
  });

  describe("evaluarSimulador", () => {
    it("should calculate score correctly with all correct answers", () => {
      const preguntas: Pregunta[] = [
        mockPregunta("q-1", "Matemáticas", "B"),
        mockPregunta("q-2", "Matemáticas", "C"),
        mockPregunta("q-3", "Económicas", "A"),
        mockPregunta("q-4", "Económicas", "D"),
        mockPregunta("q-5", "Verbal", "B"),
      ];

      const mockSimulador: Simulador = {
        id: "sim-1",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: preguntas,
        respuestas_usuario: {
          "q-1": "B",
          "q-2": "C",
          "q-3": "A",
          "q-4": "D",
          "q-5": "B",
        },
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(mockSimulador, mockConfig);
      expect(resultado.nota_final).toBe(100);
      expect(resultado.desglose["Matemáticas"]).toBe(100);
      expect(resultado.desglose["Económicas"]).toBe(100);
      expect(resultado.desglose["Verbal"]).toBe(100);
      expect(resultado.respuestas).toHaveLength(5);
      expect(resultado.respuestas.every((r) => r.correcta)).toBe(true);
    });

    it("should calculate score correctly with partial correct answers", () => {
      const preguntas: Pregunta[] = [
        mockPregunta("q-1", "Matemáticas", "B"),
        mockPregunta("q-2", "Matemáticas", "C"),
        mockPregunta("q-3", "Económicas", "A"),
        mockPregunta("q-4", "Económicas", "D"),
      ];

      const mockSimulador: Simulador = {
        id: "sim-2",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: preguntas,
        respuestas_usuario: {
          "q-1": "B",
          "q-2": "A", // incorrect
          "q-3": "A",
          "q-4": "C", // incorrect
        },
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(mockSimulador, mockConfig);
      expect(resultado.desglose["Matemáticas"]).toBe(50); // 1/2 correct
      expect(resultado.desglose["Económicas"]).toBe(50); // 1/2 correct
      expect(resultado.respuestas.filter((r) => r.correcta)).toHaveLength(2);
    });

    it("should handle zero correct answers", () => {
      const preguntas: Pregunta[] = [
        mockPregunta("q-1", "Matemáticas", "B"),
        mockPregunta("q-2", "Matemáticas", "C"),
      ];

      const mockSimulador: Simulador = {
        id: "sim-3",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: preguntas,
        respuestas_usuario: {
          "q-1": "A", // all incorrect
          "q-2": "A",
        },
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(mockSimulador, mockConfig);
      expect(resultado.nota_final).toBe(0);
      expect(resultado.desglose["Matemáticas"]).toBe(0);
      expect(resultado.respuestas.every((r) => !r.correcta)).toBe(true);
    });

    it("should handle empty responses", () => {
      const emptySimulador: Simulador = {
        id: "sim-empty",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: [],
        respuestas_usuario: {},
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(emptySimulador, mockConfig);
      expect(resultado.nota_final).toBe(0);
      expect(resultado.respuestas).toHaveLength(0);
    });

    it("should handle missing user responses", () => {
      const preguntas: Pregunta[] = [
        mockPregunta("q-1", "Matemáticas", "B"),
        mockPregunta("q-2", "Matemáticas", "C"),
      ];

      const mockSimulador: Simulador = {
        id: "sim-4",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: preguntas,
        respuestas_usuario: {
          "q-1": "B", // only answered one
        },
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(mockSimulador, mockConfig);
      expect(resultado.respuestas).toHaveLength(2);
      expect(resultado.respuestas[0].correcta).toBe(true);
      expect(resultado.respuestas[1].respuesta).toBe(""); // missing response
      expect(resultado.respuestas[1].correcta).toBe(false);
    });

    it("should respect area weightings in final score", () => {
      const configCustom: ExamenConfig = {
        id: "test-custom",
        nombre: "Custom Exam",
        areas: [
          { nombre: "Matemáticas", cantidad: 5, ponderacion: 0.5 }, // 50%
          { nombre: "Verbal", cantidad: 5, ponderacion: 0.5 }, // 50%
        ],
        tiempo_minutos: 120,
        activo: true,
        creado: new Date().toISOString(),
      };

      const preguntas: Pregunta[] = [
        mockPregunta("q-1", "Matemáticas", "B"),
        mockPregunta("q-2", "Matemáticas", "C"),
        mockPregunta("q-3", "Verbal", "A"),
        mockPregunta("q-4", "Verbal", "D"),
      ];

      const mockSimulador: Simulador = {
        id: "sim-5",
        usuario_id: "user-1",
        estado: "completado",
        preguntas_generadas: preguntas,
        respuestas_usuario: {
          "q-1": "B", // Math: 1/2 = 50%
          "q-2": "A",
          "q-3": "A", // Verbal: 2/2 = 100%
          "q-4": "D",
        },
        fecha_inicio: new Date().toISOString(),
      };

      const resultado = axiomEvaluador.evaluarSimulador(mockSimulador, configCustom);
      // Expected: (50 * 0.5) + (100 * 0.5) = 75
      expect(resultado.nota_final).toBe(75);
    });
  });

  describe("generarMensajeMotivador", () => {
    it("should return excellent message for high scores", () => {
      expect(axiomEvaluador.generarMensajeMotivador(95)).toContain("Excelente");
      expect(axiomEvaluador.generarMensajeMotivador(85)).toContain("Excelente");
      expect(axiomEvaluador.generarMensajeMotivador(80)).toContain("Excelente");
    });

    it("should return good work message for medium-high scores", () => {
      expect(axiomEvaluador.generarMensajeMotivador(75)).toContain("Buen trabajo");
      expect(axiomEvaluador.generarMensajeMotivador(70)).toContain("Buen trabajo");
    });

    it("should return improving message for medium scores", () => {
      expect(axiomEvaluador.generarMensajeMotivador(65)).toContain("Vas bien");
      expect(axiomEvaluador.generarMensajeMotivador(60)).toContain("Vas bien");
    });

    it("should return encouraging message for low scores", () => {
      expect(axiomEvaluador.generarMensajeMotivador(50)).toContain("Siguiente");
      expect(axiomEvaluador.generarMensajeMotivador(25)).toContain("Siguiente");
      expect(axiomEvaluador.generarMensajeMotivador(0)).toContain("Siguiente");
    });

    it("should return personalized message with plan mention", () => {
      const mensaje = axiomEvaluador.generarMensajeMotivador(40);
      expect(mensaje).toContain("Plan personalizado");
    });
  });
});
