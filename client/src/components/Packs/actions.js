export const ADD = "PACKS_ADD";
export const FETCH = "PACKS_FETCH";
export const SET = "PACKS_SET";

export const addPack = pack => ({ type: ADD, pack });

export const fetchPacks = () => ({ type: FETCH });

export const setPacks = packs => ({ type: SET, packs });
