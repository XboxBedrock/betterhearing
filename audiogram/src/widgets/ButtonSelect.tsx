import { ActionIcon } from "@mantine/core"
import { IconAdjustments, IconDeviceAirpods, IconHeadphones } from "@tabler/icons-react"
import { useNavigate } from "react-router"

export function ButtonSelect() {
    const navigate = useNavigate()

    const nextPage = (deviceType: string) => {
        globalThis.deviceType = deviceType
        // Navigate to the calibration page
        navigate("/calibrate")
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
                "gap": "5rem",
                "background": "var(--mantine-color-dark-9)",
                "overflow": "hidden",
                "padding": "20px", // Added inner padding
                "-moz-box-sizing": "border-box",
                "box-sizing": "border-box"
            }}
        >
            <div
                style={{
                    color: "var(--mantine-color-dark-0)",
                    fontSize: "3rem",
                    //marginTop: "10px",
                    textAlign: "center" // Added to center text horizontally
                }}
            >
                Select your device
            </div>
            <div
                style={{
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    gap: "15vw", // Added padding for better spacing
                    alignItems: "center",
                    background: "var(--mantine-color-dark-9)",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px" // Added gap for spacing between items
                    }}
                >
                    <ActionIcon
                        variant="filled"
                        color="var(--mantine-color-dark-9)"
                        size="xl"
                        radius="xl"
                        aria-label="Settings"
                        style={{
                            width: "25vw",
                            height: "25vw",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column", // Ensure items are stacked vertically
                            gap: "10px" // Added gap to ensure vertical spacing between items
                        }}
                        onClick={() => nextPage("headphones")}
                    >
                        <IconHeadphones
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />{" "}
                        {/* Adjusted height to make space for text */}
                    </ActionIcon>
                    <div
                        style={{
                            color: "var(--mantine-primary-color-2)",
                            fontSize: "1.5rem",
                            //marginTop: "10px",
                            textAlign: "center" // Added to center text horizontally
                        }}
                    >
                        Headphones
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px" // Added gap for spacing between items
                    }}
                >
                    <ActionIcon
                        variant="filled"
                        color="var(--mantine-color-dark-9)"
                        size="xl"
                        radius="xl"
                        aria-label="Settings"
                        style={{
                            width: "25vw",
                            height: "25vw",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column", // Ensure items are stacked vertically
                            gap: "10px" // Added gap to ensure vertical spacing between items
                        }}
                        onClick={() => nextPage("earbuds")}
                    >
                        <IconDeviceAirpods
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />{" "}
                        {/* Adjusted height to make space for text */}
                    </ActionIcon>
                    <div
                        style={{
                            color: "var(--mantine-primary-color-2)",
                            fontSize: "1.5rem",
                            //marginTop: "10px",
                            textAlign: "center" // Added to center text horizontally
                        }}
                    >
                        Earbuds
                    </div>
                </div>
            </div>
        </div>
    )
}
