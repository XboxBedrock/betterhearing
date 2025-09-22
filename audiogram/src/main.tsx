import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import "@mantine/core/styles.css"
import { createBrowserRouter, RouterProvider } from "react-router"
import {
    ButtonGroupSection,
    localStorageColorSchemeManager,
    MantineProvider
} from "@mantine/core"
import { createTheme } from "@mantine/core"

//gp packages
import * as tf from '@tensorflow/tfjs'
import * as sk from 'scikitjs'
sk.setBackend(tf)

import "@fontsource/manrope"
import "@fontsource/manrope/700.css"
import { AudioCalibrate } from "./widgets/AudioCalibrate.tsx"
import { HeaderMenu } from "./widgets/HeaderMenu.tsx"
import { ButtonSelect } from "./widgets/ButtonSelect.tsx"
import { AppShell } from "@mantine/core"
import { Test } from "./widgets/Test.tsx"
import { Results } from "./widgets/Results.tsx"
import '@mantine/core/styles.css';
// ‼️ import charts styles after core package styles


import '@mantine/charts/styles.css';

const theme = createTheme({
    fontFamily: "Manrope, sans-serif",
    fontFamilyMonospace: "Manrope, Courier, monospace",
    headings: { fontFamily: "Manrope, sans-serif" }
})

const router = createBrowserRouter([
    {
        path: "/",
        element: <ButtonSelect />
    },
    {
        path: "/calibrate",
        element: <AudioCalibrate />
    },
    {
        path: "/test",
        element: <Test />
    },
    {
        path: "/results",
        element: <Results />
    }
])



createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MantineProvider
            theme={theme}
            defaultColorScheme="auto"
            colorSchemeManager={localStorageColorSchemeManager({
                key: "mantine-ui-color-scheme"
            })}
        >
            <AppShell header={{ height: { base: 48, sm: 60, lg: 76 } }}>
                <AppShell.Header>
                    <HeaderMenu />
                </AppShell.Header>
                <AppShell.Main>
                    <RouterProvider router={router} />
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    </StrictMode>
)
