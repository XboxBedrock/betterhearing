import { ActionIcon, Button } from "@mantine/core"
import {
    IconAdjustments,
    IconDeviceAirpods,
    IconEar,
    IconHeadphones
} from "@tabler/icons-react"
import { useState, useRef, useEffect } from "react" 
import { useNavigate } from "react-router"

export function AudioCalibrate() {
    const [calibrationClicked, setCalibrationClicked] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const navigate = useNavigate() 


    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {

        audioRef.current = new Audio("/calibrate.ogg")
        return () => {
            if (audioRef.current) {
                try {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                    audioRef.current.onended = null
                } catch (e) {
                    // ignore
                }
            }
        }
    }, [])

    const handlePlayAudio = () => {
        const audio = audioRef.current
        if (!audio) return
        setIsPlaying(true)
        audio.play()
        audio.onended = () => setIsPlaying(false)
        setCalibrationClicked(true)
    }

    const stopAudio = () => {
        const audio = audioRef.current
        if (!audio) return
        try {
            audio.pause()
            audio.currentTime = 0
            audio.onended = null
        } catch (e) {
            // ignore
        }
        setIsPlaying(false)
    }

    const handleNext = () => {
        if (calibrationClicked) {
            // stop any playing calibration audio before navigating
            stopAudio()
            navigate("/test") 
        }
    }

    const handleCalibration = () => {
        // Add your calibration logic here
        console.log("Calibration button clicked")
    }

    return (
        <div
            style={{
                "width": "100vw",
                "height": "calc(100vh - var(--app-shell-header-height))", 
                "display": "flex",
                "flexDirection": "column",
                "alignItems": "center",
                "justifyContent": "top",
                "background": "var(--mantine-color-dark-9)",
                "paddingLeft": "56px",
                "paddingRight": "56px",
                //@ts-expect-error for some reason ts dosen't like firefox....
                "-moz-box-sizing": "border-box",
                "box-sizing": "border-box"
                // Added to allow scrolling if content overflows
            }}
        >
            <div
                style={{
                    color: "var(--mantine-color-dark-0)",
                    fontSize: "3rem",
                    marginTop: "2rem",
                    textAlign: "center" 
                }}
            >
                Calibrate
            </div>
            <div
                style={{
                    color: "var(--mantine-primary-color-2)",
                    //make 2vh on mobile but 1.5rem on desktop
                    fontSize: "2vh",
                    //marginTop: "10px",
                    textAlign: "left",
                    width: "70vw"
                }}
            >
                Listen to the calibration file. Then, without headphones, rub your hands
                together closely in front of your nose, quickly and firmly, and try
                producing the same sound. Adjust your computer's volume so that the
                calibration file and your hands rubbing (without headphones) have similar
                volume. Once matched, do not change your volume during the rest of the
                hearing test.
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    marginTop: "2rem"
                }}
            >
                <Button
                    onClick={handlePlayAudio}
                    color="blue"
                    disabled={isPlaying}
                    variant="outline"
                >
                    Play Audio
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!calibrationClicked}
                    color="gray"
                    variant="outline"
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
