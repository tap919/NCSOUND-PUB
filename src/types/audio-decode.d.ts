declare module 'audio-decode' {
  function decode(data: Uint8Array): Promise<{
    channelData: Float32Array[];
    sampleRate: number;
    getChannelData: (ch: number) => Float32Array;
  }>;
  export default decode;
}
