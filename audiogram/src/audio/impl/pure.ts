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

    private async playToneAtHL(
        freq: number,
        duration: number,
        levelHL: number,
        sampleRate = 44100
    ) {

        await Tone.start()


        await this.playToneAtHLNoStart(freq, duration, sampleRate, Tone.now())
    }

    private async playToneAtHLNoStart(
        freq: number,
        duration: number,
        sampleRate = 44100,
        startTime: number = Tone.now()
    ) {

        PureToneSupplier.fc = this.findCentre(freq)

        const ref = REFERENCE_THRESHOLDS_FREE_FIELD[PureToneSupplier.fc] || 0

        const levelDbSPL = this.levelHL + ref

        PureToneSupplier.osc = new Tone.Oscillator({
            frequency: PureToneSupplier.fc, // base pitch in Hz
            type: "sine"
        })

        PureToneSupplier.vol = new Tone.Volume({
            volume: levelDbSPL
        }).toDestination() // Connect volume node to the destination

        const now = startTime

        PureToneSupplier.osc.connect(PureToneSupplier.vol)

        PureToneSupplier.osc.toDestination()

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

        this.levelHL = levelHL
        if (PureToneSupplier.osc) PureToneSupplier.osc.stop()
        await this.playToneAtHLNoStart(freq, play, sampleRate, Tone.now())

        await Tone.start()

        PureToneSupplier.osc.start(Tone.now())
    }

    public async stopTone() {

        if (PureToneSupplier.osc) {
            console.log("Stopping oscillator")
            PureToneSupplier.osc.stop(Tone.now())
        }
    }

    public changeVolume(volume: number): void {

        this.levelHL = volume
        if (PureToneSupplier.vol) {

            const ref = REFERENCE_THRESHOLDS_FREE_FIELD[PureToneSupplier.fc] || 0 // Default to 0 if not found

            const levelDbSPL = this.levelHL + ref
            //PureToneSupplier.vol.volume.value =levelDbSPL 
            Tone.Master.volume.value = levelDbSPL
        }
    }
}
