-- CreateTable
CREATE TABLE "WebsiteRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "site_title" TEXT NOT NULL,
    "meta_title" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "hero_image" TEXT NOT NULL,
    "gallery_1" TEXT NOT NULL,
    "gallery_2" TEXT NOT NULL,
    "build" TEXT NOT NULL,
    "deployed" TEXT NOT NULL,
    "log" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteRow_domain_key" ON "WebsiteRow"("domain");
