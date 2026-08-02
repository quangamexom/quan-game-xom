import { GameItem } from '../types';
import googleSheetData from './googleSheetGames.json';

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4/edit?gid=0#gid=0";
export const DEFAULT_SHEET_ID = "1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4";

export const INITIAL_GAMES: GameItem[] = googleSheetData as GameItem[];

