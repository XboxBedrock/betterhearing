import { ToneIterator } from "../struct/ToneIterator"
import { GaussianProcess1D } from "../../gp/GaussianProcess1D"

type Ear = "left" | "right"
type Tone = { frequency: number; level: number; ear: string }

export class GpToneIterator extends ToneIterator {

    private static readonly CENTRES = [
        31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
        1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000
    ]
    private static readonly ADAPTIVE_CANDIDATES = GpToneIterator.CENTRES.filter(
        f => f >= 250 && f <= 8000
    )
    private static readonly SEED = [1000, 4000, 250]


    private static readonly STOP_DB = 3 // stop when max posterior std < 3 dB
    private static readonly MIN_POINTS = 3 // min points per ear before stop
    private static readonly MAX_TESTS_PER_EAR = 5
    private static readonly SLOPE_TRIGGER = 15 // slope test trigger


    private static data: { frequency: number; level: number; ear: string }[] = []


    private static gpLeft = new GaussianProcess1D({ sigmaF: 40, ell: 0.6, sigmaN: 3 }) //1 model per ear
    private static gpRight = new GaussianProcess1D({ sigmaF: 40, ell: 0.6, sigmaN: 3 })
    private static testedLeft = new Set<number>()
    private static testedRight = new Set<number>()
    private static seedsLeftIdx = 0
    private static seedsRightIdx = 0
    private static testsLeft = 0
    private static testsRight = 0
    private static doneLeft = false
    private static doneRight = false

    private static nextEar: Ear = "left"


    public static nextTone(
        previousTone: Tone
    ): { frequency: number; ear: string } | null {

        const ear = previousTone.ear as Ear
        this.data.push({
            frequency: previousTone.frequency,
            level: previousTone.level,
            ear
        })
        this.addObs(ear, previousTone.frequency, previousTone.level)

        const nxt = this.computeNext(false)
        return nxt ? { frequency: nxt.frequency, ear: nxt.ear } : null
    }

    public static currentTone(): { frequency: number; ear: string } | null {
        const peek = this.computeNext(true)
        return peek ? { frequency: peek.frequency, ear: peek.ear } : null
    }

    public static getCollectedData(): {
        frequency: number
        level: number
        ear: string
    }[] {
        return this.data
    }


    private static addObs(ear: Ear, fHz: number, yDb: number) {
        const gp = ear === "left" ? this.gpLeft : this.gpRight
        const tested = ear === "left" ? this.testedLeft : this.testedRight

        gp.add(fHz, yDb)
        tested.add(fHz)

        if (ear === "left") this.testsLeft++
        else this.testsRight++

        const tests = ear === "left" ? this.testsLeft : this.testsRight
        if (tests >= this.MIN_POINTS) {
            const maxStd = this.maxPosteriorStd(ear)
            const tooMany = tests >= this.MAX_TESTS_PER_EAR

            if (maxStd <= this.STOP_DB) {
                if (ear === "left") this.doneLeft = true
                else this.doneRight = true
                console.log(`Stopping ${ear} ear early after ${tests} tests (uncertainty: ${maxStd.toFixed(1)} dB <= ${this.STOP_DB} dB)`)
            } else if (tooMany) {
                if (ear === "left") this.doneLeft = true
                else this.doneRight = true
                console.log(`Stopping ${ear} ear at hard cap after ${tests} tests (uncertainty: ${maxStd.toFixed(1)} dB > ${this.STOP_DB} dB)`)
            }
        }

        // Ear switching
        const other = ear === "left" ? "right" : "left"
        const thisSeeding =
            (ear === "left" ? this.seedsLeftIdx : this.seedsRightIdx) < this.SEED.length
        const otherSeeding =
            (other === "left" ? this.seedsLeftIdx : this.seedsRightIdx) < this.SEED.length
        if (!thisSeeding) {
            // Prefer to alternate if the other ear isn't done (or needs seeds)
            if (!this.isDone(other) || otherSeeding) this.nextEar = other
        }
    }

    private static isDone(ear: Ear) {
        return ear === "left" ? this.doneLeft : this.doneRight
    }
    private static getTested(ear: Ear) {
        return ear === "left" ? this.testedLeft : this.testedRight
    }
    private static getGp(ear: Ear) {
        return ear === "left" ? this.gpLeft : this.gpRight
    }

