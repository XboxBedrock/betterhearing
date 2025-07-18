//define an abstract class that extends iterator, giving the next tone based on the previous one, it should also have a store of frequencies and levels collected so far, incuding the ear
export class ToneIterator {

    public static nextTone(previousTone: { frequency: number; level: number; ear: string }): { frequency: number; ear: string } | null {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }

    public static currentTone(): { frequency: number; ear: string } | null {
        // This method should be implemented in subclasses 
        throw new Error("Method not implemented.");
    }

    public static getCollectedData(): { frequency: number; level: number; ear: string }[] {
        // This method should be implemented in subclasses
        throw new Error("Method not implemented.");
    }
}