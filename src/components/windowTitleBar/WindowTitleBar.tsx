import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import RemoveIcon from "@mui/icons-material/Remove";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import RestoreIcon from "@mui/icons-material/FilterNone";
import CloseIcon from "@mui/icons-material/Close";
import "./WindowTitleBar.css";

const window = getCurrentWindow();

function WindowTitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        window.isMaximized().then(setIsMaximized);
    }, []);

    async function minimizeWindow() {
        await window.minimize();
    }

    async function toggleMaximize() {
        await window.toggleMaximize();
        setIsMaximized(await window.isMaximized());
    }

    async function closeWindow() {
        await window.close();
    }

    return (
        <header className="window-title-bar">
            <div className="window-title">
                <span className="window-title-mark" />
                <span>Focus.exe</span>
            </div>

            <div className="window-drag-area" data-tauri-drag-region />

            <nav className="window-controls" aria-label="Contrôles de fenêtre">
                <button
                    className="window-control"
                    onClick={minimizeWindow}
                    aria-label="Réduire"
                    title="Réduire"
                >
                    <RemoveIcon fontSize="small" />
                </button>

                <button
                    className="window-control"
                    onClick={toggleMaximize}
                    aria-label={isMaximized ? "Restaurer" : "Maximiser"}
                    title={isMaximized ? "Restaurer" : "Maximiser"}
                >
                    {isMaximized ? (
                        <RestoreIcon fontSize="small" />
                    ) : (
                        <CropSquareIcon fontSize="small" />
                    )}
                </button>

                <button
                    className="window-control window-control-close"
                    onClick={closeWindow}
                    aria-label="Fermer"
                    title="Fermer"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </nav>
        </header>
    );
}

export default WindowTitleBar;