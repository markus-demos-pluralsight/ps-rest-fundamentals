import { z } from "zod";

export const idNumberRequestSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

export const idUUIDRequestSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const pagingRequestSchema = z.object({
  query: z.object({
    take: z.coerce.number().int().positive(),
    skip: z.coerce.number().int().nonnegative(),
  }),
});

export type Item = {
  id: number;
  name: string;
  imageUrl?: string;
};

export type ItemDetail = Item & {
  description: string | null;
  staffReview: string | null;
};

export const itemDTO = z.object({
  name: z.string(),
  description: z.nullable(z.string()),
});

export type ItemDTO = z.infer<typeof itemDTO>;

export const itemPOSTRequestSchema = z.object({
  body: itemDTO,
});

export const itemPUTRequestSchema = idNumberRequestSchema.merge(
  itemPOSTRequestSchema
);

export const queryRequestSchema = z.object({
  params: z.object({ query: z.string() }),
});

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export const customerDTO = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type CustomerDTO = z.infer<typeof customerDTO>;

export const customerPOSTRequestSchema = z.object({
  body: customerDTO,
});

export const customerPUTRequestSchema = idUUIDRequestSchema.merge(
  customerPOSTRequestSchema
);

export type BasicOrder = {
  id: string;
  status: string;
  createdAt: Date;
};

export type Order = BasicOrder & {
  customer: Customer;
};

export type OrderDetail = Order & {
  items: OrderItem[];
};

export type OrderItem = {
  orderId: string;
  item: Item;
  quantity: number;
};

export const orderItemDTO = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const orderDTO = z.object({
  customerId: z.string().uuid(),
  status: z.optional(z.string()),
});

export const orderPOSTRequestSchema = z.object({
  body: orderDTO,
});

export const orderPUTRequestSchema = idUUIDRequestSchema.merge(
  z.object({
    body: z.object({ status: z.string() }),
  })
);

export const orderItemsDTORequestSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.array(orderItemDTO),
});

export type OrderDTO = z.infer<typeof orderDTO>;

export type orderItemDTO = z.infer<typeof orderItemDTO>;

export const idItemIdUUIDRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    itemId: z.coerce.number().int().positive(),
  }),
});
