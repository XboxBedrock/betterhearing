import * as Tone from "tone"
import { ToneSupplier } from "../struct/ToneSupplier"
import { REFERENCE_THRESHOLDS_FREE_FIELD } from "../../constants/ISO3897"


export class PureToneSupplier extends ToneSupplier {
    private static osc: Tone.Oscillator
    private static vol: Tone.Volume
    private static fc: number

    private levelHL: number

    private static readonly CENTRES = [
        31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
        1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000
    ]

    private findCentre(freq: number): number {
        return PureToneSupplier.CENTRES.reduce(
            (best, cf) => (Math.abs(cf - freq) < Math.abs(best - freq) ? cf : best),
            PureToneSupplier.CENTRES[0]
        )
    }

    //@ts-expect-error will use later
    private async playToneAtHL(
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

    private async playToneAtHLNoStart(
        freq: number,
        duration: number,
        //@ts-expect-error will use later
        sampleRate = 44100,
        startTime: number = Tone.now()
    ) {
        // Ensure Tone.js is ready
        PureToneSupplier.fc = this.findCentre(freq)

        const ref = REFERENCE_THRESHOLDS_FREE_FIELD[PureToneSupplier.fc] || 0 // Default to 0 if not found

        // Convert levelHL to dB SPL relative to the reference threshold
        const levelDbSPL = this.levelHL + ref // Assuming levelHL is in dB

        PureToneSupplier.osc = new Tone.Oscillator({
            frequency: PureToneSupplier.fc, // base pitch in Hz
            type: "sine"
        })

        PureToneSupplier.vol = new Tone.Volume({
            volume: levelDbSPL // Set the volume to the calculated dB SPL
        }).toDestination() // Connect the volume node to the destination

        const now = startTime

        PureToneSupplier.osc.connect(PureToneSupplier.vol) // Connect the oscillator to the volume node

        PureToneSupplier.osc.toDestination()

        //make it so theres an oscilating fade in and out
    }


    public async playTone(
        freq: number,
        play: number,
        br: number,
        levelHL: number,
        sampleRate = 44100
    ) {
        console.log(
            `Playing pure tone at ${freq} Hz for ${play} seconds with levelHL ${levelHL} dB SPL and sample rate ${sampleRate} Hz.`
        )
        //const buffer = await this.getToneAtHL(freq, duration, levelHL, sampleRate);
        //const src = this.audioContext.createBufferSource();
        //src.buffer = buffer;
        //src.connect(this.audioContext.destination);
        //src.start();

        this.levelHL = levelHL // Store the levelHL for later use
        if (PureToneSupplier.osc) PureToneSupplier.osc.stop()
        await this.playToneAtHLNoStart(freq, play, sampleRate, Tone.now())

        await Tone.start()
    
        PureToneSupplier.osc.start(Tone.now()) // Start the oscillator at the current time
    }

    public async stopTone() {
        // Stop the Tone.js Transport
        if (PureToneSupplier.osc)// Dispose of the oscillator to free resources
            console.log("Stopping oscillator")
            PureToneSupplier.osc.stop(Tone.now())
    }

    public changeVolume(volume: number): void {
        // Change the volume of the oscillator
        // This is a placeholder as Tone.js handles volume differently
        // You might need to adjust the volume of the destination or the oscillator directly

        this.levelHL = volume // Update the levelHL to reflect the new volume
        if (PureToneSupplier.vol) {

            const ref = REFERENCE_THRESHOLDS_FREE_FIELD[PureToneSupplier.fc] || 0 // Default to 0 if not found

            // Convert levelHL to dB SPL relative to the reference threshold
            const levelDbSPL = this.levelHL + ref // Assuming levelHL is in dB
            //PureToneSupplier.vol.volume.value =levelDbSPL // Update the volume node's volume
            Tone.Master.volume.value = levelDbSPL // Update the master volume
        } // Update the oscillator's volume
    }
}