    private static computeNext(
        peekOnly: boolean
    ): { frequency: number; ear: Ear } | null {
        if (this.doneLeft && this.doneRight) return null

        let ear: Ear = this.nextEar
        if (this.isDone(ear)) ear = ear === "left" ? "right" : "left"
        if (this.isDone(ear)) return null

        //Seeding
        const seedsIdx = ear === "left" ? this.seedsLeftIdx : this.seedsRightIdx
        if (seedsIdx < this.SEED.length) {
            // pick next unused seed
            let k = seedsIdx
            while (k < this.SEED.length && this.getTested(ear).has(this.SEED[k])) k++
            if (k < this.SEED.length) {
                if (!peekOnly) {
                    if (ear === "left") this.seedsLeftIdx = k + 1
                    else this.seedsRightIdx = k + 1
                    this.nextEar = ear
                }
                return { frequency: this.SEED[k], ear }
            } else {
                // mark seeding complete
                if (!peekOnly) {
                    if (ear === "left") this.seedsLeftIdx = this.SEED.length
                    else this.seedsRightIdx = this.SEED.length
                }
            }
        }

        // Slope forced midpoint
        const mid = this.findLargeSlopeMidpoint(ear, this.SLOPE_TRIGGER)
        if (mid !== null) {
            return { frequency: mid, ear }
        }

        // argmax posterior std among unused candidates
        const gp = this.getGp(ear)
        const tested = this.getTested(ear)
        const candidates = this.ADAPTIVE_CANDIDATES.filter(f => !tested.has(f))

        // stop ear and switch
        if (candidates.length === 0) {
            if (!peekOnly) {
                if (ear === "left") this.doneLeft = true
                else this.doneRight = true
                const other = ear === "left" ? "right" : "left"
                if (!this.isDone(other)) this.nextEar = other
            }
            return this.computeNext(peekOnly)
        }

        let bestF = candidates[0],
            bestStd = -Infinity

        for (const f of candidates) {
            const { std } = gp.predictAt(f) // Predict at the candidate frequency, for std
            if (std > bestStd) {
                bestStd = std
                bestF = f
            }
        }

        // If already confident, stop this ear and go to other
        if (
            gp &&
            (ear === "left" ? this.testsLeft : this.testsRight) >= this.MIN_POINTS &&
            bestStd <= this.STOP_DB
        ) {
            if (!peekOnly) {
                if (ear === "left") this.doneLeft = true
                else this.doneRight = true
                const other = ear === "left" ? "right" : "left"
                if (!this.isDone(other)) this.nextEar = other
            }
            return this.computeNext(peekOnly)
        }

        // Commit for next round
        if (!peekOnly) {
            const other = ear === "left" ? "right" : "left"
            const otherSeeding =
                (other === "left" ? this.seedsLeftIdx : this.seedsRightIdx) <
                this.SEED.length
            if (!this.isDone(other) || otherSeeding) this.nextEar = other
        }

        return { frequency: bestF, ear }
    }

    private static maxPosteriorStd(ear: Ear): number {
        const gp = this.getGp(ear)
        let m = 0
        for (const f of this.ADAPTIVE_CANDIDATES) {
            const { std } = gp.predictAt(f)
            if (std > m) m = std
        }
        return m
    }

    // Midpoint test slope
    private static findLargeSlopeMidpoint(
        ear: Ear,
        thresholdDbPerOct: number
    ): number | null {
        const gp = this.getGp(ear)

        const pts = gp.points
            .map(o => ({ fHz: 1000 * Math.pow(2, o.xLog), yDb: o.yDb }))
            .sort((a, b) => a.fHz - b.fHz)
        if (pts.length < 2) return null

        let bestMid: number | null = null
        let bestSlope = 0

        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i],
                b = pts[i + 1]
            const dxOct = Math.abs(Math.log2(b.fHz / a.fHz))
            if (dxOct <= 0) continue
            const slope = Math.abs((b.yDb - a.yDb) / dxOct)
            if (slope > thresholdDbPerOct && slope > bestSlope) {
                const midLog = (Math.log2(a.fHz) + Math.log2(b.fHz)) / 2
                const mid = Math.pow(2, midLog)
                const snapped = this.snapToCandidates(mid)
                if (snapped !== null) {
                    bestSlope = slope
                    bestMid = snapped
                }
            }
        }
        return bestMid
    }

    private static snapToCandidates(f: number): number | null {
        let best: number | null = null
        let bd = Infinity
        for (const c of this.ADAPTIVE_CANDIDATES) {
            const d = Math.abs(Math.log2(c / f))
            if (d < bd) {
                bd = d
                best = c
            }
        }
        return best
    }
}
