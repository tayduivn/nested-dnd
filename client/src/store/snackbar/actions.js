export const POP_SNACK = "POP_SNACK";
export const popSnack = index => ({ type: POP_SNACK, index });

export const PUSH_SNACK = "PUSH_SNACK";
export const pushSnack = snack => ({
	type: PUSH_SNACK,
	snack
});

export const PUSH_SNACKS = "PUSH_SNACKS";
export const pushSnacks = snacks => ({
	type: PUSH_SNACKS,
	snacks
});
