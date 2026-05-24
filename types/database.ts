export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InventoryMovementType = "INBOUND" | "OUTBOUND";

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      skus: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          sku_code: string;
          attributes: Json;
          image_url: string | null;
          stock_quantity: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          sku_code: string;
          attributes?: Json;
          image_url?: string | null;
          stock_quantity?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          sku_code?: string;
          attributes?: Json;
          image_url?: string | null;
          stock_quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "skus_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_logs: {
        Row: {
          id: string;
          user_id: string;
          sku_id: string;
          type: InventoryMovementType;
          quantity: number;
          previous_stock: number;
          new_stock: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sku_id: string;
          type: InventoryMovementType;
          quantity: number;
          previous_stock: number;
          new_stock: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sku_id?: string;
          type?: InventoryMovementType;
          quantity?: number;
          previous_stock?: number;
          new_stock?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_logs_sku_id_fkey";
            columns: ["sku_id"];
            isOneToOne: false;
            referencedRelation: "skus";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_inventory_transaction: {
        Args: {
          p_user_id: string;
          p_sku_id: string;
          p_operation_type: InventoryMovementType;
          p_quantity: number;
          p_operator: string | null;
          p_notes: string | null;
        };
        Returns: {
          id: string;
          user_id: string;
          sku_id: string;
          type: InventoryMovementType;
          quantity: number;
          previous_stock: number;
          new_stock: number;
          notes: string | null;
          created_at: string;
        };
      };
    };
    Enums: {
      inventory_movement_type: InventoryMovementType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Sku = Database["public"]["Tables"]["skus"]["Row"];
export type InventoryLog = Database["public"]["Tables"]["inventory_logs"]["Row"];
