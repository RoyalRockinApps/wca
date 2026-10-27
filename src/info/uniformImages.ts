/**
 * Pictures of the uniform for the Planner's "What to wear" card (off for WCA: see SHOWS_UNIFORM in
 * today.ts). Put pictures in assets/uniforms/ and set them here, e.g.
 * `boys: require('../../assets/uniforms/daily-boys.jpg')`.
 */
import type { ImageSourcePropType } from 'react-native';

export const UNIFORM_IMAGES: Record<'daily' | 'chapel', { boys: ImageSourcePropType | null; girls: ImageSourcePropType | null }> = {
  daily: { boys: null, girls: null },
  chapel: { boys: null, girls: null },
};

/** Where the school's uniforms are bought, if it has an online store. */
export const UNIFORM_STORE = '';
