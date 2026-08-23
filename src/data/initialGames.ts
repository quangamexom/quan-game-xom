import { GameItem } from '../types';
import initialGamesData from './initialGames.json';

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM/edit?gid=0#gid=0";
export const DEFAULT_SHEET_ID = "1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM";

export const INITIAL_GAMES: GameItem[] = initialGamesData as unknown as GameItem[];

