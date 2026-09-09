/*
  Warnings:

  - You are about to drop the column `category` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Question` table. All the data in the column will be lost.
  - Added the required column `isCorrect` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionSnapshot` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Question_category_idx";

-- DropIndex
DROP INDEX "Question_difficulty_idx";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL,
ADD COLUMN     "questionSnapshot" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "category",
DROP COLUMN "difficulty",
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Question_role_type_isActive_idx" ON "Question"("role", "type", "isActive");
