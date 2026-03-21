import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { menuItems as localMenuItems, MenuItem } from '@/data/menuData';

export interface MenuItemWithUUID extends MenuItem {
  uuid?: string; // UUID from Supabase
}

/**
 * Hook to sync local menu items with Supabase
 * Creates menu items in Supabase if they don't exist
 * Returns menu items with their Supabase UUIDs
 */
export const useMenuSync = () => {
  const [menuItems, setMenuItems] = useState<MenuItemWithUUID[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    syncMenuItems();
  }, []);

  const syncMenuItems = async () => {
    try {
      setLoading(true);

      // Fetch existing menu items from Supabase
      const { data: existingItems, error: fetchError } = await supabase
        .from('menu_items')
        .select('*');

      if (fetchError) throw fetchError;

      const syncedItems: MenuItemWithUUID[] = [];

      // For each local menu item, find or create in Supabase
      for (const localItem of localMenuItems) {
        // Try to find existing item by name
        const existing = existingItems?.find(
          (item) => item.name === localItem.name
        );

        if (existing) {
          // Item exists, use its UUID
          syncedItems.push({
            ...localItem,
            uuid: existing.id,
          });
        } else {
          // Item doesn't exist, create it
          const { data: newItem, error: insertError } = await supabase
            .from('menu_items')
            .insert({
              name: localItem.name,
              description: localItem.description,
              price: localItem.price,
              image_url: localItem.image,
              category: localItem.category,
              available: localItem.available,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating menu item:', localItem.name, insertError);
            // Use local item without UUID as fallback
            syncedItems.push(localItem);
          } else {
            syncedItems.push({
              ...localItem,
              uuid: newItem.id,
            });
          }
        }
      }

      setMenuItems(syncedItems);
      setError(null);
    } catch (err: any) {
      console.error('Error syncing menu:', err);
      setError(err.message);
      // Fallback to local menu items
      setMenuItems(localMenuItems);
    } finally {
      setLoading(false);
    }
  };

  return { menuItems, loading, error, refresh: syncMenuItems };
};

export const getMenuByCategory = (
  items: MenuItemWithUUID[],
  category: MenuItem['category']
) => items.filter((item) => item.category === category);
