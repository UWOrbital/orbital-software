import { useEffect } from "react";
import FilterDropdown from "../components/ui/filter"
import { createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import React from "react";
import Table from "@/components/Table";

function Telemetry() {
    let type : string = "< log >"; 

    type telemetryData = {
        date: string,
        session: string,
        category: string,
        telemetry: string,
        details?: telemetryData[]
    };

    const data: telemetryData[] = [
        {
            date: "01/01/2000",
            session: "Session 1",
            category: "Sensors",
            telemetry: "data",
        },
    ];

    const columnHelper = createColumnHelper<telemetryData>();

    const columns = [
        columnHelper.accessor("session", {
            header: "Session",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("date", {
            header: "Date",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("category", {
            header: "Category",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("telemetry", {
            header: "Telemetry",
            cell: (info) => info.getValue(),
        }),
    ];

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.details,
    });

    return (
    <div>
        <div
        id="outline"
        className="border-2 border-[#898989] rounded-2xl py-2 px-3 h-[88vh] flex flex-col"
        >
            <div id="header" className="flex flex-row w-full gap-4 items-center">
                <span className="italic font-bold">{type}</span>
            </div>
            <Table data={data} columns={columns} showFilters={true} />  
        </div>
    </div>
    )
}

export default Telemetry;