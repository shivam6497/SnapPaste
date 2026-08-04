import axios from "axios";
import { CreatePasteResponse, CreatePasteRequest, Paste, PasteExistsResponse } from "@snappaste/types";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL || `http://localhost:5000`,
    headers: { 'Content-Type': 'application/json' },
});

export async function createPaste(data: CreatePasteRequest ): Promise<CreatePasteResponse> {
    const res = await api.post<CreatePasteResponse>('/api/paste', data);
    return res.data;
}

export async function getPaste(code: string, password?: string): Promise<Paste> {
    const headers: Record<string, string> = {};
    if(password) {
        headers['x-paste-password'] = password;
    }
    const res = await api.get<Paste>(`/api/paste/${code}`, { headers });
    return res.data;
} 

export async function checkPasteExists(code: string): Promise<PasteExistsResponse> {
    const res = await api.get<PasteExistsResponse>(`/api/paste/${code}/exists`);
    return res.data;
}

export async function deletePaste(code: string): Promise<void> {
    await api.delete(`/api/paste/${code}`);
}