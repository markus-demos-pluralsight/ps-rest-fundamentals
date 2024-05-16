export type Item = {
  id: number;
  name: string;
  thumbnailImageUrl?: string | null;
};

export type ItemDetail = Item & {
  description: string | null;
  staffReview: string | null;
  fullImageUrl?: string | null;
};
