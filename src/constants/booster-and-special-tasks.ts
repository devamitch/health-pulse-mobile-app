export const BoosterTask = {
  WATER_GLASS: { points: 5, category: 'diet', label: "Hydration Hit" },
  PROTEIN_FIRST: { points: 10, category: 'diet', label: "Ate Protein First" },
  VEGGIE_SIDE: { points: 10, category: 'diet', label: "Green Boost" },
  NO_SUGAR_WINDOW: { points: 15, category: 'diet', label: "4h Sugar Free" },

  SQUATS_20: { points: 5, category: 'activity', label: "20 Air Squats" },
  PLANK_1MIN: { points: 8, category: 'activity', label: "Core Fire" },
  STAIRS_FLIGHT: { points: 5, category: 'activity', label: "Took the Stairs" },
  WALK_15MIN: { points: 15, category: 'activity', label: "Brisk Walk" },

  BOX_BREATHING: { points: 10, category: 'stress', label: "2m Box Breathing" },
  DIGITAL_DETOX: { points: 15, category: 'stress', label: "1h No Screen" },
  GRATITUDE_LOG: { points: 10, category: 'stress', label: "Journaling" },
} as const;

export type BoosterKey = keyof typeof BoosterTask;

export type BoosterCategory = (typeof BoosterTask)[keyof typeof BoosterTask]['category'];
