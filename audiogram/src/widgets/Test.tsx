import { ActionIcon, Button } from "@mantine/core"
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconMinus,
    IconPlus
} from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { WarbleToneSupplier } from "../audio/impl/warble"
import { GpToneIterator } from "../audio/impl/GpToneIterator"

export function Test() {
    const [volume, setVolume] = useState(0)
    const [frequency, setFrequency] = useState(GpToneIterator.currentTone()?.frequency ?? 0) 
    const [whichEar, setWhichEar] = useState(GpToneIterator.currentTone()?.ear ?? "right") 
    const [isPlaying, setIsPlaying] = useState(true) // playing by default
    const [hasAdjustedVolume, setHasAdjustedVolume] = useState(false)
    const navigate = useNavigate()
    
    // Check for debug flag
    const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true'

    const player = WarbleToneSupplier

    useEffect(() => {
        player.stopTone() 

        player.playTone(frequency, 0.5, 0.3, volume, 50)
        player.setEar(whichEar as ('left' | "right"))
        setIsPlaying(true)
        //stop on dismount
        return () => {
            player.stopTone() 
        }
    }, [frequency]) 

    useEffect(() => {
        if (isPlaying) {

            player.stopTone()
            player.playTone(frequency, 0.5, 0.3, volume, 50)
            player.setEar(whichEar as ('left' | "right"))
        }
    }, [volume])

    useEffect(() => {
        if (isPlaying) {
            player.stopTone()
            player.playTone(frequency, 0.5, 0.3, volume, 50)
            player.setEar(whichEar as ('left' | "right"))
        }
    }, [whichEar])

    const togglePlayPause = () => {
        if (isPlaying) {
            player.stopTone()
            setIsPlaying(false)
        } else {
            // stop any existing tone
            player.stopTone()
            player.playTone(frequency, 0.5, 0.3, volume, 50)
            player.setEar(whichEar as ('left' | "right"))
            setIsPlaying(true)
        }
    }

    const handleNext = () => {
        GpToneIterator.nextTone({
            frequency: frequency,
            level: volume,
            ear: whichEar
        })

        const nextTone = GpToneIterator.currentTone();

        if (nextTone) {
            setFrequency(nextTone.frequency)
            setWhichEar(nextTone.ear)
            setVolume(0) // reset volume for next tone
            setHasAdjustedVolume(false)
            player.playTone(nextTone.frequency, 0.5, 0.3, 0, 50)
        } else {
            // no more tones available, collect all data and navigate to results page
            const collectedData = GpToneIterator.getCollectedData()
            console.log("No more tones available", collectedData)
            
            // encode the data as URL parameters
            const dataParam = encodeURIComponent(JSON.stringify(collectedData))
            navigate(`/results?data=${dataParam}`)
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
                "boxSizing": "border-box"
            }}
        >
            <span
                style={{
                    fontSize: "2rem",
                    color: "var(--mantine-color-primary-2)",
                    marginBottom: "40px"
                }}
            >
                {frequency + "Hz - " + whichEar.substring(0, 1).toUpperCase() + whichEar.substring(1) + " Ear"}
            </span>
            
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "60px",
                    marginBottom: "40px"
                }}
            >
                <ActionIcon
                    variant="outline"
                    color="var(--mantine-color-dark-0)"
                    size={80}
                    radius="xl"
                    onClick={() => {
                        setVolume(prev => Math.max(prev - 5, -400))
                        setHasAdjustedVolume(true)
                    }}
                    aria-label="Decrease volume"
                >
                    <IconMinus size={40} stroke={1.5} />
                </ActionIcon>

                <ActionIcon
                    variant="filled"
                    color="blue"
                    size={120}
                    radius="xl"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                    }}
                >
                    {isPlaying ? (
                        <IconPlayerPause size={60} stroke={1.5} />
                    ) : (
                        <IconPlayerPlay size={60} stroke={1.5} />
                    )}
                </ActionIcon>

                <ActionIcon
                    variant="outline"
                    color="var(--mantine-color-dark-0)"
                    size={80}
                    radius="xl"
                    onClick={() => {
                        setVolume(prev => Math.min(prev + 5, 100))
                        setHasAdjustedVolume(true)
                    }}
                    aria-label="Increase volume"
                >
                    <IconPlus size={40} stroke={1.5} />
                </ActionIcon>
            </div>
            
            {isDebugMode && (
                <div
                    style={{
                        fontSize: "1.2rem",
                        color: "var(--mantine-color-red-5)",
                        textAlign: "center",
                        marginBottom: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Debug: Volume Level {volume} dB
                </div>
            )}
            
            <p
                style={{
                    fontSize: "1rem",
                    color: "var(--mantine-color-primary-2)",
                    textAlign: "center",
                    maxWidth: "400px"
                }}
            >
                Press play to start the tone, then adjust the volume until you can just barely hear it
            </p>
            <Button
                variant="outline"
                color="blue"
                size="lg"
                disabled={!hasAdjustedVolume}
                style={{ 
                    marginTop: "20px",
                    minWidth: "150px",
                    height: "50px",
                    fontSize: "1.1rem"
                }}
                onClick={handleNext}
            >
                Next Tone
            </Button>
        </div>
    )
}
