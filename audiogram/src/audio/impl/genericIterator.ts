import { ToneIterator } from "../struct/ToneIterator";

//define an abstract class that extends iterator, giving the next tone based on the previous one, it should also have a store of frequencies and levels collected so far, incuding the ear
export class GenericToneIterator extends ToneIterator {

    private static readonly CENTRES = [
        31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000,
        1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000
    ]

    private static frequencyQueue: {frequency: number, ear: string}[] = [];

    private static data: { frequency: number; level: number; ear: string }[] = [];

    static {
        this.frequencyQueue = GenericToneIterator.CENTRES.map(frequency => ({ frequency, ear: "left" }));
        this.frequencyQueue.push(...GenericToneIterator.CENTRES.map(frequency => ({ frequency, ear: "right" })));
    }



    public static nextTone(previousTone: { frequency: number; level: number; ear: string }): { frequency: number; ear: string } | null {
        this.data.push(previousTone);
        if (this.frequencyQueue.length === 0) return null;
        const nextTone = this.frequencyQueue.shift();
        if (!nextTone) return null;

        return nextTone;
    }

    public static currentTone(): { frequency: number; ear: string } | null {
        if (this.frequencyQueue.length === 0) return null;
        return this.frequencyQueue[0];
    }

    public static getCollectedData(): { frequency: number; level: number; ear: string }[] {

        return this.data;

    }
}