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
  duration: number;
  hue: number;
  events?: MediaEvent[];
}

export interface Clip {
  id: string;
  mediaId: string;
  track: TrackId;
  start: number;
  in: number;
  out: number;
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
