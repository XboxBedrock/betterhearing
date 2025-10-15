import { useState } from "react"
import { Burger, Container, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { MantineLogo } from "@mantinex/mantine-logo"
import classes from "./HeaderMenu.module.css"

const links = [
    { link: "/about", label: "Features" },
    { link: "/pricing", label: "Pricing" },
    { link: "/learn", label: "Learn" },
    { link: "/community", label: "Community" }
]

export function HeaderMenu() {
    const [opened, { toggle }] = useDisclosure(false)
    const [active, setActive] = useState(links[0].link)

    const items = links.map(link => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={event => {
                event.preventDefault()
                setActive(link.link)
            }}
        >
            {link.label}
        </a>
    ))

    return (
        <header className={classes.header}>
            <div
                style={{
                    width: "var(--app-shell-header-height)",
                    height: "var(--app-shell-header-height)",
                    //center it
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "calc(var(--app-shell-header-height)*0.7)"
                }}
            >
                👂
            </div>
            <div
                style={{
                    width: "auto",
                    height: "var(--app-shell-header-height)",
                    //center it
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "calc(var(--app-shell-header-height)*0.6)",
                    color: "var(--mantine-primary-color-2)"
                }}
            >
                BetterHearing
            </div>
        </header>
    )
}
