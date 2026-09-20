// The four training days, transcribed from the source spreadsheet.
// This is static config, not user data — editing a plan means editing
// this file, which keeps the app free of a plan editor.

export type PlanExercise = {
  name: string;
  focus: string;
  /** Prescribed work sets. */
  sets: number;
  /** Prescribed rep range, rendered verbatim ("6-8", "—"). */
  reps: string;
  /** Rest between sets, seconds. Drives the auto-start timer. */
  rest: number;
};

export type Plan = {
  id: string;
  name: string;
  exercises: PlanExercise[];
};

export const PLANS: Plan[] = [
  {
    id: "a",
    name: "DIA A",
    exercises: [
      { name: "Crucifixo cabo alto→baixo", focus: "Peito inferior", sets: 2, reps: "6-8", rest: 75 },
      { name: "Peck deck", focus: "Peito médio", sets: 2, reps: "6-8", rest: 75 },
      { name: "Remada alta na barra T", focus: "Costas", sets: 2, reps: "6-8", rest: 75 },
      { name: "Puxada alta neutra", focus: "Costas", sets: 2, reps: "6-8", rest: 60 },
      { name: "Encolhimento com halteres", focus: "Trapézio", sets: 2, reps: "6-8", rest: 45 },
      { name: "Elevação lateral no cabo", focus: "Deltoide lateral", sets: 2, reps: "6-8", rest: 60 },
      { name: "Tríceps corda", focus: "Tríceps", sets: 2, reps: "6-8", rest: 45 },
    ],
  },
  {
    id: "b",
    name: "DIA B",
    exercises: [
      { name: "Crucifixo cabo alto→baixo", focus: "Peito inferior", sets: 2, reps: "6-8", rest: 75 },
      { name: "Peck deck", focus: "Peito médio", sets: 2, reps: "6-8", rest: 75 },
      { name: "Remada baixa pegada fechada", focus: "Costas", sets: 2, reps: "6-8", rest: 75 },
      { name: "Puxada frente supinada", focus: "Costas", sets: 2, reps: "6-8", rest: 60 },
      { name: "Elevação lateral halteres sentado", focus: "Deltoide lateral", sets: 2, reps: "6-8", rest: 60 },
      { name: "Crucifixo invertido (peck deck reverso)", focus: "Deltoide posterior", sets: 2, reps: "6-8", rest: 45 },
      { name: "Rosca martelo", focus: "Bíceps", sets: 2, reps: "6-8", rest: 45 },
    ],
  },
  {
    id: "c",
    name: "DIA C",
    exercises: [
      { name: "Hack squat", focus: "Quadríceps", sets: 3, reps: "6-8", rest: 90 },
      { name: "Cadeira extensora", focus: "Quadríceps", sets: 2, reps: "6-8", rest: 75 },
      { name: "Cadeira flexora", focus: "Posterior de coxa", sets: 4, reps: "6-8", rest: 75 },
      { name: "Panturrilha em pé", focus: "Panturrilha", sets: 3, reps: "6-8", rest: 45 },
      { name: "Abdômen", focus: "Core", sets: 3, reps: "—", rest: 45 },
      { name: "Rosca direta halteres", focus: "Bíceps", sets: 2, reps: "6-8", rest: 45 },
    ],
  },
  {
    id: "d",
    name: "DIA D",
    exercises: [
      { name: "Hack squat", focus: "Quadríceps", sets: 3, reps: "6-8", rest: 90 },
      { name: "Cadeira flexora", focus: "Posterior de coxa", sets: 4, reps: "6-8", rest: 75 },
      { name: "Panturrilha em pé", focus: "Panturrilha", sets: 3, reps: "6-8", rest: 45 },
      { name: "Abdômen", focus: "Core", sets: 3, reps: "—", rest: 45 },
      { name: "Tríceps francês", focus: "Tríceps", sets: 2, reps: "6-8", rest: 45 },
      { name: "Face pull", focus: "Deltoide posterior", sets: 2, reps: "6-8", rest: 45 },
    ],
  },
];

export function planById(id: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}
