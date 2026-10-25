export type TrackId = "V1" | "A1";
export type Tool = "select" | "razor";

export interface MediaEvent {
  from: number;
  to: number;
  label: string;
}

export interface Media {
  id: string;
  name: string;
  /** durata del file sorgente in secondi */
  duration: number;
  /** tinta usata per generare il video sintetico nel monitor */
  hue: number;
  /** momenti notevoli del sorgente (es. una papera), visibili nel monitor */
  events?: MediaEvent[];
}

export interface Clip {
  id: string;
  mediaId: string;
  track: TrackId;
  /** posizione in timeline (s) */
  start: number;
  /** punto di attacco nel sorgente (s) */
  in: number;
  /** punto di stacco nel sorgente (s) */
  out: number;
  /** clip collegate (video + audio) condividono lo stesso linkId */
  linkId?: string;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
}

export interface Sequence {
  name: string;
  fps: number;
  media: Media[];
  clips: Clip[];
  markers: Marker[];
}
