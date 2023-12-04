/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { PreferenceSchema } from '@theia/core/lib/common/preferences/preference-schema';

export const theiaUpdaterPreferenceSchema: PreferenceSchema = {
    'type': 'object',
    'properties': {
        'updates.reportOnStart': {
            type: 'boolean',
            description: 'Report available updates after application start.',
            default: true
        }
    }
};
