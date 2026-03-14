export type UpsertPromotionState = {
  success: boolean;
  message: string;
};

export const defaultUpsertPromotionState: UpsertPromotionState = {
  success: false,
  message: '',
};
