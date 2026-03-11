-- CreateTable CalendarEvent
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "profesor_id" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "module" TEXT,
    "orden" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_events_profesor_id_idx" ON "calendar_events"("profesor_id");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
