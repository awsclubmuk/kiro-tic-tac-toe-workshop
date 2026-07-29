/**
 * Vitest setup file for global test configuration
 */

import { beforeEach, vi } from 'vitest';
import { config } from '@vue/test-utils';

// ---------------------------------------------------------------------------
// localStorage mock
// happy-dom provides a basic localStorage, but reset it between tests so
// that one test's stored data cannot bleed into another's.
// ---------------------------------------------------------------------------
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// Vue Test Utils global configuration
// ---------------------------------------------------------------------------
config.global.stubs = {};

// Suppress known Vue warnings that are not actionable in unit tests
// (e.g. missing router-link or router-view stubs).
config.global.config.warnHandler = (msg: string) => {
    const suppressed = [
        'Failed to resolve component: router-link',
        'Failed to resolve component: router-view',
    ];
    if (!suppressed.some((s) => msg.includes(s))) {
        console.warn('[Vue warn]:', msg);
    }
};
