import assert from 'node:assert/strict';
import test from 'node:test';

import { approveProjectConsumers } from './lib/bootstrap-providers.mjs';

test('approveProjectConsumers adds the project without duplicating entries', () => {
  const registry = {
    credentials: {
      'github.perfectly-human': {
        provider: 'github',
        consumers: ['existing'],
      },
      'vercel.perfectly-human': {
        provider: 'vercel',
        consumers: [],
      },
    },
  };

  const updated = approveProjectConsumers(registry, 'new-app', [
    'github.perfectly-human',
    'vercel.perfectly-human',
    'missing.alias',
  ]);

  assert.deepEqual(updated.credentials['github.perfectly-human'].consumers, ['existing', 'new-app']);
  assert.deepEqual(updated.credentials['vercel.perfectly-human'].consumers, ['new-app']);
});
