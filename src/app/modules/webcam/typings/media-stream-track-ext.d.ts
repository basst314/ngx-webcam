interface MediaStreamTrackExt extends MediaStreamTrack {
  getCapabilities(): MediaTrackCapabilitiesExt;
}

interface MediaTrackCapabilitiesExt extends MediaTrackCapabilities {
  torch?: boolean;
}

interface MediaTrackConstraintSet {
  aspectRatio?: ConstrainDouble;
  channelCount?: ConstrainULong;
  deviceId?: ConstrainDOMString;
  echoCancellation?: ConstrainBoolean;
  facingMode?: ConstrainDOMString;
  frameRate?: ConstrainDouble;
  groupId?: ConstrainDOMString;
  height?: ConstrainULong;
  latency?: ConstrainDouble;
  sampleRate?: ConstrainULong;
  sampleSize?: ConstrainULong;
  suppressLocalAudioPlayback?: ConstrainBoolean;
  width?: ConstrainULong;
  torch?: ConstrainBoolean;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
  advanced?: MediaTrackConstraintSet[];
}
