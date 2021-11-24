-- DropForeignKey
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_story_id_fkey";

-- DropForeignKey
ALTER TABLE "scenario_approval" DROP CONSTRAINT "scenario_approval_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "story_development" DROP CONSTRAINT "story_development_story_id_fkey";

-- DropForeignKey
ALTER TABLE "story_ready" DROP CONSTRAINT "story_ready_story_id_fkey";

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_approval" ADD CONSTRAINT "scenario_approval_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_ready" ADD CONSTRAINT "story_ready_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_development" ADD CONSTRAINT "story_development_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "scenario.story_id_description_unique" RENAME TO "scenario_story_id_description_key";

-- RenameIndex
ALTER INDEX "scenario_approval.scenario_id_unique" RENAME TO "scenario_approval_scenario_id_key";

-- RenameIndex
ALTER INDEX "story.as_a_i_want_so_that_unique" RENAME TO "story_as_a_i_want_so_that_key";

-- RenameIndex
ALTER INDEX "story.created_at_unique" RENAME TO "story_created_at_key";

-- RenameIndex
ALTER INDEX "story.position_unique" RENAME TO "story_position_key";

-- RenameIndex
ALTER INDEX "story_development.story_id_unique" RENAME TO "story_development_story_id_key";

-- RenameIndex
ALTER INDEX "story_ready.story_id_unique" RENAME TO "story_ready_story_id_key";
