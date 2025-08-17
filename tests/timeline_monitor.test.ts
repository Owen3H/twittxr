import { TimelineMonitor } from "../src"

import { expect, test } from "vitest"

test('TimelineMonitor class is setup correctly', () => {
    const cookie = process.env.TWITTER_COOKIE
    expect(cookie).toBeTruthy()
    expect(cookie).toBeTypeOf('string')

    expect(TimelineMonitor.prototype).toHaveProperty('watch')
    expect(TimelineMonitor.prototype).toHaveProperty('unwatch')

    expect(TimelineMonitor.prototype.watch).toBeTypeOf('function')
    expect(TimelineMonitor.prototype.unwatch).toBeTypeOf('function')
})

test('Can watch a valid user without error', () => {
    
})

test('Watching invalid user should throw error', () => {
    
})