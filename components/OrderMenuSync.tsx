"use client";

import { useEffect } from "react";
import { useMenu } from "./MenuProvider";
import { useOrder } from "./OrderProvider";

/**
 * Drops order lines whose dish is no longer on the menu.
 *
 * The order lives in sessionStorage keyed by dish slug, and the owner can now
 * delete or hide a dish mid-service. Without this, the FAB badge would keep
 * counting a dish the OrderSheet has already stopped rendering — the badge
 * says 3, the sheet lists 2.
 */
export function OrderMenuSync() {
  const { itemsBySlug } = useMenu();
  const { order, remove } = useOrder();

  useEffect(() => {
    // An empty index means the menu itself failed to load; pruning then would
    // wipe a legitimate order.
    if (itemsBySlug.size === 0) return;
    for (const id of Object.keys(order)) {
      if (!itemsBySlug.has(id)) remove(id);
    }
  }, [order, itemsBySlug, remove]);

  return null;
}
