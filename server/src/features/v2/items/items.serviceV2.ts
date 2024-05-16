import { PrismaClient } from "@prisma/client";
import { Item, ItemDetail } from "../types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import TTLCache from "@isaacs/ttlcache";
import { ItemDTO } from "../../v1/types";

const options = { ttl: 1000 * 60 * 60 * 24 };
const cache = new TTLCache(options);
const listKey = "items-list";

const prisma = new PrismaClient();

export function getItems(): Promise<Item[]> {
  const cacheItems = cache.get<Item[]>(listKey);
  if (cacheItems != undefined) {
    return Promise.resolve(cacheItems);
  }

  return prisma.item
    .findMany({
      select: {
        id: true,
        name: true,
      },
    })
    .then((items) => {
      cache.set(listKey, items);
      return items;
    });
}

export function getItemDetail(itemId: number): Promise<ItemDetail | null> {
  const cacheItem = cache.get<ItemDetail>(itemId);
  if (cacheItem != undefined) {
    return Promise.resolve(cacheItem);
  }

  return prisma.item
    .findFirst({
      where: { id: itemId },
    })
    .then((item) => {
      cache.set(itemId, item);
      return item;
    });
}

export function upsertItem(
  item: ItemDTO,
  itemId?: number | null
): Promise<Item | null> {
  return prisma.item
    .upsert({
      where: {
        id: itemId || -1,
      },
      update: {
        name: item.name,
        description: item.description,
      },
      create: {
        name: item.name,
        description: item.description,
      },
    })
    .then((item) => {
      cache.set(item.id, item);
      cache.delete(listKey);
      return item;
    });
}

export function deleteItem(itemId: number): Promise<Item | null> {
  return prisma.item
    .delete({
      where: { id: itemId },
    })
    .catch((error) => {
      if (
        error instanceof PrismaClientKnownRequestError &&
        (error as PrismaClientKnownRequestError).code == "P2025"
      ) {
        return Promise.resolve(null);
      } else {
        throw error;
      }
    })
    .then((item) => {
      if (item != null) {
        cache.delete(item.id);
        cache.delete(listKey);
      }

      return item;
    });
}
