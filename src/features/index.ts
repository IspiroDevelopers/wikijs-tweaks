// SPDX-License-Identifier: AGPL-3.0-only
// The list of features in the bundle. To add one: create a folder next to this file
// and add it here (see docs/development.md).
import type { Feature } from '../core/types'
import { folderIndex } from './folder-index'

export const features: Feature<any>[] = [folderIndex]
