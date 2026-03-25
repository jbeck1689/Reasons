#!/bin/bash
# deploy-all.sh
# Run this from the root of the Public-Reasons repo in Codespaces.
# Requires DATABASE_URL to be set in your environment.
#
# This script:
# 1. Applies the schema change (adds category column to Course)
# 2. Sets existing courses to category "reasoning"
# 3. Imports the Four Noble Truths courses (category: four-noble-truths)
# 4. Imports the Dependent Origination course (category: dependent-origination)
# 5. Verifies everything

set -e  # Stop on any error

# ─── COLORS ───
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════"
echo "  Public Reasons — Full Deployment"
echo "════════════════════════════════════════════════"
echo ""

# ─── CHECK PREREQUISITES ───
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}ERROR: DATABASE_URL is not set.${NC}"
  echo "Run: export DATABASE_URL=\"your-neon-connection-string\""
  exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
  echo -e "${RED}ERROR: Not in the project root. cd to Public-Reasons first.${NC}"
  exit 1
fi

echo -e "${YELLOW}Step 1/6: Pulling latest from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Up to date${NC}"
echo ""

echo -e "${YELLOW}Step 2/6: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 3/6: Applying schema changes (adds category column)...${NC}"
npx prisma db push --accept-data-loss
echo -e "${GREEN}✓ Schema updated${NC}"
echo ""

echo -e "${YELLOW}Step 4/6: Importing Practical Reasoning courses...${NC}"
echo "  These already exist — re-importing ensures category is set to 'reasoning'"
for f in \
  content/course-1-dont-get-tricked.json \
  content/course-2-think-before-you-decide.json \
  content/course-2-rhetorical-devices.json \
  content/course-3-build-your-case.json \
  content/course-5-read-the-room.json \
  content/course-6-numbers-dont-lie.json; do
  if [ -f "$f" ]; then
    echo "  Importing: $(basename $f)"
    npx tsx scripts/import-content.ts "$f"
  else
    echo -e "  ${YELLOW}Skipped (not found): $f${NC}"
  fi
done
echo -e "${GREEN}✓ Practical Reasoning courses imported${NC}"
echo ""

echo -e "${YELLOW}Step 5/6: Importing Buddhist Studies courses...${NC}"
echo "  Four Noble Truths (4 courses):"
for f in \
  content/course-7-something-is-off.json \
  content/course-8-the-engine.json \
  content/course-9-the-clearing.json \
  content/course-10-the-practice.json; do
  if [ -f "$f" ]; then
    echo "  Importing: $(basename $f)"
    npx tsx scripts/import-content.ts "$f"
  else
    echo -e "  ${RED}NOT FOUND: $f${NC}"
  fi
done

echo ""
echo "  Dependent Origination (1 course so far):"
for f in \
  content/do-course-1-avijja.json \
  content/do-course-2-sankhara.json \
  content/do-course-3-vinnana.json; do
  if [ -f "$f" ]; then
    echo "  Importing: $(basename $f)"
    npx tsx scripts/import-content.ts "$f"
  else
    echo -e "  ${RED}NOT FOUND: $f${NC}"
  fi
done
echo -e "${GREEN}✓ Buddhist Studies courses imported${NC}"
echo ""

echo -e "${YELLOW}Step 6/6: Verifying...${NC}"
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function verify() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    select: { title: true, category: true, slug: true, _count: { select: { sequences: true } } }
  });
  console.log('');
  console.log('Published courses:');
  console.log('─────────────────────────────────────────────');
  for (const c of courses) {
    console.log('  [' + c.category + '] ' + c.title + ' (' + c._count.sequences + ' sequences)');
  }
  console.log('');
  console.log('Total: ' + courses.length + ' courses');
  const byCategory = {};
  for (const c of courses) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log('  ' + cat + ': ' + count);
  }
  await prisma.\$disconnect();
}
verify().catch(e => { console.error(e); process.exit(1); });
"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment complete.${NC}"
echo -e "${GREEN}  The Vercel build was triggered by git pull.${NC}"
echo -e "${GREEN}  Content is live immediately (no redeploy needed).${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
