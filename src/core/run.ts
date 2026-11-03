// SPDX-License-Identifier: AGPL-3.0-only
import { createEnv } from './dom'
import type { Feature, FeatureStatus, RunningFeature } from './types'

export type Status = Record<string, FeatureStatus>

export interface Controller {
  status(): Status
  stop(): void
}

type Win = Window & typeof globalThis
const STARTED = Symbol.for('wikijs-tweaks.started')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Reads `window.WikiJsTweaks`, starts the features that are enabled in it and
 * returns a controller. Every feature is off unless the configuration turns it on.
 * A second run on the same page does nothing (the script pasted twice).
 */
export function run(features: Feature<any>[], win: Win = window as Win): Controller | null {
  const holder = win as unknown as Record<symbol, unknown>
  if (holder[STARTED]) return holder[STARTED] as Controller

  const raw: unknown = (win as unknown as Record<string, unknown>).WikiJsTweaks
  const config: Record<string, unknown> = isRecord(raw) ? raw : {}
  const warn = (message: string) => console.warn('[wikijs-tweaks]', message)

  const known = new Set(['debug', 'language', ...features.map((f) => f.id)])
  for (const key of Object.keys(config)) if (!known.has(key)) warn(`unknown option "${key}" is ignored`)

  const debug = config.debug === true
  const configured = typeof config.language === 'string' && /^[a-z]{2}$/i.test(config.language) ? config.language : ''
  const language = (configured || win.navigator.language || 'en').slice(0, 2).toLowerCase()
  const env = createEnv(win, language, debug)

  const running = new Map<string, RunningFeature>()
  const disabled = new Set<string>()
  for (const feature of features) {
    const options = config[feature.id]
    if (!isRecord(options) || options.enabled !== true) {
      disabled.add(feature.id)
      continue
    }
    try {
      running.set(feature.id, feature.start(feature.normalize(options, warn), env))
      env.log(`started ${feature.title}`)
    } catch (error) {
      // One broken feature must never take the wiki's page or the other features down.
      warn(`${feature.title} could not start: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const controller: Controller = {
    status() {
      const out: Status = {}
      for (const feature of features) {
        const active = running.get(feature.id)
        out[feature.id] = active ? active.status() : { state: 'disabled', detail: disabled.has(feature.id) ? 'not enabled in the configuration' : 'could not start' }
      }
      return out
    },
    stop() {
      for (const feature of running.values()) feature.stop()
      running.clear()
      delete holder[STARTED]
    },
  }
  holder[STARTED] = controller

  // `WikiJsTweaks.status()` in the browser console shows what is going on.
  const target = isRecord(raw) ? raw : {}
  Object.defineProperty(target, 'status', { value: () => controller.status(), enumerable: false, configurable: true })
  Object.defineProperty(target, 'stop', { value: () => controller.stop(), enumerable: false, configurable: true })
  if (!isRecord(raw)) (win as unknown as Record<string, unknown>).WikiJsTweaks = target
  return controller
}
