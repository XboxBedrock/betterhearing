import { ActionIcon, Button } from "@mantine/core"
import {
    IconAdjustments,
    IconDeviceAirpods,
    IconEar,
    IconHeadphones,
    IconWaveSine
} from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { WarbleToneSupplier } from "../audio/impl/warble"
import { PureToneSupplier } from "../audio/impl/pure"
import * as Tone from "tone"
import { GenericToneIterator } from "../audio/impl/genericIterator"

export function Test() {
    const [volume, setVolume] = useState(0)
    const [frequency, setFrequency] = useState(GenericToneIterator.currentTone()?.frequency ?? 0) // Default frequency for A4
    const [whichEar, setWhichEar] = useState(GenericToneIterator.currentTone()?.ear ?? "right") // Default ear selection
    const navigate = useNavigate()

    const player = WarbleToneSupplier

    useEffect(() => {
        player.stopTone() 

        player.playTone(frequency, 0.5, 0.3, volume, 50) // Adjusted to use volume state
            player.setEar(whichEar as ('left' | "right")) // Set initial ear selection
        //stop on dismount
        return () => {
            player.stopTone() // Stop the tone when the component unmounts
        }
    }, [frequency]) // Re-run effect when volume changes

    useEffect(() => {
        player.changeVolume(volume) // Update player volume when state changes
    }, [volume]) // Dependency array to re-run effect when volume changes

    useEffect(() => {
        player.setEar(whichEar as ('left' | "right")) // Update player ear selection when state changes
    }, [whichEar]) // Dependency array to re-run effect when whichEar changes

    const handleNext = () => {
        GenericToneIterator.nextTone({
            frequency: frequency,
            level: volume,
            ear: whichEar
        })

        const nextTone = GenericToneIterator.currentTone();

        if (nextTone) {
            setFrequency(nextTone.frequency)
            setWhichEar(nextTone.ear)
            setVolume(0) // Reset volume for the next tone
            player.playTone(nextTone.frequency, 0.5, 0.3, 0, 50) // Play the next tone with reset volume
        } else {
            // No more tones available, handle accordingly (e.g., navigate to results page)
            console.log("No more tones available")
            navigate("/results") // Navigate to results page
        }
    }

    return (
        <div
            style={{
                "width": "100vw",
                "height": "calc(100vh - var(--app-shell-header-height))",
                "display": "flex",
                "flexDirection": "column",
                "alignItems": "center",
                "justifyContent": "center",
                "background": "var(--mantine-color-dark-9)",
                "paddingLeft": "56px",
                "paddingRight": "56px",
                "-moz-box-sizing": "border-box",
                "box-sizing": "border-box"
            }}
        >
            <span
                style={{
                    fontSize: "2rem",
                    color: "var(--mantine-color-primary-2)"
                }}
            >
                {frequency + "Hz - " + whichEar.substring(0, 1).toUpperCase() + whichEar.substring(1) + " Ear"}
            </span>
            <ActionIcon
                variant="outline"
                color="var(--mantine-color-dark-0)"
                size="xl"
                radius="xl"
                aria-label="Settings"
                style={{
                    width: "50vw",
                    height: "50vw",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >
                <IconWaveSine style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "20px",
                    gap: "20px"
                }}
            >
                <Button
                    variant="outline"
                    color="var(--mantine-color-dark-0)"
                    onClick={() => setVolume(prev => Math.max(prev - 1, -400))} // Decrease volume
                >
                    {"<"}
                </Button>
                <span
                    style={{
                        fontSize: "1.5rem",
                        color: "var(--mantine-color-dark-0)"
                    }}
                >
                    {volume}
                </span>
                <Button
                    variant="outline"
                    color="var(--mantine-color-dark-0)"
                    onClick={() => setVolume(prev => Math.min(prev + 1, 100))} // Increase volume
                >
                    {">"}
                </Button>
            </div>
            <p
                style={{
                    marginTop: "10px",
                    fontSize: "1rem",
                    color: "var(--mantine-color-primary-2)",
                    textAlign: "center"
                }}
            >
                Increase the volume until you can hear the tone
            </p>
            <Button
                variant="outline"
                color="blue"
                style={{ marginTop: "20px" }}
                onClick={handleNext}
            >
                Next Tone
            </Button>
        </div>
    )
}
