import { useState, useRef } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable
} from "@tanstack/react-table";

type telemetryData = {
    type: string,
    timestamp: Date,
    value: number,
};

const rawData = [
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:01", value: 23.4 },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:02", value: 31.2 },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:03", value: 28.7 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:04", value: 19.5 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:05", value: 22.1 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:06", value: 35.8 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:07", value: 41.3 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:08", value: 39.6 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:09", value: 42.0 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:10", value: 38.4 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:11", value: 0.45 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:12", value: 0.31 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:13", value: 0.78 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:14", value: 0.22 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:15", value: 0.18 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:16", value: 4.98 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:17", value: 24.1 },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:18", value: 30.8 },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:19", value: 29.3 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:20", value: 20.2 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:21", value: 21.7 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:22", value: 36.1 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:23", value: 40.9 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:24", value: 38.2 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:25", value: 43.5 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:26", value: 37.8 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:27", value: 0.47 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:28", value: 0.29 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:29", value: 0.81 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:30", value: 0.24 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:31", value: 0.17 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:32", value: 4.97 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:33", value: 23.9 },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:34", value: 32.0 },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:35", value: 27.5 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:36", value: 18.9 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:37", value: 23.4 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:38", value: 34.7 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:39", value: 42.1 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:40", value: 40.3 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:41", value: 41.7 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:42", value: 39.1 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:43", value: 0.43 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:44", value: 0.33 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:45", value: 0.76 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:46", value: 0.21 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:47", value: 0.19 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:48", value: 4.99 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:49", value: 25.0 },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:50", value: 29.5 },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:51", value: 30.1 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:52", value: 21.3 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:53", value: 20.8 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:54", value: 37.2 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:55", value: 40.5 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:56", value: 41.8 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:57", value: 40.2 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:58", value: 38.9 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:59", value: 0.46 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:00", value: 0.30 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:01", value: 0.79 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:02", value: 0.23 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:03", value: 0.16 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:04", value: 5.01 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:05", value: 22.8 },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:06", value: 31.5 },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:07", value: 28.2 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:08", value: 19.1 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:31:09", value: 22.6 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:31:10", value: 35.3 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:31:11", value: 41.6 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:31:12", value: 39.0 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:31:13", value: 42.8 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:31:14", value: 37.4 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:31:15", value: 0.44 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:16", value: 0.32 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:17", value: 0.80 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:18", value: 0.25 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:19", value: 0.20 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:20", value: 4.96 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:21", value: 24.5 },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:22", value: 30.1 },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:23", value: 29.8 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:24", value: 20.7 },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:31:25", value: 21.2 },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:31:26", value: 36.6 },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:31:27", value: 40.1 },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:31:28", value: 41.2 },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:31:29", value: 39.8 },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:31:30", value: 40.6 },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:31:31", value: 0.48 },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:32", value: 0.28 },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:33", value: 0.77 },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:34", value: 0.20 },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:35", value: 0.18 },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:36", value: 5.00 },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:37", value: 23.2 },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:38", value: 31.9 },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:39", value: 27.9 },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:40", value: 19.8 },
];

const data: telemetryData[] = rawData.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp),
}));

const columnHelper = createColumnHelper<telemetryData>();

const columns = [
    columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => info.getValue(),
        enableSorting: false,
    }),
    columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (info) => info.getValue().toLocaleString(),
        sortingFn: "datetime",
    }),
    columnHelper.accessor("value", {
        header: "Value",
        cell: (info) => info.getValue(),
        sortingFn: "basic",
    }),
];

function Telemetry() {
    const type: string = "< log >";
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    });

    return (
        <div>
            <div
                id="outline"
                className="border-2 border-[#898989] rounded-2xl py-2 px-3 h-[88vh] flex flex-col overflow-hidden"
            >
                <div id="header" className="flex flex-row w-full gap-4 items-center">
                    <span className="italic font-bold">{type}</span>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-black z-10">
                            <tr className="flex flex-row border-b-2 border-[#898989] gap-2 text-center pb-1">
                                <td className="flex flex-row justify-between pl-2 w-1/4">
                                    {table.getFlatHeaders()
                                        .filter(header => ["type", "timestamp"].includes(header.id))
                                        .map(header => (
                                            <th
                                                key={header.id}
                                                className={`font-normal text-center ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                            </th>
                                        ))}
                                </td>
                                {table.getFlatHeaders()
                                    .filter(header => header.id === "value")
                                    .map(header => (
                                        <th
                                            key={header.id}
                                            className={`flex-1 font-normal ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="flex flex-row gap-2">
                                    <td className="flex flex-row justify-between pl-2 w-1/4">
                                        {row.getVisibleCells()
                                            .filter(cell => ["type", "timestamp"].includes(cell.column.id))
                                            .map(cell => (
                                                <span key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </span>
                                            ))}
                                    </td>
                                    {row.getVisibleCells()
                                        .filter(cell => cell.column.id === "value")
                                        .map(cell => (
                                            <td key={cell.id} className="flex-1 text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Telemetry;