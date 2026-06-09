/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Runner } from '../types';

export const SHEET_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz2pjEdZnY-G5gO3lEZBcEjYz2y2DJef_A_XcUUU7CjTd88tTbOXc4bn8yHkaflQJgArJpFZHRpprh/pub?gid=774877884&single=true&output=tsv';

/**
 * Standardizes distance strings into a consistent display format
 * e.g., "5" -> "5km", "10 km" -> "10km", "21" -> "21km"
 */
export function normalizeDistance(distance: string): string {
  if (!distance) return 'Chưa rõ';
  const clean = distance.trim().toLowerCase();
  
  // Extract number
  const match = clean.match(/^(\d+(\.\d+)?)/);
  if (!match) return distance; // return as is if no number found
  
  const num = match[1];
  return `${num}km`;
}

/**
 * Parses TSV string data into Runner objects
 */
export function parseTSVData(tsvText: string): Runner[] {
  if (!tsvText) return [];
  
  const lines = tsvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse headers and normalize casings/whitespaces
  const headers = lines[0].split('\t').map(h => h.trim().toUpperCase());
  
  // Find column indices
  const userIdx = headers.findIndex(h => h.includes('USER ID') || h.includes('ID') || h.includes('MÃ'));
  const cuLyIdx = headers.findIndex(h => h.includes('CU LY') || h.includes('CỰ LY') || h.includes('DISTANCE'));
  const gioiTinhIdx = headers.findIndex(h => h.includes('GIOI TINH') || h.includes('GIỚI TÍNH') || h.includes('GENDER'));
  const namSinhIdx = headers.findIndex(h => h.includes('NAM SINH') || h.includes('NĂM SINH') || h.includes('BIRTH') || h.includes('YOB'));
  const tuoiIdx = headers.findIndex(h => h.includes('TUOI') || h.includes('TUỔI') || h.includes('AGE'));
  const thoiGianTaoIdx = headers.findIndex(h => h.includes('THOI GIAN TAO') || h.includes('THỜI GIAN TẠO') || h.includes('TIME') || h.includes('CREATED'));

  const runners: Runner[] = [];
  const currentYear = 2026; // System base local year is 2026

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = lines[i].split('\t');
    if (cols.length === 0) continue;

    const userId = userIdx !== -1 ? cols[userIdx]?.trim() : '';
    const cuLyRaw = cuLyIdx !== -1 ? cols[cuLyIdx]?.trim() : '';
    const gioiTinh = gioiTinhIdx !== -1 ? cols[gioiTinhIdx]?.trim() : '';
    const namSinhStr = namSinhIdx !== -1 ? cols[namSinhIdx]?.trim() : '';
    const tuoiStr = tuoiIdx !== -1 ? cols[tuoiIdx]?.trim() : '';
    const thoiGianTao = thoiGianTaoIdx !== -1 ? cols[thoiGianTaoIdx]?.trim() : '';

    // Ignore records without a user ID
    if (!userId) continue;

    let tuoi = 0;
    let namSinh = 0;

    if (tuoiIdx !== -1 && tuoiStr) {
      tuoi = parseInt(tuoiStr, 10) || 0;
    }

    if (namSinhIdx !== -1 && namSinhStr) {
      const parsedNamSinh = parseInt(namSinhStr, 10) || 0;
      if (parsedNamSinh >= 1920 && parsedNamSinh <= currentYear) {
        namSinh = parsedNamSinh;
        if (tuoi === 0) {
          tuoi = currentYear - namSinh;
        }
      }
    }

    if (tuoi > 0 && namSinh === 0) {
      namSinh = currentYear - tuoi;
    }

    const cuLy = normalizeDistance(cuLyRaw);

    runners.push({
      userId,
      cuLy,
      gioiTinh: gioiTinh || 'Chưa rõ',
      namSinh,
      tuoi,
      thoiGianTao: thoiGianTao || 'Chưa rõ',
    });
  }

  return runners;
}

/**
 * Fetches and parses runner data from the Google Sheet URL
 */
export async function fetchRunnerData(): Promise<Runner[]> {
  try {
    const response = await fetch(SHEET_TSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    const tsvText = await response.text();
    return parseTSVData(tsvText);
  } catch (error) {
    console.error('Error fetching runner data:', error);
    throw error;
  }
}
