import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  numeric,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Users ───────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  privyUserId: text('privy_user_id').unique().notNull(),
  starknetAddress: text('starknet_address'),
  email: text('email'),
  displayName: text('display_name'),
  username: text('username').unique(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isCreator: boolean('is_creator').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  buyerOrders: many(orders, { relationName: 'buyerOrders' }),
  creatorOrders: many(orders, { relationName: 'creatorOrders' }),
}))

// ─── Products ────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  shortDescription: text('short_description'),
  descriptionMd: text('description_md'),
  coverImageUrl: text('cover_image_url').notNull(),
  previewImageUrls: text('preview_image_urls').array(),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  fileMimeType: text('file_mime_type'),
  priceUsdc: numeric('price_usdc', { precision: 10, scale: 6 }).notNull(),
  category: text('category'),
  tags: text('tags').array(),
  status: text('status', { enum: ['draft', 'published', 'deleted'] }).default('draft').notNull(),
  salesCount: integer('sales_count').default(0).notNull(),
  totalRevenueUsdc: numeric('total_revenue_usdc', { precision: 10, scale: 6 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.creatorId],
    references: [users.id],
  }),
  orders: many(orders),
}))

// ─── Orders ──────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  buyerId: uuid('buyer_id').references(() => users.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  amountUsdc: numeric('amount_usdc', { precision: 10, scale: 6 }).notNull(),
  starknetTxHash: text('starknet_tx_hash').unique(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: 'buyerOrders',
  }),
  creator: one(users, {
    fields: [orders.creatorId],
    references: [users.id],
    relationName: 'creatorOrders',
  }),
  downloadTokens: many(downloadTokens),
}))

// ─── Download Tokens ─────────────────────────────────────

export const downloadTokens = pgTable('download_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  tokenHash: text('token_hash').unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const downloadTokensRelations = relations(downloadTokens, ({ one }) => ({
  order: one(orders, {
    fields: [downloadTokens.orderId],
    references: [orders.id],
  }),
}))

// ─── Type Exports (inferred from schema) ─────────────────

export type InsertUser = typeof users.$inferInsert
export type SelectUser = typeof users.$inferSelect
export type InsertProduct = typeof products.$inferInsert
export type SelectProduct = typeof products.$inferSelect
export type InsertOrder = typeof orders.$inferInsert
export type SelectOrder = typeof orders.$inferSelect
export type InsertDownloadToken = typeof downloadTokens.$inferInsert
export type SelectDownloadToken = typeof downloadTokens.$inferSelect
