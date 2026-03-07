import { useState } from "react";
import FilterDropdown from "../components/ui/filter"

function Telemetry() {
    const [type, setType] = useState("< Logs >");    

    return (
        <div>
            <div 
                id="outline"
                className="border-2 border-[#898989] rounded-2xl py-2 px-3 h-[88vh] flex flex-col"
            >
                <div id="header" className="flex flex-row w-full gap-4 items-center">
                    <span className="italic font-bold">{type}</span>
                    <form className="flex flex-row gap-4">
                        <input 
                            type="text" 
                            placeholder="Search"
                            className="border-2 border-[#898989] rounded-2xl px-5 italic text-sm italic font-bold"
                        />
                    </form>
                    <FilterDropdown />
                </div>
            </div>
        </div>
    )
}

export default Telemetry;