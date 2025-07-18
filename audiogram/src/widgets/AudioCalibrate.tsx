import { ActionIcon, Button } from "@mantine/core"
import {
    IconAdjustments,
    IconDeviceAirpods,
    IconEar,
    IconHeadphones
} from "@tabler/icons-react"
import { useState } from "react" // Added import for navigation
import { useNavigate } from "react-router"

export function AudioCalibrate() {
    const [calibrationClicked, setCalibrationClicked] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const navigate = useNavigate() // Added navigation hook
    const audio = new Audio("calibrate.ogg")

    const handlePlayAudio = () => {
        // Updated path to match the correct location
        setIsPlaying(true)
        audio.play()
        audio.onended = () => setIsPlaying(false) // Enable button after audio ends
        setCalibrationClicked(true)
    }

    const handleNext = () => {
        if (calibrationClicked) {
            navigate("/test") // Navigate to "/test" when Next button is clicked
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
                "height": "calc(100vh - var(--app-shell-header-height))", // Adjusted height to fill the remaining space below the header
                "display": "flex",
                "flexDirection": "column",
                "alignItems": "center",
                "justifyContent": "top",
                "background": "var(--mantine-color-dark-9)",
                "paddingLeft": "56px", // Added left inner padding
                "paddingRight": "56px", // Added right inner padding
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
                    textAlign: "center" // Added to center text horizontally
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
                    textAlign: "left", // Added to center text horizontally
                    width: "70vw" // Added width to limit text width
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
