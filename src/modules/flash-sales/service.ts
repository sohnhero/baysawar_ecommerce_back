import { eq, and, gt, lt, ne } from "drizzle-orm";
import { db } from "../../lib/db";
import { flashSales, flashSaleCampaigns } from "../../db/schema";

export const getActiveCampaign = async () => {
  const now = new Date().toISOString();
  // Find the active campaign that is currently running
  return await db.query.flashSaleCampaigns.findFirst({
    where: (campaigns, { and, eq, gt, lt }) => 
      and(
        eq(campaigns.active, true),
        lt(campaigns.startTime, now),
        gt(campaigns.endTime, now)
      ),
    with: {
      items: {
        with: {
          product: {
            with: {
              category: true,
            }
          }
        }
      }
    }
  });
};

export const getAllCampaigns = async () => {
  return await db.query.flashSaleCampaigns.findMany({
    orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    with: {
      items: {
        with: {
          product: true
        }
      }
    }
  });
};

export const createCampaign = async (campaignData: any, itemsData: any[]) => {
  return await db.transaction(async (tx) => {
    // If this campaign is being set to active, deactivate all others
    if (campaignData.active) {
      await tx.update(flashSaleCampaigns).set({ active: false });
    }

    const [campaign] = await tx.insert(flashSaleCampaigns).values(campaignData).returning();

    if (itemsData && itemsData.length > 0) {
      const items = itemsData.map(item => ({ ...item, campaignId: campaign.id }));
      await tx.insert(flashSales).values(items);
    }

    return campaign;
  });
};

export const updateCampaign = async (id: string, campaignData: any, itemsData?: any[]) => {
  return await db.transaction(async (tx) => {
    // If this campaign is being set to active, deactivate all others
    if (campaignData.active) {
      await tx.update(flashSaleCampaigns).set({ active: false }).where(ne(flashSaleCampaigns.id, id));
    }

    const [campaign] = await tx.update(flashSaleCampaigns)
      .set({ ...campaignData, updatedAt: new Date().toISOString() })
      .where(eq(flashSaleCampaigns.id, id))
      .returning();

    if (itemsData) {
      // Replace existing items for a full sync
      await tx.delete(flashSales).where(eq(flashSales.campaignId, id));
      if (itemsData.length > 0) {
        const items = itemsData.map(item => ({ ...item, campaignId: id }));
        await tx.insert(flashSales).values(items);
      }
    }

    return campaign;
  });
};

export const deleteCampaign = async (id: string) => {
  return await db.delete(flashSaleCampaigns).where(eq(flashSaleCampaigns.id, id));
};
