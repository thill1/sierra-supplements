/** inventory_movements.source */
export const INVENTORY_SOURCE = {
    adjustment: "adjustment",
    inStore: "in_store",
    restock: "restock",
    webSale: "web_sale",
    admin: "admin",
} as const;

export type InventorySource =
    (typeof INVENTORY_SOURCE)[keyof typeof INVENTORY_SOURCE];
