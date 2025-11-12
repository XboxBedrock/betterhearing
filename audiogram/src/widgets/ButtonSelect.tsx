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
                "padding": "20px", 
                //@ts-expect-error for some reason ts dosen't like firefox....
                "-moz-box-sizing": "border-box",
                "box-sizing": "border-box"
            }}
        >
            <div
                style={{
                    color: "var(--mantine-color-dark-0)",
                    fontSize: "3rem",
                    //marginTop: "10px",
                    textAlign: "center" 
                }}
            >
                Select your device
            </div>
            <div
                style={{
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    gap: "15vw", 
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
                        gap: "20px" 
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
                            flexDirection: "column",
                            gap: "10px"
                        }}
                        onClick={() => nextPage("headphones")}
                    >
                        <IconHeadphones
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />{" "}
                    </ActionIcon>
                    <div
                        style={{
                            color: "var(--mantine-primary-color-2)",
                            fontSize: "1.5rem",
                            //marginTop: "10px",
                            textAlign: "center"
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
                        gap: "20px"
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
                            flexDirection: "column",
                            gap: "10px"
                        }}
                        onClick={() => nextPage("earbuds")}
                    >
                        <IconDeviceAirpods
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />{" "}
                    </ActionIcon>
                    <div
                        style={{
                            color: "var(--mantine-primary-color-2)",
                            fontSize: "1.5rem",
                            //marginTop: "10px",
                            textAlign: "center"
                        }}
                    >
                        Earbuds
                    </div>
                </div>
            </div>
        </div>
    )
}
