CREATE TABLE "auction_bidders" (
	"auction_id" bigint,
	"bidder_address" text NOT NULL,
	CONSTRAINT "auction_bidders_auction_id_bidder_address_pk" PRIMARY KEY("auction_id","bidder_address")
);
--> statement-breakpoint
CREATE TABLE "auction_curators" (
	"auction_id" bigint,
	"curator_address" text NOT NULL,
	CONSTRAINT "auction_curators_auction_id_curator_address_pk" PRIMARY KEY("auction_id","curator_address")
);
--> statement-breakpoint
CREATE TABLE "auction_token_owners" (
	"auction_id" bigint,
	"owner_address" text NOT NULL,
	CONSTRAINT "auction_token_owners_auction_id_owner_address_pk" PRIMARY KEY("auction_id","owner_address")
);
--> statement-breakpoint
CREATE TABLE "auctions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auction_bidders" ADD CONSTRAINT "auction_bidders_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_curators" ADD CONSTRAINT "auction_curators_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_token_owners" ADD CONSTRAINT "auction_token_owners_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bidders_address" ON "auction_bidders" USING btree ("bidder_address");--> statement-breakpoint
CREATE INDEX "idx_curators_address" ON "auction_curators" USING btree ("curator_address");--> statement-breakpoint
CREATE INDEX "idx_token_owners_address" ON "auction_token_owners" USING btree ("owner_address");