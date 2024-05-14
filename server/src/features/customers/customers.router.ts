import express from "express";
import {
  upsertCustomer,
  deleteCustomer,
  getCustomerDetail,
  getCustomers,
  searchCustomers,
} from "./customers.service";
import {
  customerPOSTRequestSchema,
  customerPUTRequestSchema,
  idUUIDRequestSchema,
  queryRequestSchema,
} from "../types";
import { validate } from "../../middleware/validation.middleware";
import { create } from "xmlbuilder2";
import { getOrdersForCustomer } from "../orders/orders.service";
import { checkRequiredScope } from "../../middleware/auth0.middleware";
import {
  CustomersPermissions,
  SecurityPermissions,
} from "../../config/permissions";

export const customersRouter = express.Router();

customersRouter.get(
  "/",
  checkRequiredScope(CustomersPermissions.Read),
  async (req, res) => {
    const customers = await getCustomers();
    if (req.headers["accept"] == "application/xml") {
      const root = create().ele("customers");
      customers.forEach((i) => {
        root.ele("customer", i);
      });

      res.status(200).send(root.end({ prettyPrint: true }));
    } else {
      res.json(customers);
    }
  }
);

customersRouter.get(
  "/:id",
  checkRequiredScope(CustomersPermissions.Read_Single),
  validate(idUUIDRequestSchema),
  async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const customer = await getCustomerDetail(data.params.id);
    if (customer != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(200).send(create().ele("customer", customer).end());
      } else {
        res.json(customer);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(404)
          .send(create().ele("error", { message: "Customer Not Found" }).end());
      } else {
        res.status(404).json({ message: "Customer Not Found" });
      }
    }
  }
);

customersRouter.get(
  "/:id/orders",
  checkRequiredScope(CustomersPermissions.Read_Single),
  validate(idUUIDRequestSchema),
  async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const orders = await getOrdersForCustomer(data.params.id);
    if (req.headers["accept"] == "application/xml") {
      const root = create().ele("orders");
      orders.forEach((i) => {
        root.ele("order", i);
      });

      res.status(200).send(root.end({ prettyPrint: true }));
    } else {
      res.json(orders);
    }
  }
);

customersRouter.get(
  "/search/:query",
  checkRequiredScope(CustomersPermissions.Read),
  validate(queryRequestSchema),
  async (req, res) => {
    const data = queryRequestSchema.parse(req);
    const customers = await searchCustomers(data.params.query);
    if (req.headers["accept"] == "application/xml") {
      const root = create().ele("customers");
      customers.forEach((i) => {
        root.ele("customer", i);
      });

      res.status(200).send(root.end({ prettyPrint: true }));
    } else {
      res.json(customers);
    }
  }
);

customersRouter.post(
  "/",
  checkRequiredScope(CustomersPermissions.Create),
  validate(customerPOSTRequestSchema),
  async (req, res) => {
    const data = customerPOSTRequestSchema.parse(req);
    const customer = await upsertCustomer(data.body);
    if (customer != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(201).send(create().ele("customer", customer).end());
      } else {
        res.status(201).json(customer);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(500)
          .send(create().ele("error", { message: "Creation failed" }).end());
      } else {
        res.status(500).json({ message: "Creation failed" });
      }
    }
  }
);

customersRouter.delete(
  "/:id",
  checkRequiredScope(SecurityPermissions.Deny),
  validate(idUUIDRequestSchema),
  async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const customer = await deleteCustomer(data.params.id);
    if (customer != null) {
      res.json(customer);
    } else {
      res.status(404).json({ message: "Customer Not Found" });
    }
  }
);

customersRouter.put(
  "/:id",
  checkRequiredScope(CustomersPermissions.Write),
  validate(customerPUTRequestSchema),
  async (req, res) => {
    const data = customerPUTRequestSchema.parse(req);
    const customer = await upsertCustomer(data.body, data.params.id);
    if (customer != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(200).send(create().ele("customer", customer).end());
      } else {
        res.json(customer);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(404)
          .send(create().ele("error", { message: "Customer Not Found" }).end());
      } else {
        res.status(404).json({ message: "Customer Not Found" });
      }
    }
  }
);
