import { Spectral, Instrument_Serif } from "next/font/google";

export const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["200"],
  style: "italic",
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const instrumentSerifItalic = Instrument_Serif({
  variable: "--font-instrument-serif-italic",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});
