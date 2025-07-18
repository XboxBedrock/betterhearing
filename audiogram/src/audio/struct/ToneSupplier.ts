export class ToneSupplier {
    /**
     * Plays a tone with the specified frequency, duration, and amplitude.
     * @param frequency The frequency of the tone in Hz.
     * @param duration The duration of the tone in seconds.
     * @param amplitude The amplitude of the tone in dB SPL.
     * @param sampleRate The sample rate of the audio context.
     */
    public static  playTone(
        frequency: number,
        br: number,
        play: number,
        amplitude: number,
        sampleRate: number
    ): void {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }

    public static  stopTone(): void
    {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }

    public static  changeVolume(volume: number): void
    {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }

    public static  setEar(ear: "left" | "right"): void
    {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }

    //play alternati
}
