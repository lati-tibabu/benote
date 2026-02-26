export const DEFAULT_DARK_READER_PRESET_ID = "balanced";

export const DARK_READER_PRESETS = [
  {
    id: "balanced",
    name: "Balanced",
    description: "Default neutral dark mode for everyday use.",
    settings: {
      brightness: 100,
      contrast: 90,
      sepia: 10,
    },
  },
  {
    id: "soft-night",
    name: "Soft Night",
    description: "Lower contrast and warmer tone for late sessions.",
    settings: {
      brightness: 95,
      contrast: 85,
      sepia: 20,
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Sharper text and stronger separation.",
    settings: {
      brightness: 105,
      contrast: 115,
      sepia: 0,
    },
  },
  {
    id: "warm-paper",
    name: "Warm Paper",
    description: "Paper-like warm tint with softer whites.",
    settings: {
      brightness: 92,
      contrast: 88,
      sepia: 35,
    },
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    description: "Darker palette tuned for concentration.",
    settings: {
      brightness: 85,
      contrast: 95,
      sepia: 5,
    },
  },
];

