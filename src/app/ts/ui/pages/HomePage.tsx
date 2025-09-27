import React, { useState } from "react";
import { Visualizer } from "../organisms/home";
import { DialogsPanel } from "../organisms/home";
import { observer } from "mobx-react-lite";

interface HomePageProps {
    mode: string;
    systemReady?: boolean;
}

const HomePage: React.FC<HomePageProps> = observer(({ mode, systemReady }) => {

    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    return (
        <div>
            <Visualizer mode={mode} systemReady={systemReady} />
            <DialogsPanel
                isVisible={isHistoryVisible}
                onToggle={() => setIsHistoryVisible(!isHistoryVisible)}
                isDropdownVisible={true}
            />
        </div>
    )
});

export { HomePage };