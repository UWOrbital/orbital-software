import { useState, useRef, useEffect } from "react";
import {
    createColumnHelper,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable
} from "@tanstack/react-table";

type telemetryData = {
    type?: string,
    timestamp?: Date,
    value?: number,
    id?: number,
    session?: string,
    packet?: string,
    obc_state?: string,
    epc_state?: string,
    subRows?: telemetryData[],
};

const rawData = [
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:01", value: 23.4, subRows: [{ id: 1, session: "Session 3", packet: "0xA3F2B1C4", obc_state: "Sent", epc_state: "Received" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:02", value: 31.2, subRows: [{ id: 1, session: "Session 1", packet: "0xBB903412", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:03", value: 28.7, subRows: [{ id: 1, session: "Session 2", packet: "0xC4819D0E", obc_state: "Received", epc_state: "Received" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:04", value: 19.5, subRows: [{ id: 1, session: "Session 4", packet: "0xE1092CF7", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:05", value: 22.1, subRows: [{ id: 1, session: "Session 8", packet: "0xFA23C501", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:06", value: 35.8, subRows: [{ id: 1, session: "Session 10", packet: "0x1C4A8B2F", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:07", value: 41.3, subRows: [{ id: 1, session: "Session 5", packet: "0x77F1C230", obc_state: "Failed", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:08", value: 39.6, subRows: [{ id: 1, session: "Session 7", packet: "0x12DE4F89", obc_state: "Received", epc_state: "Received" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:09", value: 42.0, subRows: [{ id: 1, session: "Session 9", packet: "0x5A3BF210", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:10", value: 38.4, subRows: [{ id: 1, session: "Session 6", packet: "0x309A1BDE", obc_state: "Pending", epc_state: "Received" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:11", value: 0.45, subRows: [{ id: 1, session: "Session 2", packet: "0x6D71E390", obc_state: "Received", epc_state: "Failed" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:12", value: 0.31, subRows: [{ id: 1, session: "Session 4", packet: "0xD8902F3A", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:13", value: 0.78, subRows: [{ id: 1, session: "Session 1", packet: "0x4F21A8C0", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:14", value: 0.22, subRows: [{ id: 1, session: "Session 10", packet: "0xB3E17D52", obc_state: "Failed", epc_state: "Received" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:15", value: 0.18, subRows: [{ id: 1, session: "Session 3", packet: "0x91C4F0AB", obc_state: "Received", epc_state: "Sent" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:16", value: 4.98, subRows: [{ id: 1, session: "Session 8", packet: "0x2E83B41D", obc_state: "Sent", epc_state: "Received" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:17", value: 24.1, subRows: [{ id: 1, session: "Session 6", packet: "0xC71D390F", obc_state: "Pending", epc_state: "Failed" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:18", value: 30.8, subRows: [{ id: 1, session: "Session 5", packet: "0x83AF2E10", obc_state: "Failed", epc_state: "Pending" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:19", value: 29.3, subRows: [{ id: 1, session: "Session 7", packet: "0x409D1CB3", obc_state: "Received", epc_state: "Received" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:20", value: 20.2, subRows: [{ id: 1, session: "Session 9", packet: "0xF12E5A08", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:21", value: 21.7, subRows: [{ id: 1, session: "Session 2", packet: "0x7B3C91D4", obc_state: "Pending", epc_state: "Received" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:22", value: 36.1, subRows: [{ id: 1, session: "Session 10", packet: "0xE04F2B87", obc_state: "Failed", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:23", value: 40.9, subRows: [{ id: 1, session: "Session 1", packet: "0x3D8A0CF5", obc_state: "Received", epc_state: "Failed" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:24", value: 38.2, subRows: [{ id: 1, session: "Session 4", packet: "0xA91B7E32", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:25", value: 43.5, subRows: [{ id: 1, session: "Session 6", packet: "0x5C0D3F1A", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:26", value: 37.8, subRows: [{ id: 1, session: "Session 3", packet: "0x18E7B24C", obc_state: "Received", epc_state: "Received" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:27", value: 0.47, subRows: [{ id: 1, session: "Session 8", packet: "0xD30F91AE", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:28", value: 0.29, subRows: [{ id: 1, session: "Session 5", packet: "0x624C8B0D", obc_state: "Sent", epc_state: "Received" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:29", value: 0.81, subRows: [{ id: 1, session: "Session 7", packet: "0xB07A3E51", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:30", value: 0.24, subRows: [{ id: 1, session: "Session 9", packet: "0x4E1D8CF2", obc_state: "Received", epc_state: "Sent" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:31", value: 0.17, subRows: [{ id: 1, session: "Session 2", packet: "0x93B50A7F", obc_state: "Failed", epc_state: "Received" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:32", value: 4.97, subRows: [{ id: 1, session: "Session 10", packet: "0x271FD4C8", obc_state: "Sent", epc_state: "Failed" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:33", value: 23.9, subRows: [{ id: 1, session: "Session 1", packet: "0xF48E2B03", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:34", value: 32.0, subRows: [{ id: 1, session: "Session 4", packet: "0x6A9C17D0", obc_state: "Received", epc_state: "Sent" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:35", value: 27.5, subRows: [{ id: 1, session: "Session 6", packet: "0xC25B8E4F", obc_state: "Sent", epc_state: "Received" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:36", value: 18.9, subRows: [{ id: 1, session: "Session 3", packet: "0x0D7F31A9", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:37", value: 23.4, subRows: [{ id: 1, session: "Session 8", packet: "0x89E4C20B", obc_state: "Pending", epc_state: "Received" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:38", value: 34.7, subRows: [{ id: 1, session: "Session 5", packet: "0x3F1A7D96", obc_state: "Received", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:39", value: 42.1, subRows: [{ id: 1, session: "Session 7", packet: "0xB4082EF3", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:40", value: 40.3, subRows: [{ id: 1, session: "Session 9", packet: "0x51DC6A1E", obc_state: "Failed", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:41", value: 41.7, subRows: [{ id: 1, session: "Session 2", packet: "0xE730B58C", obc_state: "Pending", epc_state: "Failed" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:42", value: 39.1, subRows: [{ id: 1, session: "Session 10", packet: "0x208F4D71", obc_state: "Received", epc_state: "Received" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:43", value: 0.43, subRows: [{ id: 1, session: "Session 1", packet: "0x9C3E82B0", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:30:44", value: 0.33, subRows: [{ id: 1, session: "Session 4", packet: "0x47A1F0CD", obc_state: "Failed", epc_state: "Received" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:30:45", value: 0.76, subRows: [{ id: 1, session: "Session 6", packet: "0xDA5B293E", obc_state: "Received", epc_state: "Sent" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:30:46", value: 0.21, subRows: [{ id: 1, session: "Session 3", packet: "0x130CE47A", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:30:47", value: 0.19, subRows: [{ id: 1, session: "Session 8", packet: "0x7E92D1F5", obc_state: "Sent", epc_state: "Failed" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:30:48", value: 4.99, subRows: [{ id: 1, session: "Session 5", packet: "0xBC04783A", obc_state: "Received", epc_state: "Received" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:30:49", value: 25.0, subRows: [{ id: 1, session: "Session 7", packet: "0x4812AFC3", obc_state: "Failed", epc_state: "Sent" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:30:50", value: 29.5, subRows: [{ id: 1, session: "Session 9", packet: "0xF603D28B", obc_state: "Pending", epc_state: "Received" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:30:51", value: 30.1, subRows: [{ id: 1, session: "Session 2", packet: "0x2A7E5190", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:30:52", value: 21.3, subRows: [{ id: 1, session: "Session 10", packet: "0x8D3BF04E", obc_state: "Received", epc_state: "Failed" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:30:53", value: 20.8, subRows: [{ id: 1, session: "Session 1", packet: "0x61C9A273", obc_state: "Failed", epc_state: "Sent" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:30:54", value: 37.2, subRows: [{ id: 1, session: "Session 4", packet: "0x05F8D3BC", obc_state: "Pending", epc_state: "Received" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:30:55", value: 40.5, subRows: [{ id: 1, session: "Session 6", packet: "0xC1E4027F", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:30:56", value: 41.8, subRows: [{ id: 1, session: "Session 3", packet: "0x9A2D85C0", obc_state: "Received", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:30:57", value: 40.2, subRows: [{ id: 1, session: "Session 8", packet: "0x3E71F4A6", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:30:58", value: 38.9, subRows: [{ id: 1, session: "Session 5", packet: "0x7041BCE9", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:30:59", value: 0.46, subRows: [{ id: 1, session: "Session 7", packet: "0xAF83E120", obc_state: "Received", epc_state: "Received" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:00", value: 0.30, subRows: [{ id: 1, session: "Session 9", packet: "0x529C04D7", obc_state: "Sent", epc_state: "Failed" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:01", value: 0.79, subRows: [{ id: 1, session: "Session 2", packet: "0x1B6FA839", obc_state: "Failed", epc_state: "Pending" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:02", value: 0.23, subRows: [{ id: 1, session: "Session 10", packet: "0xE8D25B0C", obc_state: "Pending", epc_state: "Received" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:03", value: 0.16, subRows: [{ id: 1, session: "Session 1", packet: "0x346A7FE2", obc_state: "Received", epc_state: "Sent" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:04", value: 5.01, subRows: [{ id: 1, session: "Session 4", packet: "0xC09B1D58", obc_state: "Sent", epc_state: "Received" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:05", value: 22.8, subRows: [{ id: 1, session: "Session 6", packet: "0x8F2E43A1", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:06", value: 31.5, subRows: [{ id: 1, session: "Session 3", packet: "0x45BD907C", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:07", value: 28.2, subRows: [{ id: 1, session: "Session 8", packet: "0xD71C6EF0", obc_state: "Received", epc_state: "Sent" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:08", value: 19.1, subRows: [{ id: 1, session: "Session 5", packet: "0x603FA284", obc_state: "Sent", epc_state: "Received" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:31:09", value: 22.6, subRows: [{ id: 1, session: "Session 7", packet: "0x2C810D4B", obc_state: "Failed", epc_state: "Pending" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:31:10", value: 35.3, subRows: [{ id: 1, session: "Session 9", packet: "0xB94E75F3", obc_state: "Pending", epc_state: "Failed" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:31:11", value: 41.6, subRows: [{ id: 1, session: "Session 2", packet: "0x7A03C1D9", obc_state: "Received", epc_state: "Received" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:31:12", value: 39.0, subRows: [{ id: 1, session: "Session 10", packet: "0xF15B8E20", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:31:13", value: 42.8, subRows: [{ id: 1, session: "Session 1", packet: "0x3892DAC6", obc_state: "Failed", epc_state: "Received" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:31:14", value: 37.4, subRows: [{ id: 1, session: "Session 4", packet: "0xAE467013", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:31:15", value: 0.44, subRows: [{ id: 1, session: "Session 6", packet: "0x54F9B3E8", obc_state: "Received", epc_state: "Failed" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:16", value: 0.32, subRows: [{ id: 1, session: "Session 3", packet: "0xC82D50A7", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:17", value: 0.80, subRows: [{ id: 1, session: "Session 8", packet: "0x096CE41F", obc_state: "Failed", epc_state: "Received" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:18", value: 0.25, subRows: [{ id: 1, session: "Session 5", packet: "0x71A83B2D", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:19", value: 0.20, subRows: [{ id: 1, session: "Session 7", packet: "0xED1F9C04", obc_state: "Received", epc_state: "Received" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:20", value: 4.96, subRows: [{ id: 1, session: "Session 9", packet: "0x4B70E258", obc_state: "Sent", epc_state: "Failed" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:21", value: 24.5, subRows: [{ id: 1, session: "Session 2", packet: "0x8305AFC1", obc_state: "Failed", epc_state: "Pending" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:22", value: 30.1, subRows: [{ id: 1, session: "Session 10", packet: "0x1E94D73B", obc_state: "Pending", epc_state: "Received" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:23", value: 29.8, subRows: [{ id: 1, session: "Session 1", packet: "0xD6C82E90", obc_state: "Received", epc_state: "Sent" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:24", value: 20.7, subRows: [{ id: 1, session: "Session 4", packet: "0x5F3B01A4", obc_state: "Sent", epc_state: "Received" }] },
    { type: "adcsSensorBoardTemp", timestamp: "2025-10-11 14:31:25", value: 21.2, subRows: [{ id: 1, session: "Session 6", packet: "0xA047F8CE", obc_state: "Failed", epc_state: "Failed" }] },
    { type: "epsBoardTemp", timestamp: "2025-10-11 14:31:26", value: 36.6, subRows: [{ id: 1, session: "Session 3", packet: "0x29B5E31D", obc_state: "Pending", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 1", timestamp: "2025-10-11 14:31:27", value: 40.1, subRows: [{ id: 1, session: "Session 8", packet: "0x6CD07A52", obc_state: "Received", epc_state: "Sent" }] },
    { type: "Solar Panel Temp 2", timestamp: "2025-10-11 14:31:28", value: 41.2, subRows: [{ id: 1, session: "Session 5", packet: "0xF28193E0", obc_state: "Sent", epc_state: "Received" }] },
    { type: "Solar Panel Temp 3", timestamp: "2025-10-11 14:31:29", value: 39.8, subRows: [{ id: 1, session: "Session 7", packet: "0x3A6EB4C7", obc_state: "Failed", epc_state: "Pending" }] },
    { type: "Solar Panel Temp 4", timestamp: "2025-10-11 14:31:30", value: 40.6, subRows: [{ id: 1, session: "Session 9", packet: "0xBC940D2F", obc_state: "Pending", epc_state: "Failed" }] },
    { type: "epsComms5vCurrent", timestamp: "2025-10-11 14:31:31", value: 0.48, subRows: [{ id: 1, session: "Session 2", packet: "0x758AF16B", obc_state: "Received", epc_state: "Received" }] },
    { type: "epsComms3vCurrent", timestamp: "2025-10-11 14:31:32", value: 0.28, subRows: [{ id: 1, session: "Session 10", packet: "0x1047CE93", obc_state: "Sent", epc_state: "Sent" }] },
    { type: "epsMagnetTorquer8vCurrent", timestamp: "2025-10-11 14:31:33", value: 0.77, subRows: [{ id: 1, session: "Session 1", packet: "0xE8B23F40", obc_state: "Failed", epc_state: "Received" }] },
    { type: "epsAdc5vCurrent", timestamp: "2025-10-11 14:31:34", value: 0.20, subRows: [{ id: 1, session: "Session 4", packet: "0x4D619A0E", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "epsAdc3vCurrent", timestamp: "2025-10-11 14:31:35", value: 0.18, subRows: [{ id: 1, session: "Session 6", packet: "0x92FE5C71", obc_state: "Received", epc_state: "Failed" }] },
    { type: "epsComms5vVoltage", timestamp: "2025-10-11 14:31:36", value: 5.00, subRows: [{ id: 1, session: "Session 3", packet: "0x3708B4DA", obc_state: "Sent", epc_state: "Pending" }] },
    { type: "cc1120 Temp", timestamp: "2025-10-11 14:31:37", value: 23.2, subRows: [{ id: 1, session: "Session 8", packet: "0xCB51E027", obc_state: "Failed", epc_state: "Received" }] },
    { type: "commsTemp", timestamp: "2025-10-11 14:31:38", value: 31.9, subRows: [{ id: 1, session: "Session 5", packet: "0x6A3D8F1C", obc_state: "Pending", epc_state: "Sent" }] },
    { type: "obcTemp", timestamp: "2025-10-11 14:31:39", value: 27.9, subRows: [{ id: 1, session: "Session 7", packet: "0xF094C2B8", obc_state: "Received", epc_state: "Received" }] },
    { type: "adcsMagBoardTemp", timestamp: "2025-10-11 14:31:40", value: 19.8, subRows: [{ id: 1, session: "Session 9", packet: "0x2BE76A05", obc_state: "Sent", epc_state: "Failed" }] },
];

const data: telemetryData[] = rawData.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp),
}));

const columnHelper = createColumnHelper<telemetryData>();

const columns = [
    columnHelper.display({
        id: "type",
        header: "Type",
        enableSorting: false,
        cell: (info) => {
            const row = info.row.original;
            const isChild = info.row.depth > 0;
            return (
                <div
                    style={{ paddingLeft: `${info.row.depth * 1}rem` }}
                    className="flex items-center gap-1"
                >
                    {info.row.getCanExpand() ? (
                        <button onClick={info.row.getToggleExpandedHandler()}>
                            {info.row.getIsExpanded() ? "▼ " : "▶ "}
                        </button>
                    ) : (
                        <span className="w-3" />
                    )}
                    {isChild
                        ? <div className="border-b-2 border-t-2 border-[#898989] py-2 text-left w-full">
                            <p>ID: {row.id}</p>
                            <p>{row.session}</p>
                            <p>Packet: {row.packet}</p>
                            <p>OBC_State: {row.obc_state}</p>
                            <p>EPS_State: {row.epc_state}</p>
                        </div> 
                        : row.type}
                </div>
            );
        },
    }),
    columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (info) => info.row.original.timestamp?.toLocaleString(),
        sortingFn: "datetime",
    }),
    columnHelper.accessor("value", {
        header: "Value",
        cell: (info) => info.row.original.value,
        sortingFn: "basic",
    }),
];

function Telemetry() {
    const type: string = "< log >";
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
    const scrollRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        state: { sorting, expanded },
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    const rows = table.getRowModel().rows;

    useEffect(() => {
        if (selectedRowId === null) return;
        const row = rowRefs.current.get(selectedRowId);
        const container = scrollRef.current;
        if (!row || !container) return;

        const rowTop = row.offsetTop;
        const rowBottom = rowTop + row.offsetHeight;
        const visibleTop = container.scrollTop;
        const visibleBottom = visibleTop + container.clientHeight;
        const theadHeight = container.querySelector("thead")?.offsetHeight ?? 0;

        if (rowTop < visibleTop + theadHeight) {
            container.scrollTop = rowTop - theadHeight;
        } else if (rowBottom > visibleBottom) {
            container.scrollTop = rowBottom - container.clientHeight;
        }
    }, [selectedRowId]);

    return (
        <div>
            <div
                id="outline"
                className="border-2 border-[#898989] rounded-2xl py-2 px-3 h-[88vh] flex flex-col overflow-hidden"
            >
                <div id="header" className="flex flex-row w-full gap-4 items-center">
                    <span className="italic font-bold">{type}</span>
                </div>

                <div
                    ref={scrollRef}
                    className="overflow-y-auto flex-1 outline-none"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (selectedRowId === null) {
                                setSelectedRowId(rows[0]?.id ?? null);
                            } else {
                                const currentIdx = rows.findIndex(r => r.id === selectedRowId);
                                const next = rows[Math.min(currentIdx + 1, rows.length - 1)];
                                setSelectedRowId(next?.id ?? null);
                            }
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (selectedRowId === null) {
                                setSelectedRowId(rows[0]?.id ?? null);
                            } else {
                                const currentIdx = rows.findIndex(r => r.id === selectedRowId);
                                const prev = rows[Math.max(currentIdx - 1, 0)];
                                setSelectedRowId(prev?.id ?? null);
                            }
                        }
                    }}
                >
                    <table className="w-full">
                        <thead className="sticky top-0 bg-black z-10">
                            <tr className="flex flex-row border-b-2 border-[#898989] gap-2 text-center pb-1">
                                <td className="flex flex-row justify-between pl-2 w-1/2">
                                    {table.getFlatHeaders()
                                        .filter(header => ["type", "timestamp"].includes(header.id))
                                        .map(header => (
                                            <th
                                                key={header.id}
                                                className={`font-normal text-center w-1/2 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
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
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    ref={(el) => {
                                        if (el) rowRefs.current.set(row.id, el);
                                        else rowRefs.current.delete(row.id);
                                    }}
                                    className={`flex flex-row gap-2 py-1 cursor-pointer ${
                                        selectedRowId === row.id ? "bg-white text-[#1C1F1B]" : ""
                                    }`}
                                    onClick={() => setSelectedRowId(row.id)}
                                >
                                    <td className="flex flex-row justify-between pl-2 w-1/2 text-center">
                                        {row.getVisibleCells()
                                            .filter(cell => ["type", "timestamp"].includes(cell.column.id))
                                            .map(cell => (
                                                <span key={cell.id} className="w-1/2">
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