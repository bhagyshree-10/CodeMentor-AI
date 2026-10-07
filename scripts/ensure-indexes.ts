import { ensureIndexes } from '../models/indexes';

async function main() {
  console.log('🔄 Ensuring MongoDB indexes...');
  await ensureIndexes();
  console.log('✅ MongoDB indexes completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error creating indexes:', err);
  process.exit(1);
});
