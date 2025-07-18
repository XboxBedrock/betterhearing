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
import { LineChart } from '@mantine/charts';
import { GenericToneIterator } from "../audio/impl/genericIterator"

export function Results() {
    const navigate = useNavigate()

    const [data, setData] = useState<{ frequency: string; left: number | null; right: number | null}[]>([])

    const player = WarbleToneSupplier

    useEffect(() => {
        player.stopTone() 
        Tone.Transport.stop() // Stop the Tone.js transport to ensure no tones are playing
        //set tonejs volume to 0
        Tone.Master.volume.value = -Infinity // Mute the master volume to stop any sound

        console.log("Collected Data:", GenericToneIterator.getCollectedData())

        //merge entries with the same frequency
        let mergedData: { frequency: number; left: number | null; right: number | null }[] = []


        GenericToneIterator.getCollectedData().forEach((item) => {
            const existing = mergedData.find(d => d.frequency === item.frequency)
            if (existing) {
                existing[item.ear as ('left' | 'right')] = item.level
            } else {
                mergedData.push({
                    frequency: item.frequency,
                    left: item.ear === "left" ? item.level : null,
                    right: item.ear === "right" ? item.level : null
                })
            }
        })

        const finalData = mergedData.map((item) => {

            let frequency = item.frequency;

            let newFrequency = frequency.toString();

            if (frequency >= 1000) {
                frequency = (frequency / 1000)
                if (frequency % 1 === 0) {
                    newFrequency = frequency.toFixed(0) + 'K' // Convert to integer if no decimal part
                } else {
                    newFrequency = frequency.toFixed(1) + ' K'; // Append 'kHz' for frequencies greater than 1000 Hz
                }

                
            }// Convert to kHz if greater than 1000 Hz
            return {
                frequency: newFrequency, // Convert frequency to kHz if greater than 1000 Hz
                left: item.left !== null ? item.left : -10, // Default value for missing left ear data
                right: item.right !== null ? item.right : -10 // Default value for missing right ear data
            }
        })



        setData(finalData);

    }, []) // Re-run effect when volume changes



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
                Results
            </span>
                <LineChart
                    h="70vh"
                    data={data}
                    dataKey="frequency"
                    yAxisProps={{domain: [-10, 80], reversed: true, tickCount: 10}}
                    xAxisProps={{orientation: 'top'}}
                    series={[
                        { name: 'left', color: 'indigo.6' },
                        { name: 'right', color: 'blue.6' },
                    ]}
                    curveType="linear"
                    />
        </div>
    )
}
