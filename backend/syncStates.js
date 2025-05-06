const State = require('./domain/database/models/State');
const StateMongo = require('./domain/database/models/StateMongo');

async function syncStates() {
  try {
    const states = await State.findAll({ raw: true });

    if (!states.length) {
      console.log('⚠️ Nuk u gjetën shtete në MySQL.');
      return;
    }

    let upsertCount = 0;

    for (const state of states) {
      const filter = { mysqlId: state.id.toString() };
      const update = {
        name: state.name,
        code: state.code,
      };

      const result = await StateMongo.updateOne(filter, { $set: update }, { upsert: true });
      if (result.upsertedCount > 0 || result.modifiedCount > 0) {
        upsertCount++;
      }
    }

    console.log(`✅ U përditësuan ose u shtuan ${upsertCount} shtete në MongoDB me upsert`);
  } catch (err) {
    console.error('❌ Gabim gjatë sinkronizimit me upsert:', err);
  }
}

module.exports = syncStates;
