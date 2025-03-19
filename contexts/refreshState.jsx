import { createContext, useState } from "react";

export const RefreshStateContext = createContext()

export default function RefreshContext({children}) {
    const [refresh, setRefresh] = useState([])

    return <RefreshStateContext.Provider value={{ refresh, setRefresh }}>
        {children}
    </RefreshStateContext.Provider>
}