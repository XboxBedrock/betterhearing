// suppliers/ThirdOctaveWarbleToneSupplier.ts

import * as Tone from "tone"
import { ToneSupplier } from "../struct/ToneSupplier"
import { REFERENCE_THRESHOLDS_FREE_FIELD } from "../../constants/ISO3897"

export class WarbleToneSupplier extends ToneSupplier {
    private static osc: Tone.Oscillator
    private static vol: Tone.Volume
    private static fc: number
    private static panner = new Tone.Panner(0) // Centered panner for stereo output
    private static levelHL: number

    private static dbOffset: number = 115

    /** Standard 1/3-octave center frequencies (Hz) per ISO 266 / ISO 389-7 */
    private static readonly CENTRES = [
        31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
        1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000
    ]

    /** Pick the nearest 1/3-octave centre to any freq */
    private static findCentre(freq: number): number {
        return WarbleToneSupplier.CENTRES.reduce(
            (best, cf) => (Math.abs(cf - freq) < Math.abs(best - freq) ? cf : best),
            WarbleToneSupplier.CENTRES[0]
        )
    }

    private static async playToneAtHL(
        freq: number,
        duration: number,
        levelHL: number,
        sampleRate = 44100
    ) {
        // Ensure Tone.js is ready
        await Tone.start()

        // Play the tone
        await this.playToneAtHLNoStart(freq, duration, sampleRate, Tone.now())
    }

    private static async playToneAtHLNoStart(
        freq: number,
        duration: number,
        sampleRate = 44100,
        startTime: number = Tone.now()
    ) {
        // Ensure Tone.js is ready
        WarbleToneSupplier.fc = this.findCentre(freq)

        const ref = REFERENCE_THRESHOLDS_FREE_FIELD[WarbleToneSupplier.fc] || 0 // Default to 0 if not found

        // Convert levelHL to dB SPL relative to the reference threshold
        const levelDbSPL = this.levelHL + ref - WarbleToneSupplier.dbOffset // Assuming levelHL is in dB
        console.log(`Freq: ${WarbleToneSupplier.fc}Hz, HL: ${this.levelHL}dB, Ref: ${ref}dB, Offset: ${WarbleToneSupplier.dbOffset}dB, Final SPL: ${levelDbSPL}dB`)

        WarbleToneSupplier.osc = new Tone.Oscillator({
            frequency: WarbleToneSupplier.fc, // base pitch in Hz
            type: "sine"
        })

        WarbleToneSupplier.vol = new Tone.Volume({
            volume: 10 // Fixed level - master volume is adjusted via changeVolume()
        }) // Don't connect to destination here - we'll route through panner

        const now = startTime

        // Connect audio chain: Oscillator -> Volume -> Panner -> Destination
        WarbleToneSupplier.osc.connect(WarbleToneSupplier.vol)
        WarbleToneSupplier.vol.connect(WarbleToneSupplier.panner)
        WarbleToneSupplier.panner.toDestination()

        // Add warble effect: modulate frequency with an LFO

        //third octave frequency warble (calc the min and max based on the centre frequency)
        const lfo = new Tone.LFO({
            frequency: 10, // Warble frequency in Hz
            min: WarbleToneSupplier.fc / Math.pow(2, 1/6), // Minimum frequency
            max: WarbleToneSupplier.fc * Math.pow(2, 1/6) // Maximum frequency
        }).start()

        lfo.connect(WarbleToneSupplier.osc.frequency) // Connect LFO to oscillator frequency

        // Add pauses at fixed intervals with fade in and out
        const interval = 1.2; // Pause interval in seconds
        const pauseDuration = 0.6; // Duration of each pause in seconds
        const rampDuration = 0.1; // Duration of the fade in/out in seconds

        Tone.Transport.scheduleRepeat((time) => {
                WarbleToneSupplier.osc.volume.rampTo(-Infinity, rampDuration, time); // Smooth fade out
                WarbleToneSupplier.osc.volume.rampTo(10, rampDuration, time + pauseDuration - rampDuration); // Smooth fade in
        }, interval);
    }

    /** Convenience: play immediately */
    public static  async playTone(
        freq: number,
        play: number,
        br: number,
        levelHL: number,
        sampleRate = 44100
    ) {
        console.log(
            `Playing warble tone at ${freq} Hz for ${play} seconds with levelHL ${levelHL} dB SPL and sample rate ${sampleRate} Hz.`
        )
        this.levelHL = levelHL // Store the levelHL for later use
        if (WarbleToneSupplier.osc) WarbleToneSupplier.osc.stop()
        this.changeVolume(levelHL) // Update the volume based on levelHL
        await this.playToneAtHLNoStart(freq, play, sampleRate, Tone.now())

        await Tone.start()

        Tone.Transport.start() // Start the Tone.js Transport to handle scheduling
        WarbleToneSupplier.osc.start(Tone.now()) // Start the oscillator at the current time
    }

    public static async stopTone() {
        // Stop the Tone.js Transport
        if (WarbleToneSupplier.osc) // Dispose of the oscillator to free resources
            console.log("Stopping oscillator")
            WarbleToneSupplier.osc.stop(Tone.now())
            Tone.Transport.cancel() // Cancel all scheduled events
            Tone.Transport.stop() // Stop the transport

    }

    public static changeVolume(volume: number): void {
        this.levelHL = volume // Update the levelHL to reflect the new volume
        
        if (WarbleToneSupplier.vol) {
            const ref = REFERENCE_THRESHOLDS_FREE_FIELD[WarbleToneSupplier.fc] || 0 // Default to 0 if not found

            // Convert levelHL to dB SPL relative to the reference threshold
            const levelDbSPL = this.levelHL + ref - WarbleToneSupplier.dbOffset// Assuming levelHL is in dB
            Tone.Master.volume.value = levelDbSPL // Update the master volume

            console.log(`Setting volume to ${levelDbSPL} dB SPL for frequency ${WarbleToneSupplier.fc} Hz`)
        }
    }

    public static  setEar(ear: "left" | "right"): void {
        // In Tone.js Panner: -1 = left, 0 = center, 1 = right
        WarbleToneSupplier.panner.pan.value = ear === "right" ? 1 : -1;
        console.log(`Set ear to ${ear}, panner value: ${WarbleToneSupplier.panner.pan.value}`);
    }
}
