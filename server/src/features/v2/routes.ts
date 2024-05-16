import express from "express";
import { itemsRouter } from "./items/items.routerV2";
import { customersRouter } from "../v1/customers/customers.router";
import { ordersRouter } from "../v1/orders/orders.router";
import { validateAccessToken } from "../../middleware/auth0.middleware";

// register routes
export const v2Router = express.Router();

v2Router.use("/items", itemsRouter);

v2Router.use("/customers", validateAccessToken, customersRouter);

v2Router.use("/orders", validateAccessToken, ordersRouter);
